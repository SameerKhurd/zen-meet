import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitePeopleDailogComponent } from './invite-people-dailog.component';

describe('InvitePeopleDailogComponent', () => {
  let component: InvitePeopleDailogComponent;
  let fixture: ComponentFixture<InvitePeopleDailogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvitePeopleDailogComponent]
    });
    fixture = TestBed.createComponent(InvitePeopleDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
