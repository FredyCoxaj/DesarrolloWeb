import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutaDetail } from './ruta-detail';

describe('RutaDetail', () => {
  let component: RutaDetail;
  let fixture: ComponentFixture<RutaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RutaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
