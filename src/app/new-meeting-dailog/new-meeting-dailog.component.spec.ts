import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeetingDailogComponent } from './new-meeting-dailog.component';

describe('NewMeetingDailogComponent', () => {
  let component: NewMeetingDailogComponent;
  let fixture: ComponentFixture<NewMeetingDailogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewMeetingDailogComponent]
    });
    fixture = TestBed.createComponent(NewMeetingDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
