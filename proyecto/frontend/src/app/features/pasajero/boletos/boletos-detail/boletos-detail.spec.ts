import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoletosDetail } from './boletos-detail';

describe('BoletosDetail', () => {
  let component: BoletosDetail;
  let fixture: ComponentFixture<BoletosDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BoletosDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
