import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

			if (token) {
				localStorage.setItem('token', token);
				this.router.navigate(['/']);
			}
		});
	}
}
