
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

@Component({
  selector: 'app-audio-transcriber',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTranscriberComponent {
  cogniAdaptService = inject(CogniAdaptService);

  isRecording = signal(false);
  transcription = signal('');
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordedBlob = signal<Blob | null>(null);

  startRecording(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.isRecording.set(true);
          this.recordedBlob.set(null);
          this.transcription.set('');
          this.mediaRecorder = new MediaRecorder(stream);
          
          this.mediaRecorder.ondataavailable = event => {
            this.audioChunks.push(event.data);
          };
          
          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.recordedBlob.set(audioBlob);
            this.audioChunks = [];
            stream.getTracks().forEach(track => track.stop());
          };
          
          this.mediaRecorder.start();
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          this.cogniAdaptService.error.set('Could not access microphone. Please check permissions.');
        });
    } else {
        this.cogniAdaptService.error.set('Media devices are not supported in this browser.');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  async transcribeAudio(): Promise<void> {
    const blob = this.recordedBlob();
    if (!blob) return;
    
    const audioFile = new File([blob], "recording.webm", { type: 'audio/webm' });
    const result = await this.cogniAdaptService.transcribeAudio(audioFile);
    this.transcription.set(result);
  }
}
