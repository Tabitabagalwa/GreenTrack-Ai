import { ChangeDetectionStrategy, Component, signal, inject, DestroyRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../auth.service';
import { DecimalPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-leaderboard',
  imports: [MatIconModule, DecimalPipe],
  template: `
    <div class="mx-auto max-w-3xl space-y-8">
      <header class="text-center">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-lg shadow-amber-100">
          <mat-icon class="scale-150">emoji_events</mat-icon>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Community Leaderboard</h1>
        <p class="text-slate-500">Celebrating our top environmental contributors.</p>
      </header>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div class="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-500">
            <div class="col-span-2">Rank</div>
            <div class="col-span-6">User</div>
            <div class="col-span-2 text-right">Level</div>
            <div class="col-span-2 text-right">Points</div>
          </div>
        </div>

        <div class="divide-y divide-slate-100">
          @for (user of topUsers(); track user.uid; let i = $index) {
            <div class="grid grid-cols-12 items-center px-6 py-5 transition-colors hover:bg-slate-50">
              <div class="col-span-2">
                @if (i < 3) {
                  <div class="flex h-8 w-8 items-center justify-center rounded-full font-bold" 
                       [class.bg-amber-100]="i === 0" [class.text-amber-600]="i === 0"
                       [class.bg-slate-100]="i === 1" [class.text-slate-600]="i === 1"
                       [class.bg-orange-100]="i === 2" [class.text-orange-600]="i === 2">
                    {{ i + 1 }}
                  </div>
                } @else {
                  <span class="pl-3 font-medium text-slate-400">{{ i + 1 }}</span>
                }
              </div>
              <div class="col-span-6 flex items-center gap-3">
                <img [src]="user.photoURL" [alt]="user.displayName" class="h-10 w-10 rounded-full object-cover border border-slate-200" referrerpolicy="no-referrer">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900">{{ user.displayName }}</span>
                  <div class="flex gap-1">
                    @for (badge of user.badges.slice(0, 2); track badge) {
                      <span class="text-[8px] font-bold uppercase tracking-tighter bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                        {{ badge }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              <div class="col-span-2 text-right font-medium text-slate-600">
                {{ user.level }}
              </div>
              <div class="col-span-2 text-right font-bold text-emerald-600">
                {{ user.points }}
              </div>
            </div>
          } @empty {
            <div class="py-20 text-center text-slate-400">
              <p>Loading the champions...</p>
            </div>
          }
        </div>
      </div>

      <!-- Impact Summary -->
      <div class="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div class="grid gap-8 md:grid-cols-3">
          <div class="text-center">
            <p class="text-4xl font-bold text-emerald-400">{{ totalReports() }}</p>
            <p class="text-xs font-medium uppercase tracking-widest text-slate-400">Reports Made</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-bold text-emerald-400">{{ totalReports() * 0.5 | number:'1.0-1' }}kg</p>
            <p class="text-xs font-medium uppercase tracking-widest text-slate-400">Waste Diverted</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-bold text-emerald-400">{{ topUsers().length }}</p>
            <p class="text-xs font-medium uppercase tracking-widest text-slate-400">Active Heroes</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Leaderboard {
  destroyRef = inject(DestroyRef);
  topUsers = signal<UserProfile[]>([]);
  totalReports = signal(0);

  constructor() {
    const usersQuery = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      this.topUsers.set(users);
    });

    const reportsQuery = query(collection(db, 'reports'));
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      this.totalReports.set(snapshot.size);
    });

    this.destroyRef.onDestroy(() => {
      unsubscribeUsers();
      unsubscribeReports();
    });
  }
}
