import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

defineCustomElements(window);

// Registrar el service worker para Firebase Messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch((err) => {
      console.error('Error al registrar el Service Worker:', err);
    });

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Permiso de notificaciones concedido.');
        } else {
          console.error('Permiso de notificacion denegado.');
        }
      } catch (error) {
        console.error('Error al solicitar permiso de notificaciones:', error);
      }
    } else {
      console.error('Las notificaciones no son compatibles con este navegador');
    }
  }
}
