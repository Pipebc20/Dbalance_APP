import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RegistrarGastoComponent } from './registrar-gasto/registrar-gasto.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { IngresoComponent } from './components/ingresos/ingresos.component';
import { ListaIngresosComponent } from './components/lista-ingresos/lista-ingresos.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'inicio', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'ingresos', component: ListaIngresosComponent, canActivate: [AuthGuard] },
  { path: 'ingresos/nuevo', component: IngresoComponent, canActivate: [AuthGuard] },
  { path: 'ingresos/:id/editar', component: IngresoComponent, canActivate: [AuthGuard] },
  { path: 'gastos', component: ExpenseListComponent, canActivate: [AuthGuard] },
  { path: 'gastos/nuevo', component: ExpenseFormComponent, canActivate: [AuthGuard] },
  { path: 'gastos/:id/editar', component: ExpenseFormComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
