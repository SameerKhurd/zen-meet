import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  doc,
  CollectionReference,
} from '@angular/fire/firestore';

// server config
const servers = {
  iceServers: [
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
  ],
};
export interface Message {
  type: string;
  data: any;
}

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const mediaConstraints = {
  audio: true,
  //video: { width: 1280, height: 720 },
  // video: {width: 1280, height: 720} // 16:9
  // video: {width: 960, height: 540}  // 16:9
  video: { width: 640, height: 480 }, //  4:3
  // video: {width: 160, height: 120}  //  4:3
};

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  localStream: any = null;
  remoteStream: any = null;
  meetingId = '';
  peerConnection?: RTCPeerConnection;
  localVideoActive = false;

  constructor(public firestore: Firestore) {
    this.peerConnection = new RTCPeerConnection(servers);
  }

  inCall = false;

  async call(): Promise<void> {
    this.createPeerConnection();

    // Add the tracks from the local stream to the RTCPeerConnection
    this.localStream
      .getTracks()
      .forEach((track: any) =>
        this.peerConnection?.addTrack(track, this.localStream)
      );

    try {
      const offer = await this.peerConnection?.createOffer(offerOptions);
      // Establish the offer as the local peer's current description.
      await this.peerConnection?.setLocalDescription(offer);

      this.inCall = true;

      console.log('starting meeting', new Date().toLocaleDateString());

      const callDoc: DocumentReference = await addDoc(
        collection(this.firestore, 'calls'),
        {
          time: 'new Date().toLocaleDateString()',
        }
      );

      this.meetingId = callDoc.id;
      console.log('Call ID', callDoc.id);

      const offerCandidates: CollectionReference = collection(
        this.firestore,
        `calls/${callDoc.id}/offerCandidates'`
      );
      const answerCandidiates: CollectionReference = collection(
        this.firestore,
        `calls/${callDoc.id}/answerCandidiates'`
      );

      await setDoc(callDoc, { offer });

      onSnapshot(answerCandidiates, (snapshot: any) => {
        //const data = snapshot.data();
        console.log('Start', snapshot);

        // if (!this.peerConnection.currentRemoteDescription && data.answer) {
        //   const answerDescription = new RTCSessionDescription(data.answer);
        //   this.peerConnection.setRemoteDescription(answerDescription);
        // }

        snapshot.docChanges().forEach((change: any) => {
          console.log(
            'Start',
            'snapshot answerCandidiates',
            change.type,
            change.doc.data()
          );
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            this.peerConnection?.addIceCandidate(candidate);
          }
        });
      });

      //this.dataService.sendMessage({ type: 'offer', data: offer });
    } catch (err: any) {
      this.handleGetUserMediaError(err);
    }
  }

  hangUp(): void {
    this.dataService.sendMessage({ type: 'hangup', data: '' });
    this.closeVideoCall();
  }

  ngAfterViewInit(): void {
    this.addIncominMessageHandler();
    this.requestMediaDevices();
  }

  private addIncominMessageHandler(): void {
    this.dataService.connect();

    // this.transactions$.subscribe();
    this.dataService.messages$.subscribe(
      (msg) => {
        // console.log('Received message: ' + msg.type);
        switch (msg.type) {
          case 'offer':
            this.handleOfferMessage(msg.data);
            break;
          case 'answer':
            this.handleAnswerMessage(msg.data);
            break;
          case 'hangup':
            this.handleHangupMessage(msg);
            break;
          case 'ice-candidate':
            this.handleICECandidateMessage(msg.data);
            break;
          default:
            console.log('unknown message of type ' + msg.type);
        }
      },
      (error: any) => console.log(error)
    );
  }

  /* ########################  MESSAGE HANDLER  ################################## */

  private handleOfferMessage(msg: RTCSessionDescriptionInit): void {
    console.log('handle incoming offer');
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    if (!this.localStream) {
      this.startLocalVideo();
    }

    this.peerConnection
      ?.setRemoteDescription(new RTCSessionDescription(msg))
      .then(() => {
        // add media stream to local video
        this.localVideo.nativeElement.srcObject = this.localStream;

        // add media tracks to remote connection
        this.localStream
          .getTracks()
          .forEach((track: any) =>
            this.peerConnection?.addTrack(track, this.localStream)
          );
      })
      .then(() => {
        // Build SDP for answer message
        return this.peerConnection?.createAnswer();
      })
      .then((answer) => {
        // Set local SDP
        return this.peerConnection?.setLocalDescription(answer);
      })
      .then(() => {
        // Send local SDP to remote party
        this.dataService.sendMessage({
          type: 'answer',
          data: this.peerConnection?.localDescription,
        });

        this.inCall = true;
      })
      .catch(this.handleGetUserMediaError);
  }

  private handleAnswerMessage(): void {
    console.log('handle incoming answer');

    const callId = this.meetingId;

    // getting the data for this particular call
    const callsRef = collection(this.firestore, 'calls');

    const callDoc = doc(callsRef, callId);

    const offerCandidates: CollectionReference = collection(
      this.firestore,
      `calls/${callDoc.id}/offerCandidates'`
    );
    const answerCandidiates: CollectionReference = collection(
      this.firestore,
      `calls/${callDoc.id}/answerCandidiates'`
    );


    const callData = (await getDoc(callDoc)).data();
    console.log('Ans', 'callData', callData);

    this.peerConnection?.setRemoteDescription(msg);
  }

  private handleHangupMessage(msg: Message): void {
    console.log(msg);
    this.closeVideoCall();
  }

  private handleICECandidateMessage(msg: RTCIceCandidate): void {
    const candidate = new RTCIceCandidate(msg);
    this.peerConnection?.addIceCandidate(candidate).catch(this.reportError);
  }

  private async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );
      // pause all tracks
      this.pauseLocalVideo();
    } catch (e: any) {
      console.error(e);
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  startLocalVideo(): void {
    console.log('starting local stream');
    this.localStream.getTracks().forEach((track: any) => {
      track.enabled = true;
    });

    this.localVideoActive = true;
  }

  pauseLocalVideo(): void {
    console.log('pause local stream');
    this.localStream.getTracks().forEach((track: any) => {
      track.enabled = false;
    });
    this.localStream = undefined;

    this.localVideoActive = false;
  }

  private createPeerConnection(): void {
    console.log('creating PeerConnection...');
    this.peerConnection = new RTCPeerConnection(servers);

    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange =
      this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange =
      this.handleSignalingStateChangeEvent;
    this.peerConnection.ontrack = this.handleTrackEvent;
  }

  private closeVideoCall(): void {
    console.log('Closing call');

    if (this.peerConnection) {
      console.log('--> Closing the peer connection');

      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;

      // Stop all transceivers on the connection
      this.peerConnection.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });

      // Close the peer connection
      this.peerConnection.close();
      this.peerConnection = undefined;

      this.inCall = false;
    }
  }

  /* ########################  ERROR HANDLER  ################################## */
  private handleGetUserMediaError(e: Error): void {
    switch (e.name) {
      case 'NotFoundError':
        alert(
          'Unable to open your call because no camera and/or microphone were found.'
        );
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        console.log(e);
        alert('Error opening your camera and/or microphone: ' + e.message);
        break;
    }

    this.closeVideoCall();
  }

  private reportError = (e: Error) => {
    console.log('got Error: ' + e.name);
    console.log(e);
  };

  /* ########################  EVENT HANDLER  ################################## */
  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
    if (event.candidate) {
      this.dataService.sendMessage({
        type: 'ice-candidate',
        data: event.candidate,
      });
    }
  };

  private handleICEConnectionStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection?.iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.closeVideoCall();
        break;
    }
  };

  private handleSignalingStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection?.signalingState) {
      case 'closed':
        this.closeVideoCall();
        break;
    }
  };

  private handleTrackEvent = (event: RTCTrackEvent) => {
    console.log(event);
    this.remoteStream = event.streams[0];
  };
}
