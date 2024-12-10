import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  pages = [
    {title: 'Inicio', url: '/main/home', icon: 'home-outline'},
    {title: 'Perfil', url: '/main/profile', icon: 'person-outline'},
    {title: 'Sobre Nosotros', url: '/main/about-us', icon: 'information-circle-outline'},
  ]

  // Array de colores para las iniciales
  colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FF9F80', '#9B59B6', '#3498DB', '#2ECC71', 
    '#F1C40F', '#E67E22', '#E74C3C', '#1ABC9C',
    '#8E44AD', '#D35400', '#27AE60', '#2980B9',
    '#F39C12', '#C0392B', '#16A085', '#7F8C8D'
];

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if(event?.url) this.currentPath = event.url;
    })
  }

// Obtener las iniciales del usuario (nombre y apellido)
getUserInitial(): string {
  const user = this.user();
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
  const user = this.user();
  if (!user?.name) return this.colors[0];
  
  // Usa la suma de los códigos ASCII de las letras del nombre para elegir un color
  const charSum = user.name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return this.colors[charSum % this.colors.length];
}


  // --------- Cerrar sesion -------------
  signOut() {
    this.firebaseSvc.signOut();
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }
}