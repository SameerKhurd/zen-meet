import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMeetingDailogComponent } from './join-meeting-dailog.component';

describe('JoinMeetingDailogComponent', () => {
  let component: JoinMeetingDailogComponent;
  let fixture: ComponentFixture<JoinMeetingDailogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinMeetingDailogComponent]
    });
    fixture = TestBed.createComponent(JoinMeetingDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
