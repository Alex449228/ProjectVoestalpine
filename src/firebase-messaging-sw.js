importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Inicializar Firebase en el Service Worker usando la configuración de tu proyecto
firebase.initializeApp({
    apiKey: 'AIzaSyD5RR5xDe0RXoa270ars5txS3fuCYxJRkc',
    authDomain: 'venta-autos-60474.firebaseapp.com',
    projectId: 'venta-autos-60474',
    storageBucket: 'venta-autos-60474.appspot.com',
    messagingSenderId: '583389237131',
    appId: '1:583389237131:web:f054df53708a513e1a698e',
    measurementId: "G-26P1JKG22C",
    vapidKey: "BALk8tAKx_aLdXWISbCCk0wm7keJMn7saI6TCXEh1bfYsEew3GvEQGL4KOczXWr7zl6I748-tNELW07NF_OcqTM",
});

// Recuperar una instancia de Firebase Messaging para manejar mensajes en segundo plano
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano:', payload);
  self.registration.showNotification (payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon,
  });
});

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon/favicon.png' // Icono de notificación
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});