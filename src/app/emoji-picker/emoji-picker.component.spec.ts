import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPickerComponent } from './emoji-picker.component';

describe('EmojiPickerComponent', () => {
  let component: EmojiPickerComponent;
  let fixture: ComponentFixture<EmojiPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmojiPickerComponent]
    });
    fixture = TestBed.createComponent(EmojiPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
