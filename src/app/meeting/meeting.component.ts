import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { MediaService, mediaStatus } from "../services/media.service";
import { MeetingService } from "../services/meeting.service";

@Component({
  selector: "app-meeting",
  templateUrl: "./meeting.component.html",
  styleUrls: ["./meeting.component.scss"],
})
export class MeetingComponent implements AfterViewInit {
  @ViewChild("meetingTiles") elementView!: ElementRef;
  tilesHeight = 0;
  tilesWidth = 0;
  videoTileHeight = 250;
  videoTileWidth = 250;
  mediaStatus = mediaStatus;

  meetingSideSection: { section: "hide" | "people" | "message" } = {
    section: "people",
  };

  tiles: any[] = [
    { text: "One", cols: 3, rows: 1, color: "lightblue" },
    { text: "Two", cols: 1, rows: 2, color: "lightgreen" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
    { text: "Four", cols: 2, rows: 1, color: "#DDBDF1" },
  ];

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService
  ) {}

  ngAfterViewInit() {
    this.computeTileDimensions();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.computeTileDimensions();
  }

  private computeTileDimensions() {
    this.tilesHeight = Math.floor(
      this.elementView.nativeElement.offsetHeight * 0.95
    );
    this.tilesWidth = Math.floor(
      this.elementView.nativeElement.offsetWidth * 0.95
    );
    const divideFactor: number = Math.ceil(
      Math.sqrt(this.meetingService.peerPartcipants.length)
    );
    this.videoTileWidth = Math.floor(this.tilesWidth / divideFactor);
    this.videoTileHeight = Math.floor((this.videoTileWidth * 3) / 4);

    if (this.videoTileHeight * divideFactor > this.tilesHeight) {
      console.log(true);
      this.videoTileHeight = Math.floor(this.tilesHeight / divideFactor);
      this.videoTileWidth = Math.floor((this.videoTileHeight * 4) / 3);
    }
  }

  splitPartcipantName(participantName: string): string {
    participantName = participantName.trim();
    let initials: string = participantName?.length ? participantName[0] : "";
    const whitespaceIndex = participantName.indexOf(" ");
    if (whitespaceIndex > 0) {
      const lastName: string = participantName
        .substring(whitespaceIndex)
        .trim();
      initials += lastName.length ? lastName[0] : "";
    }
    return initials;
  }
}
