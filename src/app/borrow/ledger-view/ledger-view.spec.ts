import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerView } from './ledger-view';

describe('LedgerView', () => {
  let component: LedgerView;
  let fixture: ComponentFixture<LedgerView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedgerView],
    }).compileComponents();

    fixture = TestBed.createComponent(LedgerView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
