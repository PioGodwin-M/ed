import { ChangeDetectionStrategy, Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';
import { KnowledgeCheckComponent } from '../knowledge-check/knowledge-check.component';
import { VisualConcept } from '../../models/types';

interface ParsedConcept {
  type: 'Default' | 'Mnemonic' | 'Say Aloud' | 'Activity' | 'Challenge';
  text: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'app-transformed-output',
  standalone: true,
  imports: [CommonModule, RouterLink, KnowledgeCheckComponent],
  templateUrl: './transformed-output.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformedOutputComponent implements OnDestroy {
  cogniAdaptService = inject(CogniAdaptService);
  private router = inject(Router);

  content = this.cogniAdaptService.transformedContent;
  profile = computed(() => this.content()?.profile);

  useDyslexicFont = signal(true);
  isSpeaking = signal(false);
  
  constructor() {
    if (!this.content()) {
      this.router.navigate(['/input']);
    }
  }

  ngOnDestroy(): void {
    if (this.isSpeaking()) {
      window.speechSynthesis.cancel();
    }
  }

  toggleDyslexicFont(): void {
    this.useDyslexicFont.update(value => !value);
  }

  speakText(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    if (this.isSpeaking()) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        this.isSpeaking.set(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  getAllTextToSpeak(): string {
    const content = this.content();
    if (!content) return '';
    
    let textToSpeak = `Summary: ${content.summary}. `;
    
    if (content.profile === 'Visual') {
       textToSpeak += 'Main Ideas: ';
       content.concepts.forEach(concept => {
         if (this.isVisualConcept(concept)) {
           textToSpeak += `${concept.title}. ${concept.description}. `;
         }
       });
    } else {
        textToSpeak += 'Main Ideas: ';
        textToSpeak += content.concepts.join('. ');
    }

    return textToSpeak;
  }

  formatBold(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  isVisualConcept(concept: any): concept is VisualConcept {
    return concept && typeof concept === 'object' && 'title' in concept && 'description' in concept;
  }

  parseConcept(concept: string): ParsedConcept {
    if (concept.startsWith('[Mnemonic]:')) {
      return { type: 'Mnemonic', text: concept.replace('[Mnemonic]:', '').trim(), icon: '🧠', title: 'Mnemonic' };
    }
    if (concept.startsWith('[Say Aloud]:')) {
      return { type: 'Say Aloud', text: concept.replace('[Say Aloud]:', '').trim(), icon: '🗣️', title: 'Say Aloud' };
    }
    if (concept.startsWith('[Activity]:')) {
      return { type: 'Activity', text: concept.replace('[Activity]:', '').trim(), icon: '👐', title: 'Activity' };
    }
    if (concept.startsWith('[Challenge]:')) {
      return { type: 'Challenge', text: concept.replace('[Challenge]:', '').trim(), icon: '🏆', title: 'Challenge' };
    }
    return { type: 'Default', text: concept, icon: '', title: '' };
  }
}
