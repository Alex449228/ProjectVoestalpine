// maps.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements AfterViewInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  readonly LATITUDE = 21.839721;
  readonly LONGITUDE = -102.290450;

  // Segunda ubicación
  readonly SECOND_LATITUDE = 21.858766;
  readonly SECOND_LONGITUDE = -102.311787;

  readonly THIRD_LATITUDE = 21.858893;
  readonly THIRD_LONGITUDE = -102.308844;


  constructor() {}

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    try {
      const coords = new google.maps.LatLng(this.LATITUDE, this.LONGITUDE);
      const secondCoords = new google.maps.LatLng(this.SECOND_LATITUDE, this.SECOND_LONGITUDE);
      const thirdCoords = new google.maps.LatLng(this.THIRD_LATITUDE, this.THIRD_LONGITUDE);

      
      const mapOptions = {
        center: coords,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Primer marcador
      new google.maps.Marker({
        map: this.map,
        position: coords,
        animation: google.maps.Animation.DROP,
      });

      // Segundo marcador
      new google.maps.Marker({
        map: this.map,
        position: secondCoords,
        animation: google.maps.Animation.DROP,
      });

      // Tercer marcador
      new google.maps.Marker({
        map: this.map,
        position: thirdCoords,
        animation: google.maps.Animation.DROP,
      });
    } catch (error) {
      console.error('Error al cargar el mapa:', error);
    }
  }
}
