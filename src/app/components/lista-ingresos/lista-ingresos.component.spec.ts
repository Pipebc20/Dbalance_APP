import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaIngresosComponent } from './lista-ingresos.component';

describe('ListaIngresosComponent', () => {
  let component: ListaIngresosComponent;
  let fixture: ComponentFixture<ListaIngresosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaIngresosComponent]
    });
    fixture = TestBed.createComponent(ListaIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
