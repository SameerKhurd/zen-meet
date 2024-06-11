import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-device-settings-dailog",
  templateUrl: "./device-settings-dailog.component.html",
  styleUrls: ["./device-settings-dailog.component.scss"],
})
export class DeviceSettingsDailogComponent {
  constructor(public dialogRef: MatDialogRef<DeviceSettingsDailogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
