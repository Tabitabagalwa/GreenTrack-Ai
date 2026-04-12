import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WasteService, WasteReport } from '../waste.service';
import { DatePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map',
  imports: [MatIconModule, DatePipe],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Waste Hotspots</h1>
        <p class="text-slate-500">Real-time visualization of reported waste in your community.</p>
      </header>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Map Placeholder -->
        <div class="lg:col-span-2">
          <div class="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner md:aspect-square lg:aspect-video">
            <!-- Mock Map Background -->
            <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <!-- Map Markers -->
            @for (report of reports(); track report.id) {
              <div class="absolute flex flex-col items-center gap-1 transition-transform hover:scale-110" 
                   [style.left.%]="(report.location.lng + 180) % 100" 
                   [style.top.%]="(90 - report.location.lat) % 100">
                <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg">
                  <mat-icon class="scale-75">location_on</mat-icon>
                </div>
                <div class="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold uppercase shadow-sm backdrop-blur-sm">
                  {{ report.category }}
                </div>
              </div>
            }

            <!-- Map Controls -->
            <div class="absolute bottom-4 right-4 flex flex-col gap-2">
              <button class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md">
                <mat-icon>add</mat-icon>
              </button>
              <button class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md">
                <mat-icon>remove</mat-icon>
              </button>
            </div>

            <div class="absolute top-4 left-4 rounded-xl bg-white/90 p-3 text-xs font-medium shadow-md backdrop-blur-sm">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-emerald-600"></div>
                <span>Waste Reported</span>
              </div>
              <div class="mt-1 flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-blue-600"></div>
                <span>Collection Point</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: List of Reports -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Recent Activity</h2>
          <div class="h-[500px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            @for (report of reports(); track report.id) {
              <div class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                <img [src]="report.imageUrl" [alt]="report.category" class="h-16 w-16 rounded-xl object-cover" referrerpolicy="no-referrer">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-600">{{ report.category }}</span>
                    <span class="text-[10px] text-slate-400">{{ report.timestamp?.toDate() | date:'shortTime' }}</span>
                  </div>
                  <p class="truncate text-sm font-medium text-slate-900">{{ report.reporterName }}</p>
                  <p class="line-clamp-1 text-xs text-slate-500">{{ report.description }}</p>
                </div>
              </div>
            } @empty {
              <div class="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <mat-icon class="mb-2 scale-150">map</mat-icon>
                <p class="text-sm">No reports to show on the map yet.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  `]
})
export class Map {
  wasteService = inject(WasteService);
  destroyRef = inject(DestroyRef);
  reports = signal<WasteReport[]>([]);

  constructor() {
    const unsubscribe = this.wasteService.getReports((data) => {
      this.reports.set(data);
    });
    this.destroyRef.onDestroy(() => unsubscribe());
  }
}
