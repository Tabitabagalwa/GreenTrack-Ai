import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  currentLocation = signal<{ lat: number; lng: number } | null>(null);

  async getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.currentLocation.set(loc);
          resolve(loc);
        },
        (err) => reject(err)
      );
    });
  }
}
