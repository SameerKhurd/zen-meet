import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSettingsDailogComponent } from './device-settings-dailog.component';

describe('DeviceSettingsDailogComponent', () => {
  let component: DeviceSettingsDailogComponent;
  let fixture: ComponentFixture<DeviceSettingsDailogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceSettingsDailogComponent]
    });
    fixture = TestBed.createComponent(DeviceSettingsDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
