import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewClientComponent } from './new-client.component';

describe('NewClient', () => {
  let component: NewClientComponent;
  let fixture: ComponentFixture<NewClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewClientComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewClientComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
