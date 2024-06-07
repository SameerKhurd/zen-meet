import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingControlButtonComponent } from './meeting-control-button.component';

describe('MeetingControlButtonComponent', () => {
  let component: MeetingControlButtonComponent;
  let fixture: ComponentFixture<MeetingControlButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingControlButtonComponent]
    });
    fixture = TestBed.createComponent(MeetingControlButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
