import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-login',
  imports: [Navbar],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
