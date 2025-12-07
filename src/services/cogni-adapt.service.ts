import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CognitiveProfile, TransformedContent, QuizQuestion, VisualConcept } from '../models/types';
import { GoogleGenAI, Type, Chat, GenerateVideosOperation } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class CogniAdaptService {
  private readonly router = new Router();
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  
  // State Signals
  selectedProfile = signal<CognitiveProfile | null>(null);
  inputText = signal<string>('');
  transformedContent = signal<TransformedContent | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
     const apiKey = this.getApiKey();
     if (!apiKey || apiKey === '__VITE_GEMINI_API_KEY__') {
       console.error('VITE_GEMINI_API_KEY is not set. Please add it to your environment variables.');
     }
     this.ai = new GoogleGenAI({apiKey});
     this.loadProfileFromStorage();
  }

  private getApiKey(): string {
    // Try multiple ways to get the API key
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env.VITE_GEMINI_API_KEY || '';
      }
    } catch (e) {
      console.warn('Could not access import.meta.env');
    }
    return '';
  }

  private loadProfileFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
        const savedProfile = localStorage.getItem('cognitiveProfile') as CognitiveProfile;
        const validProfiles: CognitiveProfile[] = ['ADHD', 'Dyslexia', 'Visual', 'Auditory', 'Kinesthetic', 'Autism'];
        if (savedProfile && validProfiles.includes(savedProfile)) {
            this.selectedProfile.set(savedProfile);
        }
    }
  }

  selectProfile(profile: CognitiveProfile): void {
    this.selectedProfile.set(profile);
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cognitiveProfile', profile);
    }
    this.router.navigate(['/input']);
  }

  async transformText(text: string): Promise<void> {
    const profile = this.selectedProfile();
    if (!profile || !text) {
      this.error.set('Profile or text is missing.');
      return;
    }

    this.inputText.set(text);
    this.isLoading.set(true);
    this.error.set(null);
    this.transformedContent.set(null);

    try {
      const prompt = this.getPromptForProfile(profile, text);
      const schema = this.getSchemaForProfile(profile);

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        },
      });
      
      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString) as Omit<TransformedContent, 'profile'>;
      this.transformedContent.set({ ...result, profile });
      this.router.navigate(['/output']);
    } catch (e) {
      console.error('Error transforming text:', e);
      this.error.set('Failed to transform content. Please check your API key and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  initializeChat(): void {
    if (this.chat) return;

    this.chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are Cogni-Chat, a friendly and helpful AI assistant for the Cogni-Adapt application. Your goal is to help users understand complex topics by providing clear, concise, and accessible explanations. Avoid jargon and be encouraging.',
        },
    });
  }

  async *sendMessageStream(message: string): AsyncGenerator<string> {
    if (!this.chat) {
        this.initializeChat();
    }
    
    this.error.set(null);

    try {
        const responseStream = await this.chat!.sendMessageStream({ message });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (e) {
        console.error('Error sending message:', e);
        this.error.set('Failed to get a response from the chatbot. Please try again.');
        yield 'Sorry, I encountered an error. Please try again.';
    }
  }
  
  private async fileToGenerativePart(file: File): Promise<{ mimeType: string; data: string }> {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      mimeType: file.type,
      data: await base64EncodedDataPromise,
    };
  }

  async analyzeImage(prompt: string, imageFile: File): Promise<string> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const fileData = await this.fileToGenerativePart(imageFile);
        const imagePart = {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          }
        };
        const textPart = { text: prompt };
        
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ parts: [textPart, imagePart] }],
        });
        return response.text;
      } catch (e) {
        console.error('Error analyzing image:', e);
        this.error.set('Failed to analyze image.');
        return '';
      } finally {
        this.isLoading.set(false);
      }
  }

  async transcribeAudio(audioFile: File): Promise<string> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const fileData = await this.fileToGenerativePart(audioFile);
        const audioPart = {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        };
        const textPart = { text: "Transcribe the following audio." };

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ parts: [textPart, audioPart] }],
        });
        return response.text;
      } catch (e) {
        console.error('Error transcribing audio:', e);
        this.error.set('Failed to transcribe audio.');
        return 'Transcription failed.';
      } finally {
        this.isLoading.set(false);
      }
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<string> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const response = await this.ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
          },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      } catch (e) {
        console.error('Error generating image:', e);
        this.error.set('Failed to generate image.');
        return '';
      } finally {
        this.isLoading.set(false);
      }
  }

  async *animateImage(prompt: string, imageFile: File, aspectRatio: '16:9' | '9:16'): AsyncGenerator<{ status: string; videoUrl?: string }> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
          yield { status: 'Preparing image for animation...' };
          const imagePart = await this.fileToGenerativePart(imageFile);

          yield { status: 'Starting video generation... This may take several minutes.' };
          let operation: GenerateVideosOperation = await this.ai.models.generateVideos({
              model: 'veo-2.0-generate-001',
              prompt: prompt,
              image: {
                  imageBytes: imagePart.data,
                  mimeType: imagePart.mimeType,
              },
              config: {
                  numberOfVideos: 1,
                  aspectRatio,
              }
          });

          while (!operation.done) {
              yield { status: 'Processing video... Please wait.' };
              await new Promise(resolve => setTimeout(resolve, 10000));
              operation = await this.ai.operations.getVideosOperation({ operation: operation });
          }

          // FIX: The type for operation.response seems to be incorrectly inferred. Using `as any` to bypass the type checker,
          // as the property access path is correct according to the documentation.
          const downloadLink = (operation.response as any)?.generatedVideos?.[0]?.video?.uri;
          if (downloadLink) {
              const apiKey = this.getApiKey();
              const videoUrl = `${downloadLink}&key=${apiKey}`;
              yield { status: 'Complete', videoUrl };
          } else {
              throw new Error('Video generation finished but no download link was provided.');
          }

      } catch (e) {
          console.error('Error animating image:', e);
          this.error.set('Failed to animate image.');
          yield { status: 'Error' };
      } finally {
          this.isLoading.set(false);
      }
  }

  async analyzeVideo(prompt: string, videoFile: File): Promise<string> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const fileData = await this.fileToGenerativePart(videoFile);
        const videoPart = {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        };
        const textPart = { text: prompt };

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ parts: [textPart, videoPart] }],
        });
        return response.text;
      } catch (e) {
        console.error('Error analyzing video:', e);
        this.error.set('Failed to analyze video.');
        return 'Video analysis failed.';
      } finally {
        this.isLoading.set(false);
      }
  }

  private getPromptForProfile(profile: CognitiveProfile, text: string): string {
    const baseInstruction = `You are an AI assistant specialized in adapting educational content for neurodiverse learners. Your task is to transform the provided text for a user with the selected profile. The output must be a valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting (like \`\`\`json) in the JSON output.`;
    
    let profileSpecificInstruction = '';
    switch(profile) {
      case 'ADHD':
        profileSpecificInstruction = `
          Profile: ADHD - "Focus Flow"
          Transform the text with:
          - STRUCTURE: Use a maximum of 2 sentences per bullet point. Group into "chunks" of 3-5 bullets.
          - ENGAGEMENT: Start each concept with a relevant emoji as a visual anchor. Bold **key terms** using markdown.
          - FOCUS AIDS: Include "Why This Matters" or "Quick Win" micro-sections where appropriate.
          
          JSON Requirements:
          - The 'summary' should be short, energetic, and highly engaging.
          - The 'concepts' array must contain strings. Each string is a concise bullet point.
        `;
        break;
      case 'Dyslexia':
        profileSpecificInstruction = `
          Profile: Dyslexia - "Clear Path"
          Transform the text with:
          - TYPOGRAPHY: Ensure one main idea per line or short paragraph. Use extra spacing for visual breathing room.
          - VOCABULARY: Use short sentences (max 15 words) and active voice. Replace complex words with simpler alternatives. Define technical terms immediately in parentheses.
          
          JSON Requirements:
          - The 'summary' should be simple, direct, and easy to read.
          - The 'concepts' array must contain strings. Each string is a short, easily digestible paragraph.
        `;
        break;
      case 'Visual':
        profileSpecificInstruction = `
          Profile: Visual - "Picture Perfect"
          Transform the text by breaking it into core concepts and suggesting visuals for each.
          - VISUAL DESCRIPTIONS: For each concept, describe a helpful visual like a diagram, chart, illustration, or mind map.
          - STRUCTURE: Focus on hierarchy and spatial relationships.
          
          JSON Requirements:
          - The 'summary' should provide a high-level overview.
          - The 'concepts' array must contain objects, each with 'title', 'description', and a creative 'visualIdea' for a helpful diagram, icon, or illustration.
        `;
        break;
      case 'Auditory':
        profileSpecificInstruction = `
          Profile: Auditory - "Sound Learning"
          Transform the text for an auditory learner with:
          - RHYTHM: Write in natural, conversational speaking patterns.
          - ENGAGEMENT: Include verbal mnemonics, rhymes, or acronyms to aid memory. Add "say this out loud" prompts.
          - STRUCTURE: Use a conversational tone, like a podcast script.
          
          JSON Requirements:
          - The 'summary' should be like a podcast intro.
          - The 'concepts' array must contain strings. Use special prefixes for certain concepts: '[Mnemonic]:' for memory aids, '[Say Aloud]:' for verbal prompts.
        `;
        break;
      case 'Kinesthetic':
        profileSpecificInstruction = `
          Profile: Kinesthetic - "Learn by Doing"
          Transform the text for a kinesthetic learner with:
          - ACTIVITIES: For each main concept, suggest a simple, hands-on activity or a real-world application challenge.
          - INTERACTION: Frame concepts as problems to solve or things to build.
          - ENGAGEMENT: Use active, command-oriented language.
          
          JSON Requirements:
          - The 'summary' should set up a challenge or goal.
          - The 'concepts' array must contain strings. Use special prefixes: '[Activity]:' for hands-on tasks, and '[Challenge]:' for real-world application problems.
        `;
        break;
      case 'Autism':
        profileSpecificInstruction = `
          Profile: Autism - "Structured Clarity"
          Transform the text for a learner who thrives on structure and clarity:
          - PREDICTABILITY: Use consistent formatting. No ambiguous language, idioms, or metaphors. Be literal and precise.
          - DETAIL: Break down all processes into logical, numbered, step-by-step instructions.
          - SENSORY: Keep the language direct and unadorned. Focus on facts and patterns.
          
          JSON Requirements:
          - The 'summary' must state the topic and the key takeaways very clearly.
          - The 'concepts' array must contain strings. Each string should be a literal, precise, and logical statement or a step in a process.
        `;
        break;
    }

    const quizInstruction = "The 'questions' array must contain 3-5 multiple-choice questions based on the key concepts in the text. Each question object must have 'question', 'options' (an array of 4 strings), 'correctAnswer' (one of the options), and a brief 'explanation'.";

    return `${baseInstruction}\n${profileSpecificInstruction}\n${quizInstruction}\n\nHere is the text to transform:\n\n${text}`;
  }

  private getSchemaForProfile(profile: CognitiveProfile) {
    const questionSchema = {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswer: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ['question', 'options', 'correctAnswer', 'explanation']
    };

    let conceptsSchema;
    if (profile === 'Visual') {
      conceptsSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            visualIdea: { type: Type.STRING }
          },
          required: ['title', 'description', 'visualIdea']
        }
      };
    } else {
      conceptsSchema = { type: Type.ARRAY, items: { type: Type.STRING } };
    }

    return {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        concepts: conceptsSchema,
        questions: { type: Type.ARRAY, items: questionSchema }
      },
      required: ['summary', 'concepts', 'questions']
    };
  }
}