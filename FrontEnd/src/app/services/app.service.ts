import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToasterConfig } from 'angular2-toaster';
import {
  NbComponentStatus,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrService,
} from '@nebular/theme';
import { Router } from '@angular/router';

@Injectable()
export class AppService {
    public xhr = null;
    loader: boolean;
    config: ToasterConfig;
    destroyByClick = true;
    duration = 5000;
    hasIcon = true;
    position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
    preventDuplicates = true;
    dateFormat: string = 'MMM d, y';
    
    constructor(
        private http: HttpClient,
        private toastrService: NbToastrService,
        private router: Router
        ) {
        
    }


    public cancelRequest() {
        if (this.xhr && !this.xhr.closed) {
            this.xhr.unsubscribe();
        }
    }

    public get(path) {
       // this.showLoader(true);
        return new Observable(observer => {
        let headers = this.getHeader();
            this.http.get(path, { headers: headers })
            .subscribe(
                repsonse => {
                  //  this.showLoader(false);
                    observer.next(repsonse);
                },
                error => {
                    this.checkAPIAuthorized(error.error.response_code);
                    observer.error(error);
                  //  this.showLoader(false);
                    this.showToast('danger', 'Error', error.error.message);
                    this.checkAPIAuthorized(error.error.response_code);
                })
        });
    }

    public post(path, payload): Observable<any> {
      //  this.showLoader(true);
        return new Observable(observer => {
            this.xhr = this.http.post(path, payload, { headers: this.getHeader() })
            .subscribe(
                response => {
                    observer.next(response);
                   // this.showLoader(false);
                },
                error => {
                    observer.error(error);
                 //   this.showLoader(false);
                    this.showToast('danger', 'Error', error.error.message);
                    this.checkAPIAuthorized(error.error.response_code);
                });
        });
    }

    public put(path, payload): Observable<any> {
        //this.showLoader(true);
        return new Observable(observer => {
            this.http.put(path, payload, { headers: this.getHeader() })
            .subscribe(
                repsonse => { 
                    observer.next(repsonse);
                  //  this.showLoader(false);
                 },
                error => { 
                    observer.error(error);
                   // this.showLoader(false);
                    this.showToast('danger', 'Error', error.error.message);
                    this.checkAPIAuthorized(error.error.response_code);
                }
            );
        });
    }

    public patch(path, payload): Observable<any> {
        //this.showLoader(true);
        return new Observable(observer => {
            this.http.patch(path, payload, { headers: this.getHeader() })
            .subscribe(
                repsonse => { 
                    observer.next(repsonse);
                  //  this.showLoader(false);
                 },
                error => { 
                    observer.error(error);
                   // this.showLoader(false);
                    this.showToast('danger', 'Error', error.error.message);
                    this.checkAPIAuthorized(error.error.response_code);
                }
            );
        });
    }

    public delete(path) {
       // this.showLoader(true);
        return new Observable(observer => {
            this.http.delete(path, { headers: this.getHeader() })
            .subscribe(
                repsonse => { 
                    observer.next(repsonse);
                  //  this.showLoader(false);
                },
                error => { 
                    observer.error(error);
                   // this.showLoader(false);
                    this.showToast('danger', 'Error', error.error.message);
                    this.checkAPIAuthorized(error.error.response_code);
                }
            )
        });
    }

    public getHeader() {
        let token: any = localStorage.getItem('userToken') ? localStorage.getItem('userToken') : '';
        const headers: any = new HttpHeaders({ 'Authorization': token });
        return headers;
    }

    showLoader(showLoader: boolean) {
        document.getElementById('loading').style.display = showLoader ? 'block' : 'none';
    }

    showToast(type: NbComponentStatus, title: string, body: string) {
        const config = {
          status: type,
          destroyByClick: this.destroyByClick,
          duration: this.duration,
          hasIcon: this.hasIcon,
          position: this.position,
          preventDuplicates: this.preventDuplicates,
        };
        const titleContent = title ? title : '';
    
        this.toastrService.show(
          body,
          titleContent,
          config);
    }

    checkAPIAuthorized(responseCode){
        if(responseCode == 401){
            this.logout();
        }
    }

    logout(){
        localStorage.clear();
        this.router.navigate(["auth/login"]);
    }

}
