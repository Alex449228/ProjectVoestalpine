import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// ========== Firebase ==============
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // Para Firestore
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Para autenticación

import { environment } from 'src/environments/environment.prod';
import { GoogleMapsModule } from '@angular/google-maps';
import { SharedModule } from './shared/shared.module';
import { FooterComponent } from './shared/components/footer/footer.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { PushNotificationService } from './services/push-notification.service';
import { Camera } from '@capacitor/camera';
import { registerPlugin } from '@capacitor/core';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule, // Importa el módulo Firestore
    AngularFireAuthModule,
    GoogleMapsModule,
    SharedModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PushNotificationService,
    provideFirebaseApp(() => initializeApp({"projectId":"venta-autos-60474",
      "appId":"1:583389237131:web:f054df53708a513e1a698e",
      "storageBucket":"venta-autos-60474.appspot.com",
      "apiKey":"AIzaSyD5RR5xDe0RXoa270ars5txS3fuCYxJRkc",
      "authDomain":"venta-autos-60474.firebaseapp.com",
      "messagingSenderId":"583389237131"})),
    provideMessaging(() => getMessaging())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

registerPlugin('Camera', Camera);
