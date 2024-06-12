import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingParticipantsComponent } from './meeting-participants.component';

describe('MeetingParticipantsComponent', () => {
  let component: MeetingParticipantsComponent;
  let fixture: ComponentFixture<MeetingParticipantsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingParticipantsComponent]
    });
    fixture = TestBed.createComponent(MeetingParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
