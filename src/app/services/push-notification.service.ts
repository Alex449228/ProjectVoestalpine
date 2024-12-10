import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(private afMessaging: AngularFireMessaging, private afAuth: AngularFireAuth) {}

  

  // Solicitar permisos de notificación
  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        if (token) {
          console.log('Token recibido:', token);
        } else {
          console.error('No se recibio ningun token.');
        }
      },
      (error) => {
        console.error('Error al obtener el token:', error)
      }
    )
  }
  
  // Suscribirse a notificaciones Push
  private subscribeToPushNotifications() {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BALk8tAKx_aLdXWISbCCk0wm7keJMn7saI6TCXEh1bfYsEew3GvEQGL4KOczXWr7zl6I748-tNELW07NF_OcqTM'
          ), // Cambia por tu clave pública VAPID
        })
        .then((subscription) => {
          console.log('Suscripción creada:', subscription);
          // Aquí podrías enviar la suscripción al servidor backend
        })
        .catch((error) => {
          console.error('Error al suscribirse:', error);
        });
    });
  }

  // Manejar mensajes en segundo plano o en primer plano
  listenToMessages() {
    this.afMessaging.messages.subscribe((message) => {
      console.log('Mensaje recibido:', message);
    });
  }

  // Convertir la clave pública VAPID de Base64 a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}