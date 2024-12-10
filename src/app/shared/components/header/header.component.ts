// header.component.ts
import { Component, inject, Input, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() backButton: string | null = null;
  @Input() isModal!: boolean;

  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  dismissModal() {
    this.utilsSvc.dismissModal();
  }

  // Método para verificar si debemos mostrar el menú
  shouldShowMenu(): boolean {
    return !this.isModal && !this.backButton;
  }
}