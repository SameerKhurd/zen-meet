import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingMainComponent } from './meeting-main.component';

describe('MeetingMainComponent', () => {
  let component: MeetingMainComponent;
  let fixture: ComponentFixture<MeetingMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingMainComponent]
    });
    fixture = TestBed.createComponent(MeetingMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
