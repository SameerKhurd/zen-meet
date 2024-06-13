import { stunServers } from 'src/environments/environment';
import { Subject } from 'rxjs';

export enum connectionStatus {
  NEW = 0,
  CONNECTED = 1,
  CLOSED = 2,
  ERROR = 3,
  WAITING = 4,
}

export abstract class RTCConnectionAbstractService {
  remoteMediaStream!: MediaStream;
  status: connectionStatus = connectionStatus.NEW;
  connectionEvent = new Subject<boolean>();
  audioReceiver: RTCRtpReceiver | any = undefined;
  peerConnection!: RTCPeerConnection;
  isCallAnswered: boolean = false;

  constructor() {
    this.remoteMediaStream = new MediaStream();
  }

  private replaceConnectionMediaTrack(
    localMediaStream: MediaStream,
    getMediaTracksMethod: 'getVideoTracks' | 'getAudioTracks'
  ): void {
    const [currMediaTrack] = localMediaStream[getMediaTracksMethod]();
    const sender = this.peerConnection
      .getSenders()
      .find((s) => s.track?.kind === currMediaTrack.kind);
    sender?.replaceTrack(currMediaTrack);
  }

  updateConnectionVideoMediaTrack(localMediaStream: MediaStream): void {
    this.replaceConnectionMediaTrack(localMediaStream, 'getVideoTracks');
  }

  updateConnectionAudioMediaTrack(localMediaStream: MediaStream): void {
    this.replaceConnectionMediaTrack(localMediaStream, 'getAudioTracks');
  }

  closeConnection() {
    this.removeConnectionEventHandlers();
    this.status = connectionStatus.CLOSED;
  }

  addLocalMediaStreamToMeshConnection(localMediaStream: MediaStream): void {
    localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
      this.peerConnection.addTrack(track, localMediaStream);
    });
  }

  createNewRTCPeerConnection(): RTCPeerConnection {
    const newPeerConnection: RTCPeerConnection = new RTCPeerConnection(
      stunServers
    );
    return newPeerConnection;
  }

  async addIceCandidateToConnection(
    iceCandidate: RTCIceCandidate,
    debug: string
  ): Promise<void> {
    try {
      await this.peerConnection.addIceCandidate(iceCandidate);
    } catch (e: any) {}
  }

  handleIceCandidateEvent(
    candidatesChannel: any,
    meetingId: string,
    connectionId: string,
    sessionId: number
  ): void {
    this.peerConnection.onicecandidate = async (
      event: RTCPeerConnectionIceEvent
    ) => {
      if (event.candidate) {
        const iceCandidate: RTCIceCandidateInit = event.candidate.toJSON();
        await candidatesChannel.publish(
          meetingId,
          connectionId,
          sessionId,
          iceCandidate
        );
      }
    };
  }

  handleIceConnectionStateChangeEvent(localMediaStream: MediaStream): void {
    this.peerConnection.oniceconnectionstatechange = (event: any) => {
      switch (this.peerConnection.iceConnectionState) {
        case 'connected':
          this.status = connectionStatus.CONNECTED;
          //this.addLocalMediaStreamToMeshConnection(localMediaStream);

          //this.stopLocalVideo();
          //this.startLocalVideo();
          break;
        case 'closed':
        case 'failed':
        case 'disconnected':
          this.closeConnection();
          break;
      }
      this.connectionEvent.next(true);
    };
  }

  handleSignalingStateChangeEvent(): void {
    this.peerConnection.onsignalingstatechange = (event: any) => {
      switch (this.peerConnection.signalingState) {
        case 'closed':
          this.closeConnection();
          break;
      }
    };
    this.connectionEvent.next(true);
  }

  private addAudioReciever(): void {
    this.audioReceiver = this.peerConnection.getReceivers().find((r) => {
      return r.track.kind === 'audio';
    });
  }

  handleOnTrackEvent(): void {
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      this.remoteMediaStream = event.streams[0];
      this.addAudioReciever();
    };
  }

  removeConnectionEventHandlers(): void {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      if (this.status !== connectionStatus.CLOSED) {
        this.peerConnection
          .getTransceivers()
          .forEach((transceiver: RTCRtpTransceiver) => {
            transceiver.stop();
          });
      }
      this.peerConnection.close();
    }
  }

  async setConnectionRemoteDescription(
    remoteCallData: RTCSessionDescriptionInit | undefined
  ): Promise<void> {
    if (!this.peerConnection.currentRemoteDescription) {
      if (remoteCallData) {
        const connRemoteDescription: RTCSessionDescription =
          new RTCSessionDescription(remoteCallData);
        await this.peerConnection.setRemoteDescription(connRemoteDescription);
      }
    }
  }

  abstract establishPeerConnection(
    localMediaStream: MediaStream
  ): Promise<void>;
}
