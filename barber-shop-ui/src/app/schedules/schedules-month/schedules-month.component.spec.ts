import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesMonthComponent } from './schedules-month.component';

describe('SchedulesMonthComponent', () => {
  let component: SchedulesMonthComponent;
  let fixture: ComponentFixture<SchedulesMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesMonthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SchedulesMonthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
