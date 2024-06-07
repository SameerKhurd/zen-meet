import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingStartComponent } from './meeting-start.component';

describe('MeetingStartComponent', () => {
  let component: MeetingStartComponent;
  let fixture: ComponentFixture<MeetingStartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingStartComponent]
    });
    fixture = TestBed.createComponent(MeetingStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
