import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowForm } from './borrow-form';

describe('BorrowForm', () => {
  let component: BorrowForm;
  let fixture: ComponentFixture<BorrowForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowForm],
    }).compileComponents();

    fixture = TestBed.createComponent(BorrowForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
