import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoletosList } from './boletos-list';

describe('BoletosList', () => {
  let component: BoletosList;
  let fixture: ComponentFixture<BoletosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosList],
    }).compileComponents();

    fixture = TestBed.createComponent(BoletosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
