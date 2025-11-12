import { Routes } from '@angular/router';

// auth
import { LandingPage } from './auth/landing-page/landing-page';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

//component-member
import { TourDetails } from './component-member/tour-details/tour-details';
import { ListPages } from './component-member/list-pages/list-pages';

export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'register', component: Register},
    {path: 'login', component: Login},
    {path: 'tour-details', component: TourDetails},
    {path: 'list-pages', component: ListPages}



];
