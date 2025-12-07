import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CogniAdaptService } from '../../services/cogni-adapt.service';

// To inform TypeScript about the pdf.js library loaded from a script tag
declare var pdfjsLib: any;

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './text-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent {
  cogniAdaptService = inject(CogniAdaptService);
  private router = inject(Router);

  textInput = signal('');
  
  wordCount = computed(() => {
    const text = this.textInput().trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  });

  characterCount = computed(() => this.textInput().length);

  constructor() {
    if(!this.cogniAdaptService.selectedProfile()){
      this.router.navigate(['/profile']);
    }
    
    // Set the workerSrc for pdf.js. This is required for it to work in a browser.
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;
    }
  }

  onTextAreaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.textInput.set(target.value);
  }

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return;
    }

    const file = input.files[0];
    this.textInput.set('Reading file...');

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.textInput.set(e.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      try {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
            }
            this.textInput.set(fullText);
          } catch (pdfError) {
             console.error('Error parsing PDF content:', pdfError);
             alert('Failed to read content from the PDF file.');
             this.textInput.set('');
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error reading PDF file:', error);
        alert('Failed to read the PDF file.');
        this.textInput.set('');
      }
    } else {
      alert('Only .txt and .pdf files are supported.');
      this.textInput.set('');
    }
  }

  transformText(): void {
    if (this.textInput().trim().length > 0) {
      this.cogniAdaptService.transformText(this.textInput());
    }
  }
}