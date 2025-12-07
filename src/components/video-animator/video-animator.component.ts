
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

@Component({
  selector: 'app-video-animator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-animator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoAnimatorComponent {
  cogniAdaptService = inject(CogniAdaptService);

  prompt = signal('Animate this image with subtle motion in the background.');
  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  aspectRatio = signal<'16:9' | '9:16'>('16:9');
  status = signal('');
  videoUrl = signal('');

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

  setAspectRatio(ratio: '16:9' | '9:16'): void {
    this.aspectRatio.set(ratio);
  }

  async animateImage(): Promise<void> {
    const file = this.imageFile();
    const userPrompt = this.prompt();
    if (!file || !userPrompt) return;

    this.videoUrl.set('');
    this.status.set('');
    
    try {
      const stream = this.cogniAdaptService.animateImage(userPrompt, file, this.aspectRatio());
      for await (const update of stream) {
        this.status.set(update.status);
        if (update.videoUrl) {
          this.videoUrl.set(update.videoUrl);
        }
      }
    } catch (e) {
      this.status.set('An error occurred during animation.');
    }
  }
}
