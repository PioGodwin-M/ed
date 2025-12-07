
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

@Component({
  selector: 'app-image-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGeneratorComponent {
  cogniAdaptService = inject(CogniAdaptService);

  prompt = signal('');
  aspectRatio = signal('1:1');
  generatedImageUrl = signal('');

  onPromptInput(event: Event): void {
    this.prompt.set((event.target as HTMLTextAreaElement).value);
  }

  setAspectRatio(ratio: string): void {
    this.aspectRatio.set(ratio);
  }

  async generateImage(): Promise<void> {
    const userPrompt = this.prompt();
    if (!userPrompt) return;
    
    this.generatedImageUrl.set('');
    const result = await this.cogniAdaptService.generateImage(userPrompt, this.aspectRatio());
    this.generatedImageUrl.set(result);
  }
}
