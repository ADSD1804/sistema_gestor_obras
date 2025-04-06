import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArquitectoComponent } from './arquitecto.component';

describe('ArquitectoComponent', () => {
  let component: ArquitectoComponent;
  let fixture: ComponentFixture<ArquitectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArquitectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArquitectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
