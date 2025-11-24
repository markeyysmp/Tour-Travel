import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { api } from '../../config';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  endpoint = api.baseURL;

  // โหมด form
  mode: 'member' | 'company' = 'member';
  currentStep = 1;

  // Dropdown ธนาคาร
  open = false;
  selectedBank: any = null;

  banks = [
    { name: 'ธนาคารไทยพาณิชย์ (SCB)', icon: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_sb@2x.png' },
    { name: 'ธนาคารกรุงเทพ (BBL)', icon: 'https://e7.pngegg.com/pngimages/660/334/png-clipart-bangkok-bank-thai-baht-mobile-banking-banco-de-oro-securities-blue-angle-thumbnail.png' }
  ];

  // ฟอร์มสมาชิก
  member = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  };

  // ฟอร์มบริษัท
  company = {
    firstname: '',
    lastname: '',
    email: '',
    companyName: '',
    taxId: '',
    phone: '',
    line: '',
    bank: '',
    bankNumber: '',
    bankAccountName: '',
    companyAddress: '',
    password: '',
    passwordConfirm: '',
    document: null as File | null
  };

  // เปลี่ยนโหมด member / company
  setMode(mode: 'member' | 'company') {
    this.mode = mode;
    this.currentStep = 1;
  }

  // STEP
  nextStep() { this.currentStep = 2; }
  prevStep() { this.currentStep = 1; }

  // เลือกธนาคาร
  selectBank(bank: any) {
    this.selectedBank = bank;
    this.company.bank = bank.name;
    this.open = false;
  }

  // ส่งฟอร์มสมาชิก
  async submitMember(): Promise<void> {
    if (!this.member.firstname || !this.member.lastname || !this.member.email ||
      !this.member.password || !this.member.passwordConfirm) {
      await Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    if (this.member.password !== this.member.passwordConfirm) {
      await Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบอีกครั้ง', 'error');
      return;
    }

    const res = await fetch(this.endpoint + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...this.member,
        regType: "email"
      })
    });

    const data = await res.json();

    if (!data.success) {
      await Swal.fire('สมัครไม่สำเร็จ', data.message, 'error');
      return;
    }

    await Swal.fire('สำเร็จ!', 'สมัครสมาชิกเรียบร้อย', 'success');
  }


  // ส่งฟอร์มบริษัท
  async submitCompany(): Promise<void> {

    if (!this.company.firstname || !this.company.lastname ||
        !this.company.email || !this.company.companyName ||
        !this.company.phone || !this.company.password ||
        !this.company.passwordConfirm) {
      await Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    if (!this.company.document) {
      await Swal.fire('ยังไม่ได้แนบเอกสาร', 'กรุณาอัปโหลดเอกสารบริษัท', 'warning');
      return;
    }

    if (this.company.password !== this.company.passwordConfirm) {
      await Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบอีกครั้ง', 'error');
      return;
    }

    const form = new FormData();
    for (const key in this.company) {
      if (key !== "document") {
        form.append(key, (this.company as any)[key]);
      }
    }
    form.append("document", this.company.document!);

    const res = await fetch(this.endpoint + "/auth/register-company", {
      method: "POST",
      body: form
    });

    const data = await res.json();

    if (!data.success) {
      await Swal.fire('สมัครไม่สำเร็จ', data.message, 'error');
      return;
    }

    await Swal.fire('สำเร็จ!', 'สมัครบริษัทเรียบร้อย', 'success');
  }
}
