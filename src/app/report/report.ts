import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WasteService } from '../waste.service';
import { MapService } from '../map.service';
import { AuthService } from '../auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-report',
  imports: [MatIconModule, RouterLink],
  template: `
    <div class="mx-auto max-w-2xl space-y-8">
      <header class="flex items-center gap-4">
        <a routerLink="/" class="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Report Waste</h1>
      </header>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <!-- Step 1: Capture Image -->
        @if (!capturedImage()) {
          <div class="flex flex-col items-center justify-center gap-6 py-12">
            <div class="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <mat-icon class="scale-[2]">camera_alt</mat-icon>
              <div class="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                <mat-icon>add</mat-icon>
              </div>
            </div>
            <div class="text-center">
              <h2 class="text-lg font-bold text-slate-900">Snap a photo</h2>
              <p class="text-sm text-slate-500">Take a clear picture of the waste to classify it.</p>
            </div>
            
            <div class="flex w-full flex-col gap-3">
              <button (click)="fileInput.click()" class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 active:scale-95">
                <mat-icon>upload</mat-icon>
                Upload Photo
              </button>
              <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
            </div>
          </div>
        } @else {
          <!-- Step 2: Classification -->
          <div class="space-y-6">
            <div class="relative aspect-square overflow-hidden rounded-2xl border border-slate-200">
              <img [src]="capturedImage() || ''" alt="Captured waste" class="h-full w-full object-cover">
              <button (click)="reset()" class="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            @if (isClassifying()) {
              <div class="flex flex-col items-center justify-center gap-4 py-8">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
                <div class="text-center">
                  <p class="font-bold text-slate-900">AI is analyzing...</p>
                  <p class="text-xs text-slate-500">Identifying material and disposal methods</p>
                </div>
              </div>
            } @else if (classification(); as result) {
              <div class="space-y-4 rounded-2xl bg-emerald-50 p-5 border border-emerald-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <mat-icon class="scale-75">auto_awesome</mat-icon>
                    </div>
                    <span class="font-bold text-emerald-900">AI Classification</span>
                  </div>
                  <span class="rounded-full bg-emerald-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    {{ result.category }}
                  </span>
                </div>
                <p class="text-sm text-emerald-800 leading-relaxed">{{ result.disposalInstruction }}</p>
                <div class="flex items-center gap-4 pt-2">
                  <div class="flex-1">
                    <div class="mb-1 flex justify-between text-[10px] font-bold uppercase text-emerald-700">
                      <span>Recyclability</span>
                      <span>{{ result.recyclabilityScore }}%</span>
                    </div>
                    <div class="h-1.5 w-full rounded-full bg-emerald-200">
                      <div class="h-full rounded-full bg-emerald-600" [style.width.%]="result.recyclabilityScore"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-3">
                <button (click)="submit()" [disabled]="isSubmitting()" class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-95">
                  @if (isSubmitting()) {
                    <div class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Submitting...
                  } @else {
                    <mat-icon>send</mat-icon>
                    Submit Report & Earn 10 Points
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class Report {
  private wasteService = inject(WasteService);
  private mapService = inject(MapService);
  private authService = inject(AuthService);
  private router = inject(Router);

  capturedImage = signal<string | null>(null);
  isClassifying = signal(false);
  isSubmitting = signal(false);
  classification = signal<{ category: string; disposalInstruction: string; recyclabilityScore: number } | null>(null);

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        this.capturedImage.set(result);
        await this.classify(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  async classify(base64: string) {
    this.isClassifying.set(true);
    try {
      const result = await this.wasteService.classifyWaste(base64);
      this.classification.set(result);
    } catch (error) {
      console.error('Classification failed', error);
    } finally {
      this.isClassifying.set(false);
    }
  }

  async submit() {
    const classification = this.classification();
    const image = this.capturedImage();
    if (!image || !classification) return;
    
    this.isSubmitting.set(true);
    try {
      const location = await this.mapService.getUserLocation();
      const base64 = image.split(',')[1];
      await this.wasteService.submitReport(base64, classification, location);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  reset() {
    this.capturedImage.set(null);
    this.classification.set(null);
  }
}
