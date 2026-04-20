import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowDashboard } from './borrow-dashboard';

describe('BorrowDashboard', () => {
  let component: BorrowDashboard;
  let fixture: ComponentFixture<BorrowDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(BorrowDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
