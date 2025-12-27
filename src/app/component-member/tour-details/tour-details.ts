import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../auth/navbar/navbar';


@Component({
  selector: 'app-tour-details',
  imports: [Navbar,CommonModule],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.scss'
})
export class TourDetails {

}
