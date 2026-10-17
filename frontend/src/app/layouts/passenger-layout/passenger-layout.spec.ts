import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassengerLayout } from './passenger-layout';

describe('PassengerLayout', () => {
  let component: PassengerLayout;
  let fixture: ComponentFixture<PassengerLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(PassengerLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
