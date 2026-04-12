import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { WasteService, WasteReport } from '../waste.service';
import { DatePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  imports: [RouterLink, MatIconModule, DatePipe],
  template: `
    <div class="space-y-8">
      <!-- Welcome Header -->
      <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">
            Hello, {{ authService.profile()?.displayName || 'Eco Warrior' }}!
          </h1>
          <p class="text-slate-500">Track your impact and help keep your community clean.</p>
        </div>
        <a routerLink="/report" class="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95">
          <mat-icon>add_a_photo</mat-icon>
          Report Waste
        </a>
      </header>

      <!-- Stats Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <mat-icon>stars</mat-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Total Points</p>
              <p class="text-2xl font-bold text-slate-900">{{ authService.profile()?.points || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <mat-icon>assignment_turned_in</mat-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Reports Made</p>
              <p class="text-2xl font-bold text-slate-900">{{ reports().length }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <mat-icon>military_tech</mat-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Current Level</p>
              <p class="text-2xl font-bold text-slate-900">{{ authService.profile()?.level || 1 }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <mat-icon>workspace_premium</mat-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Badges</p>
              <p class="text-2xl font-bold text-slate-900">{{ authService.profile()?.badges?.length || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">Recent Reports</h2>
          <a routerLink="/map" class="text-sm font-semibold text-emerald-600 hover:underline">View Map</a>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (report of reports().slice(0, 6); track report.id) {
            <div class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div class="relative h-48 overflow-hidden">
                <img [src]="report.imageUrl" [alt]="report.category" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer">
                <div class="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 backdrop-blur-sm">
                  {{ report.category }}
                </div>
              </div>
              <div class="p-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-500">{{ report.timestamp?.toDate() | date:'mediumDate' }}</span>
                  <span class="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <mat-icon class="scale-75">check_circle</mat-icon>
                    {{ report.status }}
                  </span>
                </div>
                <p class="line-clamp-2 text-sm text-slate-600">{{ report.description }}</p>
              </div>
            </div>
          } @empty {
            <div class="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-12 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <mat-icon class="scale-150">camera_alt</mat-icon>
              </div>
              <h3 class="text-lg font-bold text-slate-900">No reports yet</h3>
              <p class="mb-6 text-slate-500">Be the first to report waste in your area!</p>
              <a routerLink="/report" class="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700">
                Start Reporting
              </a>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class Dashboard {
  authService = inject(AuthService);
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
