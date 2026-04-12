import { Injectable, inject } from '@angular/core';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { AuthService } from './auth.service';

export interface WasteReport {
  id?: string;
  reporterId: string;
  reporterName: string;
  imageUrl: string;
  location: { lat: number; lng: number };
  category: string;
  description: string;
  status: 'pending' | 'verified' | 'cleaned';
  pointsAwarded: number;
  timestamp: Timestamp | any;
}

@Injectable({
  providedIn: 'root'
})
export class WasteService {
  private authService = inject(AuthService);

  async classifyWaste(base64Image: string): Promise<{ category: string; disposalInstruction: string; recyclabilityScore: number }> {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    if (!response.ok) {
      throw new Error('Classification failed');
    }

    return await response.json();
  }

  async submitReport(base64Image: string, classification: { category: string; disposalInstruction: string }, location: { lat: number; lng: number }) {
    const user = this.authService.user();
    if (!user) throw new Error('User not authenticated');

    // 1. Upload image to Storage
    const fileName = `reports/${user.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    await uploadString(storageRef, base64Image, 'base64', { contentType: 'image/jpeg' });
    const imageUrl = await getDownloadURL(storageRef);

    // 2. Save report to Firestore
    const report: WasteReport = {
      reporterId: user.uid,
      reporterName: user.displayName || 'Anonymous',
      imageUrl,
      location,
      category: classification.category,
      description: classification.disposalInstruction,
      status: 'pending',
      pointsAwarded: 10, // Base points for reporting
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'reports'), report);
    
    // 3. Award points to user
    await this.authService.addPoints(10);
    
    return docRef.id;
  }

  getReports(callback: (reports: WasteReport[]) => void) {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WasteReport));
      callback(reports);
    }, (error) => {
      console.error("Firestore Error in getReports: ", error);
    });
  }
}
