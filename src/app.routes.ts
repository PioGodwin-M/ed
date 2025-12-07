
import { Routes } from '@angular/router';
import { ProfileSelectionComponent } from './components/profile-selection/profile-selection.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { TransformedOutputComponent } from './components/transformed-output/transformed-output.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ImageAnalyzerComponent } from './components/image-analyzer/image-analyzer.component';
import { AudioTranscriberComponent } from './components/audio-transcriber/audio-transcriber.component';
import { ImageGeneratorComponent } from './components/image-generator/image-generator.component';
import { VideoAnimatorComponent } from './components/video-animator/video-animator.component';
import { VideoAnalyzerComponent } from './components/video-analyzer/video-analyzer.component';

export const APP_ROUTES: Routes = [
  { path: 'profile', component: ProfileSelectionComponent },
  { path: 'input', component: TextInputComponent },
  { path: 'output', component: TransformedOutputComponent },
  { path: 'chat', component: ChatbotComponent },
  { path: 'image-analyzer', component: ImageAnalyzerComponent },
  { path: 'audio-transcriber', component: AudioTranscriberComponent },
  { path: 'image-generator', component: ImageGeneratorComponent },
  { path: 'video-animator', component: VideoAnimatorComponent },
  { path: 'video-analyzer', component: VideoAnalyzerComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: '**', redirectTo: 'profile' }
];
