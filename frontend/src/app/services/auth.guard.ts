import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestOnlyGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	if (auth.isLogin()) {
		router.navigate(['/']);
		return false;
	}
	return true;
};

export const authGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	if (!auth.isLogin()) {
		router.navigate(['/login']);
		return false;
	}
	return true;
};

export const adminGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	if (!auth.isAdmin()) {
		router.navigate(['/']);
		return false;
	}
	return true;
};

export const companyGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	if (!auth.isCompany()) {
		router.navigate(['/']);
		return false;
	}
	return true;
};
