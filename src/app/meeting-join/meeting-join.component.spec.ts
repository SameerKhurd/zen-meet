import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingJoinComponent } from './meeting-join.component';

describe('MeetingJoinComponent', () => {
  let component: MeetingJoinComponent;
  let fixture: ComponentFixture<MeetingJoinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingJoinComponent]
    });
    fixture = TestBed.createComponent(MeetingJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
