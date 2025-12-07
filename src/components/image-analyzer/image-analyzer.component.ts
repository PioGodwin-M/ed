
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

@Component({
  selector: 'app-image-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageAnalyzerComponent {
  cogniAdaptService = inject(CogniAdaptService);

  prompt = signal('Describe this image in detail.');
  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  analysisResult = signal('');
  
  onPromptInput(event: Event): void {
    this.prompt.set((event.target as HTMLTextAreaElement).value);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageFile.set(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeImage(): Promise<void> {
    const file = this.imageFile();
    const userPrompt = this.prompt();
    if (!file || !userPrompt) {
      return;
    }
    this.analysisResult.set('');
    const result = await this.cogniAdaptService.analyzeImage(userPrompt, file);
    this.analysisResult.set(result);
  }
}
