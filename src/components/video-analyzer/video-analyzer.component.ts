
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

@Component({
  selector: 'app-video-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoAnalyzerComponent {
  cogniAdaptService = inject(CogniAdaptService);

  prompt = signal('Summarize this video.');
  videoFile = signal<File | null>(null);
  videoPreviewUrl = signal<string | null>(null);
  analysisResult = signal('');
  
  onPromptInput(event: Event): void {
    this.prompt.set((event.target as HTMLTextAreaElement).value);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.videoFile.set(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        this.videoPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeVideo(): Promise<void> {
    const file = this.videoFile();
    const userPrompt = this.prompt();
    if (!file || !userPrompt) {
      return;
    }
    this.analysisResult.set('');
    const result = await this.cogniAdaptService.analyzeVideo(userPrompt, file);
    this.analysisResult.set(result);
  }
}
