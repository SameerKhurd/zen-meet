import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingMessagesComponent } from './meeting-messages.component';

describe('MeetingMessagesComponent', () => {
  let component: MeetingMessagesComponent;
  let fixture: ComponentFixture<MeetingMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingMessagesComponent]
    });
    fixture = TestBed.createComponent(MeetingMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
