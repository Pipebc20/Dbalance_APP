import { NgModule } from '@angular/core';
   import { BrowserModule } from '@angular/platform-browser';
   import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
   import { NgChartsModule } from 'ng2-charts';
   import { FormsModule, ReactiveFormsModule } from '@angular/forms';
   import { MatDialogModule } from '@angular/material/dialog';
   import { MatIconModule } from '@angular/material/icon';
   import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Importar NgbModule

   import { AppRoutingModule } from './app-routing.module';
   import { AppComponent } from './app.component';

   // Interceptores
   import { AuthInterceptor } from './interceptors/auth.intenceptor';

   // Servicios
   import { AuthService } from './services/auth.service';

   // Componentes
   import { ExpenseListComponent } from './components/expense-list/expense-list.component';
   import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
   import { HomeComponent } from './components/home/home.component';
   import { NavbarComponent } from './components/navbar/navbar.component';
   import { LoginComponent } from './components/login/login.component';
   import { RegistroComponent } from './components/registro/registro.component';
   import { IngresoComponent } from './components/ingresos/ingresos.component';
   import { ListaIngresosComponent } from './components/lista-ingresos/lista-ingresos.component';
   import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

   // Traducción
   import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
   import { TranslateHttpLoader } from '@ngx-translate/http-loader';
   import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

   export function HttpLoaderFactory(http: HttpClient) {
     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
   }

   @NgModule({
     declarations: [
       AppComponent,
       ExpenseListComponent,
       ExpenseFormComponent,
       HomeComponent,
       NavbarComponent,
       LoginComponent,
       RegistroComponent,
       IngresoComponent,
       ListaIngresosComponent,
       ConfirmDialogComponent
     ],
     imports: [
       BrowserModule,
       AppRoutingModule,
       MatDialogModule,
       MatIconModule,
       NgChartsModule,
       HttpClientModule,
       FormsModule,
       ReactiveFormsModule,
       NgbModule, // Añadir NgbModule
       TranslateModule.forRoot({
         defaultLanguage: 'es',
         loader: {
           provide: TranslateLoader,
           useFactory: HttpLoaderFactory,
           deps: [HttpClient]
         }
       }),
       BrowserAnimationsModule
     ],
     providers: [
       AuthService,
       {
         provide: HTTP_INTERCEPTORS,
         useClass: AuthInterceptor,
         multi: true
       }
     ],
     bootstrap: [AppComponent]
   })
   export class AppModule { }
