import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-auth-callback',
	standalone: true,
	template: `<p class="p-4 font-kanit">กำลังเข้าสู่ระบบ...</p>`
})
export class AuthCallback implements OnInit {

	constructor(private route: ActivatedRoute, private router: Router) {}

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			const token = params['token'];
			const error = params['error'];

			if (error) {
				Swal.fire({
					icon: 'error',
					title: 'ไม่สามารถเข้าสู่ระบบได้',
					text: error,
					confirmButtonText: 'กลับไปหน้าเข้าสู่ระบบ',
				}).then(() => {
					this.router.navigate(['/login']);
				});
				return;
			}

			if (token) {
				localStorage.setItem('token', token);

				Swal.fire({
					icon: 'success',
					title: 'เข้าสู่ระบบสำเร็จ',
					showConfirmButton: false,
					timer: 1200
				});

				this.router.navigate(['/']);
			}
		});
	}
}
