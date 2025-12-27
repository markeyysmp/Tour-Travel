import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
