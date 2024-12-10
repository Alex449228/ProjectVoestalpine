import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
  collectionData,
  query,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  getDocs
} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getStorage,
  uploadString,
  ref,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  // ======== Autenticación de los usuarios ===========
  getAuth() {
    return getAuth();
  }

  // ======== Acceder a la app ========
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ======== Registrar o crear usuario ========
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ======== Actualizar el usuario ========
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  // ======== Enviar email para restablecer el password ========
  async sendRecoveryEmail(email: string) {
    try {
      await sendPasswordResetEmail(getAuth(), email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('user-not-found');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('invalid-email');
      } else {
        throw new Error('unknown-error');
      }
    }
  }

  // ======== Cerrar sesión ===========
  async signOut() {
    try {
      await getAuth().signOut();
      localStorage.removeItem('user');
      this.utilsSvc.routerLink('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  }

  // ======== Base de datos ===========

  // ========== Obtener todos los productos para el Home ==========
  getAllProducts(): Observable<any[]> {
    // Crear un array para almacenar todos los productos
    let allProducts = [];
    
    // Obtener referencia a la colección de usuarios
    const usersRef = collection(getFirestore(), 'users');
    
    // Query para obtener todos los documentos de productos
    return new Observable(observer => {
      getDocs(usersRef).then(async userSnapshots => {
        for (const userDoc of userSnapshots.docs) {
          // Para cada usuario, obtener su colección de productos
          const productsRef = collection(getFirestore(), `users/${userDoc.id}/products`);
          const productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
          
          const productsSnapshot = await getDocs(productsQuery);
          const products = productsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          
          allProducts = [...allProducts, ...products];
        }
        
        // Ordenar todos los productos por fecha de creación
        allProducts.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        observer.next(allProducts);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // ========== Mostrar datos de la publicacion ============
  getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, ...[collectionQuery].filter(q => q)), { idField: 'id' });
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  // ========== Actualizar ==========
  async updateDocument(path: string, data: any) {
    const user = this.utilsSvc.getFromLocalStorage('user');
    const dataWithSeller = {
      ...data,
      sellerName: user.name || user.displayName,
      sellerUid: user.uid,
      sellerEmail: user.email,
      updatedAt: new Date().toISOString()
    };
    return updateDoc(doc(getFirestore(), path), dataWithSeller);
  }

  // ========== Eliminar ==========
  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  // ============== Obtener datos del usuario cuando ingresa ===================
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // ========= Subir publicaciones ===========
  async addDocument(path: string, data: any) {
    const user = this.utilsSvc.getFromLocalStorage('user');
    const dataWithSeller = {
      ...data,
      sellerName: user.name || user.displayName,
      sellerUid: user.uid,
      sellerEmail: user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return addDoc(collection(getFirestore(), path), dataWithSeller);
  }

  // ========== Almacenamiento =============

  // ========== Subir imagenes ==============
  async uploadImage(path: string, data_url: string) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  // ============ Obtener ruta img con su URL ================
  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  // ========== Eliminar archivos storage =============
  deleteFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }
}