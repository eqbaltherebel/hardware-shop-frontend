import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowDetail } from './borrow-detail';

describe('BorrowDetail', () => {
  let component: BorrowDetail;
  let fixture: ComponentFixture<BorrowDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BorrowDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
