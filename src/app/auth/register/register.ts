import { Component } from '@angular/core';

import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [Navbar, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
    open = false;
  selectedBank: any = null;

  banks = [
  { name: 'ธนาคารไทยพาณิชย์ (SCB)', icon: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_sb@2x.png' },
  { name: 'ธนาคารกรุงเทพ (BBL)', icon: 'https://e7.pngegg.com/pngimages/660/334/png-clipart-bangkok-bank-thai-baht-mobile-banking-banco-de-oro-securities-blue-angle-thumbnail.png' }
];
selectBank(bank: any) {
  if(bank.link) {
    window.open(bank.link, '_blank'); // เปิดลิงก์ในแท็บใหม่
  } else {
    this.selectedBank = bank; // เลือกธนาคารปกติ
  }
  this.open = false;
}


  mode: 'member' | 'company' = 'member';
  currentStep = 1;

  setMode(mode: 'member' | 'company') {
    this.mode = mode;
    this.currentStep = 1; // reset step
  }

  nextStep() {
    this.currentStep = 2;
  }

  prevStep() {
    this.currentStep = 1;
  }
}