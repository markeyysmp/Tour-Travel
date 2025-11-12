import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

import { Navbar } from '../../auth/navbar/navbar';

@Component({
  selector: 'app-list-pages',
  imports: [Navbar, CommonModule,RouterLink],
  templateUrl: './list-pages.html',
  styleUrl: './list-pages.scss'
})
export class ListPages {

}
