import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { api } from '../../config';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterLink,
		Navbar
	],
	templateUrl: './login.html',
	styleUrl: './login.scss'
})
export class Login {

	endpoint: string = api.baseURL;

	email: string = "";
	password: string = "";

	constructor(private router: Router) {}

	loginWithGoogle() {
		window.location.href = this.endpoint + '/auth/google';
	}

	async loginNormal() {
		try {
			const res = await fetch(this.endpoint + "/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: this.email,
					password: this.password
				})
			});

			const data = await res.json();

			if (!data.success) {
				Swal.fire({
					icon: "error",
					title: "เข้าสู่ระบบล้มเหลว",
					text: data.message,
					confirmButtonColor: "#6366F1"
				});
				return;
			}

			localStorage.setItem("token", data.token);

			Swal.fire({
				icon: "success",
				title: "เข้าสู่ระบบสำเร็จ",
				timer: 1200,
				showConfirmButton: false
			}).then(() => {
				this.router.navigate(['/']);
			});

		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "ข้อผิดพลาด",
				text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
				confirmButtonColor: "#DC2626"
			});
		}
	}
}
