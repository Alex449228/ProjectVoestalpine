import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicle.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  user: User;
  products: Vehicle[] = [];

  // Array de colores para las iniciales
  colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FF9F80', '#9B59B6', '#3498DB', '#2ECC71', 
    '#F1C40F', '#E67E22', '#E74C3C', '#1ABC9C',
    '#8E44AD', '#D35400', '#27AE60', '#2980B9',
    '#F39C12', '#C0392B', '#16A085', '#7F8C8D'
];
// Obtener las iniciales del usuario (nombre y apellido)
getUserInitial(): string {
  const user = this.users();
  if (!user?.name) return '?';

  const nameParts = user.name.trim().split(' ');

  // Si solo hay un nombre, devolver la inicial del nombre
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  // Si hay nombre y apellido, devolver la inicial del nombre y apellido
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

// Generar color de fondo basado en el nombre
getInitialBackground(): string {
  const user = this.users();
  if (!user?.name) return this.colors[0];
  
  // Usa la suma de los códigos ASCII de las letras del nombre para elegir un color
  const charSum = user.name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return this.colors[charSum % this.colors.length];
}

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.getProducts();
  }

  getProducts() {
    let path = `users/${this.user.uid}/products`;

    this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        this.products = res;
      }
    });
  }

  async addUpdateProduct(product?: Vehicle) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });
    if (success) this.getProducts();
  }

  async confirmDeleteProduct(product: Vehicle) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });
  }

  async deleteProduct(product: Vehicle) {
    let path = `users/${this.user.uid}/products/${product.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc
      .deleteDocument(path)
      .then(async (res) => {
        this.products = this.products.filter(p => p.id !== product.id);

        this.utilsSvc.presentToast({
          message: 'Producto eliminado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  users(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }
}
