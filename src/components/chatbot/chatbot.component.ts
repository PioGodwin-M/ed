import { ChangeDetectionStrategy, Component, inject, signal, AfterViewChecked, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CogniAdaptService } from '../../services/cogni-adapt.service';
import { ChatMessage } from '../../models/types';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  cogniAdaptService = inject(CogniAdaptService);
  
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  ngOnInit(): void {
    this.cogniAdaptService.initializeChat();
    if (this.messages().length === 0) {
      this.messages.set([
        { sender: 'bot', text: 'Hello! How can I help you understand your study material today?' }
      ]);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onUserInput(event: Event) {
    this.userInput.set((event.target as HTMLInputElement).value);
  }

  async sendMessage(): Promise<void> {
    const messageText = this.userInput().trim();
    if (!messageText || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { sender: 'user', text: messageText }]);
    this.userInput.set('');
    this.isLoading.set(true);
    
    this.messages.update(msgs => [...msgs, { sender: 'bot', text: '', isStreaming: true }]);

    try {
      const stream = this.cogniAdaptService.sendMessageStream(messageText);
      for await (const chunk of stream) {
        this.messages.update(msgs => {
          const newMsgs = [...msgs];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.sender === 'bot') {
            lastMsg.text += chunk;
          }
          return newMsgs;
        });
      }
    } catch (e) {
      this.messages.update(msgs => {
        const newMsgs = [...msgs];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg) {
           lastMsg.text = 'Sorry, something went wrong. Please try again later.';
        }
        return newMsgs;
      });
    } finally {
      this.messages.update(msgs => {
        const newMsgs = [...msgs];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg) {
          lastMsg.isStreaming = false;
        }
        return newMsgs;
      });
      this.isLoading.set(false);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer?.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // It's okay if this fails sometimes during view checks
    }
  }
}
