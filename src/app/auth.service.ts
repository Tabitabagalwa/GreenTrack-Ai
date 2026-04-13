import { Injectable, signal, computed } from '@angular/core';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  points: number;
  level: number;
  badges: string[];
  createdAt: Timestamp | any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<FirebaseUser | null>(null);
  private profileSignal = signal<UserProfile | null>(null);
  
  user = computed(() => this.userSignal());
  profile = computed(() => this.profileSignal());
  isAuthenticated = computed(() => !!this.userSignal());
  isAuthReady = signal(false);

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.userSignal.set(user);
      if (user) {
        await this.syncProfile(user);
      } else {
        this.profileSignal.set(null);
      }
      this.isAuthReady.set(true);
    });
  }

  async login() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await this.syncProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async logout() {
    await signOut(auth);
  }

  private async syncProfile(user: FirebaseUser) {
    const userRef = doc(db, 'gt_users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Eco Warrior',
        email: user.email || '',
        photoURL: user.photoURL || '',
        points: 0,
        level: 1,
        badges: ['Newcomer'],
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newProfile);
      this.profileSignal.set(newProfile);
    } else {
      this.profileSignal.set(userSnap.data() as UserProfile);
    }
  }

  async addPoints(amount: number) {
    const currentProfile = this.profileSignal();
    if (currentProfile) {
      const newPoints = currentProfile.points + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const userRef = doc(db, 'gt_users', currentProfile.uid);
      
      const updates = {
        points: newPoints,
        level: newLevel
      };
      
      await setDoc(userRef, updates, { merge: true });
      this.profileSignal.update(p => p ? { ...p, ...updates } : null);
    }
  }
}
