export type CognitiveProfile = 'ADHD' | 'Dyslexia' | 'Visual' | 'Auditory' | 'Kinesthetic' | 'Autism';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VisualConcept {
  title: string;
  description: string;
  visualIdea: string;
}

export interface TransformedContent {
  summary: string;
  concepts: (string | VisualConcept)[];
  questions: QuizQuestion[];
  profile: CognitiveProfile;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
}
