import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutasList } from './rutas-list';

describe('RutasList', () => {
  let component: RutasList;
  let fixture: ComponentFixture<RutasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutasList],
    }).compileComponents();

    fixture = TestBed.createComponent(RutasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
