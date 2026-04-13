import { Injectable, signal, computed } from '@angular/core';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
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
    this.checkEmailSignIn();
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

  private async checkEmailSignIn() {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Veuillez confirmer votre e-mail pour terminer la connexion');
      }
      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          await this.syncProfile(result.user);
        } catch (error) {
          console.error('Error signing in with email link', error);
          alert('Erreur lors de la connexion avec le lien e-mail.');
        }
      }
    }
  }

  async sendLoginLink(email: string) {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('Un lien de connexion a été envoyé à votre adresse e-mail !');
    } catch (error: any) {
      console.error('Error sending email link', error);
      alert(`Erreur : ${error.message}`);
    }
  }

  async login() {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Attempting login with Google...');
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful, syncing profile...', result.user.uid);
      await this.syncProfile(result.user);
      console.log('Profile synced successfully');
    } catch (error: any) {
      console.error('Login failed details:', {
        code: error.code,
        message: error.message,
        customData: error.customData
      });
      alert(`Erreur de connexion : ${error.message}`);
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
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Eco Warrior')}&background=random`,
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
