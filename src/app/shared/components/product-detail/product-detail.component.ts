// product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service'; 
import { UtilsService } from 'src/app/services/utils.service'; 
import { Vehicle } from 'src/app/models/vehicle.model'; 

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Vehicle;
  loading: boolean = true;
  productId: string;

  constructor(
    private route: ActivatedRoute,
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      await this.getProduct();
    }
  }

  async getProduct() {
    try {
      this.loading = true;
      
      // Obtener todos los productos
      const products = await this.firebaseSvc.getAllProducts().toPromise();
      
      // Encontrar el producto específico por ID
      this.product = products.find(p => p.id === this.productId);
      
      if (!this.product) {
        this.utilsSvc.presentToast({
          message: 'Producto no encontrado',
          duration: 2500,
          color: 'warning',
          position: 'middle'
        });
        this.utilsSvc.routerLink('/home');
      }
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'warning',
        position: 'middle'
      });
    } finally {
      this.loading = false;
    }
  }

  // Método para contactar al vendedor
  contactSeller() {
    if (this.product?.sellerEmail) {
      window.location.href = `mailto:${this.product.sellerEmail}?subject=Consulta sobre ${this.product.marca} ${this.product.modelo}`;
    }
  }
}