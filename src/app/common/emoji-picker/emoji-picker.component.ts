import { Component, Inject } from "@angular/core";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from "@angular/material/dialog";

@Component({
  selector: "app-emoji-picker",
  templateUrl: "./emoji-picker.component.html",
  styleUrls: ["./emoji-picker.component.scss"],
})
export class EmojiPickerComponent {
  constructor(
    public dialogRef: MatDialogRef<EmojiPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  emojiSelected(event: any) {
    this.data.emoji = event.emoji.native;
    this.dialogRef.close(this.data);
  }
}
