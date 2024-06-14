import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { MediaService, mediaStatus } from 'src/app/services/media.service';
import {
  MeetingService,
  PeerParticipant,
} from 'src/app/services/meeting.service';
import { InvitePeopleDailogComponent } from '../../../dailog-modals/invite-people-dailog/invite-people-dailog.component';
import { MatDialog } from '@angular/material/dialog';
import { connectionStatus } from 'src/app/services/connection/rtc-connection/rtc-connection-abstract/rtc-connection-abstract.service';

@Component({
  selector: 'app-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss'],
})
export class MeetingRoomComponent {
  @ViewChild('meetingTiles') elementView!: ElementRef;
  isExpand = false;
  connectionStatus = connectionStatus;
  tilesHeight = 0;
  tilesWidth = 0;
  videoTileHeight = 250;
  videoTileWidth = 250;
  mediaStatus = mediaStatus;
  currPeerPartcipants: PeerParticipant[] = [];
  meetingSideSection: { section: 'hide' | 'people' | 'message' } = {
    section: 'people',
  };
  screenShareParticipantName = '';

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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.computeTileDimensions();
  }

  openInvitePeopleDialog() {
    this.dialog.open(InvitePeopleDailogComponent);
  }

  private onParticipantEvent() {
    this.currPeerPartcipants = this.meetingService.peerPartcipants.filter(
      (peerParticipant: PeerParticipant) =>
        peerParticipant.connection.status === connectionStatus.CONNECTED ||
        peerParticipant.connection.status === connectionStatus.WAITING
    );

    this.computeTileDimensions();

    if (this.meetingService.screenSharing.isEnabled) {
      if (this.meetingService.screenSharing.isUserScreenSharing) {
        this.mediaService.localScreenShareMediaStream;
        this.screenShareParticipantName = 'You are';
      } else {
        const peerParticipant: PeerParticipant =
          this.meetingService.partcipantsMap[
            this.meetingService.screenSharing.currScreenSharingParticipantId
          ];
        this.screenShareParticipantName = `${peerParticipant.participantName} is`;
      }
    }
  }

  onScreenShareExpand() {
    this.isExpand = !this.isExpand;
    this.computeTileDimensions();
  }

  async onScreenShareToggle() {
    this.meetingService.screenSharing.isUserScreenSharing
      ? this.meetingService.stopScreenShare()
      : this.meetingService.startScreenShare();
  }

  private computeTileDimensions() {
    if (this.isExpand) {
      this.videoTileHeight = Math.floor(
        this.elementView.nativeElement.offsetHeight * 0.9
      );
      this.videoTileWidth = Math.floor(
        this.elementView.nativeElement.offsetWidth * 0.9
      );
    } else {
      let totalParticipants = this.currPeerPartcipants.length;
      if (this.meetingService.screenSharing.isEnabled) {
        totalParticipants++;
      }
      this.tilesHeight = Math.floor(
        this.elementView.nativeElement.offsetHeight * 0.9
      );
      this.tilesWidth = Math.floor(
        this.elementView.nativeElement.offsetWidth * 0.9
      );
      const divideFactor: number = Math.ceil(Math.sqrt(totalParticipants));
      this.videoTileWidth = Math.floor(this.tilesWidth / divideFactor);
      this.videoTileHeight = Math.floor((this.videoTileWidth * 3) / 4);

      if (this.videoTileHeight * divideFactor > this.tilesHeight) {
        this.videoTileHeight = Math.floor(this.tilesHeight / divideFactor);
        this.videoTileWidth = Math.floor((this.videoTileHeight * 4) / 3);
      }
    }
  }

  splitPartcipantName(participantName: string): string {
    participantName = participantName.trim();
    let initials: string = participantName?.length ? participantName[0] : '';
    const whitespaceIndex = participantName.indexOf(' ');
    if (whitespaceIndex > 0) {
      const lastName: string = participantName
        .substring(whitespaceIndex)
        .trim();
      initials += lastName.length ? lastName[0] : '';
    }
    return initials;
  }
}
