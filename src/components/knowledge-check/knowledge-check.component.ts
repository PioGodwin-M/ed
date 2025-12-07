import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizQuestion } from '../../models/types';

@Component({
  selector: 'app-knowledge-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knowledge-check.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeCheckComponent {
  questions = input.required<QuizQuestion[]>();

  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | null>(null);
  score = signal(0);
  quizFinished = signal(false);

  selectAnswer(answer: string): void {
    if (this.selectedAnswer() === null) {
      this.selectedAnswer.set(answer);
      if (answer === this.questions()[this.currentQuestionIndex()].correctAnswer) {
        this.score.update(s => s + 1);
      }
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
      this.selectedAnswer.set(null);
    } else {
      this.quizFinished.set(true);
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.score.set(0);
    this.quizFinished.set(false);
  }

  getButtonClass(option: string): string {
    if (this.selectedAnswer() === null) {
      return 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900';
    }
    const currentQ = this.questions()[this.currentQuestionIndex()];
    if (option === currentQ.correctAnswer) {
      return 'bg-green-200 dark:bg-green-800 border-green-500';
    }
    if (this.selectedAnswer() === option && option !== currentQ.correctAnswer) {
      return 'bg-red-200 dark:bg-red-800 border-red-500';
    }
    return 'bg-slate-100 dark:bg-slate-700 opacity-70';
  }
}
