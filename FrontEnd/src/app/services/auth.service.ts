import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
    baseUrl: string = environment.baseUrl ;    
    constructor() {}

    public isUserLoggedIn(){
        let userToken = localStorage.getItem('userToken');
        if( userToken !== null ){
            return true;
        } else {
            return false;
        }
    }    
}