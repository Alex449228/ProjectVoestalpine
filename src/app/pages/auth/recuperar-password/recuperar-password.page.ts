import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
})
export class RecuperarPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      try {
        await this.firebaseSvc.sendRecoveryEmail(this.form.value.email);
  
        this.utilsSvc.presentToast({
          message: 'Correo enviado con éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'mail-outline'
        });
  
        this.utilsSvc.routerLink('/auth');
        this.form.reset();
      } catch (error) {
        switch (error.message) {
          case 'user-not-found':
            this.utilsSvc.presentToast({
              message: 'No existe una cuenta asociada a este correo electrónico.',
              duration: 2500,
              color: 'warning',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
            break;
          case 'invalid-email':
            this.utilsSvc.presentToast({
              message: 'El correo electrónico ingresado no es válido.',
              duration: 2500,
              color: 'warning',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
            break;
          default:
            this.utilsSvc.presentToast({
              message: 'Error al enviar el correo de recuperación. Por favor, intente nuevamente.',
              duration: 2500,
              color: 'danger',
              position: 'middle',
              icon: 'alert-circle-outline'
            });
        }
      } finally {
        loading.dismiss();
      }
    }
  }
  
}