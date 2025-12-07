import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CogniAdaptService } from '../../services/cogni-adapt.service';
import { CognitiveProfile } from '../../models/types';

interface Profile {
  type: CognitiveProfile;
  name: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-profile-selection',
  standalone: true,
  templateUrl: './profile-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSelectionComponent {
  private cogniAdaptService = inject(CogniAdaptService);

  profiles: Profile[] = [
    { type: 'ADHD', name: 'ADHD Focus', icon: '🎯', description: 'Bite-sized summaries, key points, and focus tools.', color: 'border-blue-500' },
    { type: 'Dyslexia', name: 'Dyslexia Friendly', icon: '📖', description: 'Clear fonts, simpler text, and audio options.', color: 'border-amber-500' },
    { type: 'Visual', name: 'Visual Learner', icon: '🎨', description: 'Visual breakdowns, mind maps, and concept cards.', color: 'border-teal-500' },
    { type: 'Auditory', name: 'Auditory Learner', icon: '🎧', description: 'Podcast-style summaries, mnemonics, and verbal cues.', color: 'border-purple-500' },
    { type: 'Kinesthetic', name: 'Kinesthetic Learner', icon: '👐', description: 'Hands-on activities and real-world challenges.', color: 'border-orange-500' },
    { type: 'Autism', name: 'Structured Clarity', icon: '🧩', description: 'Literal, predictable, and logically structured content.', color: 'border-green-500' },
  ];

  selectProfile(profile: CognitiveProfile): void {
    this.cogniAdaptService.selectProfile(profile);
  }
}
