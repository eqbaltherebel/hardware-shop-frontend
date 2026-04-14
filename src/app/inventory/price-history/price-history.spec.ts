import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceHistory } from './price-history';

describe('PriceHistory', () => {
  let component: PriceHistory;
  let fixture: ComponentFixture<PriceHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
