import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PncVerification } from './pnc-verification';

describe('PncVerification', () => {
  let component: PncVerification;
  let fixture: ComponentFixture<PncVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PncVerification],
    }).compileComponents();

    fixture = TestBed.createComponent(PncVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
