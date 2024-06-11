import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { MediaService, mediaStatus } from "../services/media.service";
import { MeetingService, PeerParticipant } from "../services/meeting.service";
import { connectionStatus } from "../services/connection.service";
import { InvitePeopleDailogComponent } from "../invite-people-dailog/invite-people-dailog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-meeting",
  templateUrl: "./meeting.component.html",
  styleUrls: ["./meeting.component.scss"],
})
export class MeetingComponent implements AfterViewInit {
  @ViewChild("meetingTiles") elementView!: ElementRef;
  connectionStatus = connectionStatus;
  tilesHeight = 0;
  tilesWidth = 0;
  videoTileHeight = 250;
  videoTileWidth = 250;
  mediaStatus = mediaStatus;
  currPeerPartcipants: PeerParticipant[] = [];
  meetingSideSection: { section: "hide" | "people" | "message" } = {
    section: "people",
  };

  constructor(
    public mediaService: MediaService,
    public meetingService: MeetingService,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.onParticipantEvent();

    this.meetingService.participantEvent.subscribe((event: boolean) => {
      this.onParticipantEvent();
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.computeTileDimensions();
  }

  openInvitePeopleDialog() {
    this.dialog.open(InvitePeopleDailogComponent);
  }

  private onParticipantEvent() {
    this.currPeerPartcipants = this.meetingService.peerPartcipants.filter(
      (peerParticipant: PeerParticipant) =>
        peerParticipant.connection.status !== connectionStatus.CLOSED
    );
    this.computeTileDimensions();
  }

  private computeTileDimensions() {
    this.tilesHeight = Math.floor(
      this.elementView.nativeElement.offsetHeight * 0.9
    );
    this.tilesWidth = Math.floor(
      this.elementView.nativeElement.offsetWidth * 0.9
    );
    const divideFactor: number = Math.ceil(
      Math.sqrt(this.currPeerPartcipants.length)
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
