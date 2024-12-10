import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicle.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private pushNotificationService: PushNotificationService, private afAuth: AngularFireAuth) {}

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  products: Vehicle[] = [];
  loading: boolean = false;
  userProducts: Vehicle[] = []; // Productos del usuario actual
  isMyProducts: boolean = false; // Toggle para cambiar entre todos los productos y mis productos
  productId: string | null = null; // ID del producto opcional


  ngOnInit() {
    // Capturamos el ID de producto si está en la ruta
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      console.log('Product ID:', this.productId);
      // Aquí podrías cargar detalles específicos si es necesario
    }

    // Cargar productos iniciales
    this.getAllProducts();

    this.pushNotificationService.requestPermission();
    this.pushNotificationService.listenToMessages();
  }

  mostrarNotificacion() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nuevos autos disponibles', {
        body: 'Esta es una notificacion push',
      });
    } else {
      console.log('No se puede mostrar la notificacion');
    }
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getAllProducts();
    this.getMyProducts(); // Obtenemos también los productos del usuario
  }

  doRefresh(event) {
    setTimeout(() => {
      if (this.isMyProducts) {
        this.getMyProducts();
      } else {
        this.getAllProducts();
      }
      event.target.complete();
    }, 1000);
  }

  // ======= Obtener todos los autos de todos los usuarios ==============
  getAllProducts() {
    this.loading = true;
    let sub = this.firebaseSvc.getAllProducts().subscribe({
      next: (res: any) => {
        console.log('Todos los productos:', res);
        this.products = res;
        this.loading = false;
        sub.unsubscribe();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
        this.utilsSvc.presentToast({
          message: 'Error al cargar los productos',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
    });
  }

  // ======= Obtener los autos del usuario actual ==============
  getMyProducts() {
    let path = `users/${this.user().uid}/products`;
    this.loading = true;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log('Mis productos:', res);
        this.userProducts = res;
        if (this.isMyProducts) {
          this.products = this.userProducts;
        }
        this.loading = false;
        sub.unsubscribe();
      }
    });
  }

  // ======= Toggle entre todos los productos y mis productos ==============
  toggleProductView() {
    this.isMyProducts = !this.isMyProducts;
    this.products = this.isMyProducts ? this.userProducts : [];
    if (this.isMyProducts) {
      this.getMyProducts();
    } else {
      this.getAllProducts();
    }
  }

  // =========== Agregar o actualizar productos ===============
  async addUpdateProduct(product?: Vehicle) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });
    if (success) {
      this.getMyProducts();
      if (!this.isMyProducts) {
        this.getAllProducts(); // Actualizar también la vista general si estamos en ella
      }
    }
  }

  // ========== Confirmar eliminación ============
  async confirmDeleteProduct(product: Vehicle) {
    // Verificar si el producto pertenece al usuario actual
    if (product.sellerUid !== this.user().uid) {
      this.utilsSvc.presentToast({
        message: 'Solo puedes eliminar tus propios productos',
        duration: 2500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }

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

  // =========== Eliminar productos ===============
  async deleteProduct(product: Vehicle) {
    let path = `users/${this.user().uid}/products/${product.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present;

    try {
      let imagePath = await this.firebaseSvc.getFilePath(product.image);
      await this.firebaseSvc.deleteFile(imagePath);

      await this.firebaseSvc.deleteDocument(path);
      
      this.products = this.products.filter(p => p.id !== product.id);
      this.userProducts = this.userProducts.filter(p => p.id !== product.id);

      this.utilsSvc.presentToast({
        message: 'Producto eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      });
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  // ======= Verificar si un producto pertenece al usuario actual ==============
  isUserProduct(product: Vehicle): boolean {
    return product.sellerUid === this.user().uid;
  }

  // Navegar a la página de detalle del producto
  goToProductDetail(productId: string) {
    this.router.navigate(['/product-detail', productId]);
  }

}