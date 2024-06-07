import { Injectable } from "@angular/core";
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
  DocumentSnapshot,
  Timestamp,
} from "@angular/fire/firestore";

// server config
const STUN_SERVERS = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

export const randomIDGenerator = (length: number = 10): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = 0; i < length; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
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
  providedIn: "root",
})
export class VideoService {
  localStream: any = null;
  remoteStream: any = null;
  meetingId = "";
  participantId = randomIDGenerator();
  localVideoActive = false;
  partcipants: any = [];
  availableVideoDevices: any = [];

  constructor(public firestore: Firestore) {
    this.getAvailableDevices();
  }

  async getAvailableDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.availableVideoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    if (this.availableVideoDevices.length) {
      this.selectedVideoDevice = this.availableVideoDevices[0];
      //this.startLocalVideo();
    }
  }

  async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );
      // pause all tracks
      //this.startLocalVideo();
    } catch (e: any) {
      console.error(e);
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  startLocalVideo(): void {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: {
            exact: this.selectedVideoDevice.deviceId,
          },
        },
      })
      .then((stream) => {
        const [videoTrack] = stream.getVideoTracks();
        this.localStream.getVideoTracks()[0].enabled = false;
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.removeTrack(this.localStream.getVideoTracks()[0]);
        this.localStream.addTrack(videoTrack);

        this.partcipants.forEach((participant: any) => {
          [
            participant.toPeerRTCPeerConnection,
            participant.fromPeerRTCPeerConnection,
          ].forEach((peerConnection: RTCPeerConnection) => {
            const sender = peerConnection
              .getSenders()
              .find((s) => s.track?.kind === videoTrack.kind);
            console.log("Found sender:", sender);
            sender?.replaceTrack(videoTrack);
          });
        });
      })
      .catch((err) => {
        console.error(`Error happened: ${err}`);
      });
  }

  stopLocalVideo(): void {
    this.localStream.getVideoTracks()[0].enabled = false;
    this.localStream.getVideoTracks()[0].stop();
  }

  isVideoEnabled = true;
  selectedVideoDevice: any;
  onVideoStreamChange(selectedVideoDevice: any) {
    this.selectedVideoDevice = selectedVideoDevice;
    this.startLocalVideo();
  }

  videoToggle() {
    if (!this.isVideoEnabled) {
      this.onVideoStreamChange(this.selectedVideoDevice);
    } else {
      this.localStream.getVideoTracks()[0].enabled = false;
      this.localStream.getVideoTracks()[0].stop();
    }
    this.isVideoEnabled = !this.isVideoEnabled;
  }

  isAudioEnabled = true;
  async audioToggle() {
    const audioEnabled = this.localStream.getAudioTracks()[0].enabled;
    this.localStream.getAudioTracks()[0].enabled = !audioEnabled;

    if (!this.isAudioEnabled) {
      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.localStream.removeTrack(this.localStream.getAudioTracks()[0]);
      this.localStream.addTrack(newAudioStream.getAudioTracks()[0]);
    } else {
      this.localStream.getAudioTracks()[0].enabled = false;
      this.localStream.getAudioTracks()[0].stop();
    }
    this.isAudioEnabled = !this.isAudioEnabled;
  }

  async startNewMeting(meetingName: string) {
    console.log("starting New Meeting", new Date().toLocaleDateString());

    const meetingDocRef: DocumentReference = await addDoc(
      collection(this.firestore, "meetings"),
      {
        meetingName: meetingName,
        startTime: Timestamp.now(),
      }
    );

    this.meetingId = meetingDocRef.id;
    console.log("meetingDocRef ID", meetingDocRef.id);

    //this.joinMeeting(this.meetingId);
  }

  async getMeetingDetails(meetingId: string) {
    console.log(Timestamp.now().toDate().toLocaleTimeString());
    console.log(Timestamp.now().toDate().toLocaleString());

    const meetingCollectionPath = `meetings`;

    const meetingCollectionRef: CollectionReference = collection(
      this.firestore,
      meetingCollectionPath
    );
    const meetingDocRef = doc(meetingCollectionRef, meetingId);
    const meetingDetails = (await getDoc(meetingDocRef)).data();
    console.log(meetingDetails);
    return meetingDetails
  }

  async joinMeeting(meetingId: string) {
    this.registerParticipantObserver(this.meetingId);
  }

  async registerParticipantObserver(meetingId: string) {
    const participantsCollectionRef: CollectionReference = collection(
      this.firestore,
      `meetings/${meetingId}/participants`
    );

    onSnapshot(participantsCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change: any) => {
        console.log(
          "User",
          "snapshot",
          change.type,
          change.doc.id,
          change.doc.data()
        );
        if (change.type === "added") {
          const peerParticipant = change.doc.data();
          if (peerParticipant.participantId !== this.participantId) {
            this.addRTCMeshConnection(peerParticipant);
          }
        }
      });
    });

    const newParticipant = {
      participantName: "",
      participantId: this.participantId,
    };

    const newParticipantDocRef = doc(
      participantsCollectionRef,
      this.participantId
    );
    await setDoc(newParticipantDocRef, newParticipant);
  }

  private addRTCPeerConnectionEventHandler(
    partcipantConnection: any,
    currPeerConnection: RTCPeerConnection
  ) {
    currPeerConnection.oniceconnectionstatechange = (event: any) => {
      switch (currPeerConnection.iceConnectionState) {
        case "connected":
          partcipantConnection.status = "connected";
          console.log(partcipantConnection.remoteStream.getAudioTracks());
          this.stopLocalVideo();
          this.startLocalVideo();
          break;
        case "closed":
        case "failed":
        case "disconnected":
          partcipantConnection.status = "closed";
          this.closeConnection(currPeerConnection);
          break;
      }
    };

    currPeerConnection.onsignalingstatechange = (event: any) => {
      switch (currPeerConnection.signalingState) {
        case "closed":
          partcipantConnection.status = "closed";
          this.closeConnection(currPeerConnection);
          break;
      }
    };
  }

  private closeConnection(currPeerConnection: RTCPeerConnection) {
    if (currPeerConnection) {
      console.log("--> Closing the peer connection");

      currPeerConnection.ontrack = null;
      currPeerConnection.onicecandidate = null;
      currPeerConnection.oniceconnectionstatechange = null;
      currPeerConnection.onsignalingstatechange = null;

      currPeerConnection.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });

      currPeerConnection.close();
    }
  }

  private async addRTCMeshConnection(peerParticipant: any) {
    console.log(
      "addRTCMeshConnection",
      this.participantId,
      peerParticipant.participantId
    );
    const toPeerConnectionId = `${this.participantId}_${peerParticipant.participantId}`;
    const fromPeerConnectionId = `${peerParticipant.participantId}_${this.participantId}`;

    const partcipantConnection = {
      toPeerRTCPeerConnection: this.getNewRTCPeerConnection(),
      fromPeerRTCPeerConnection: this.getNewRTCPeerConnection(),
      remoteStream: new MediaStream(),
      participant: peerParticipant,
      status: "new",
    };

    this.addRTCPeerConnectionEventHandler(
      partcipantConnection,
      partcipantConnection.toPeerRTCPeerConnection
    );

    this.addRTCPeerConnectionEventHandler(
      partcipantConnection,
      partcipantConnection.fromPeerRTCPeerConnection
    );

    await this.establishToPeerConnection(
      toPeerConnectionId,
      partcipantConnection.toPeerRTCPeerConnection
    );

    setTimeout(() => {
      this.establishFromPeerConnection(
        fromPeerConnectionId,
        partcipantConnection.fromPeerRTCPeerConnection
      );
    }, 2000);

    this.localStream.getTracks().forEach((track: any) => {
      partcipantConnection.toPeerRTCPeerConnection.addTrack(
        track,
        this.localStream
      );
      partcipantConnection.fromPeerRTCPeerConnection.addTrack(
        track,
        this.localStream
      );
    });

    partcipantConnection.toPeerRTCPeerConnection.ontrack = (event: any) => {
      partcipantConnection.remoteStream = event.streams[0];
      // connection.remoteStream.getTracks((track: any) => {
      //   connection.remoteStream.addTrack(track);
      // });
    };

    this.partcipants.push(partcipantConnection);
    console.log(this.partcipants);

    // let fromPeerRemoteStream: any = new MediaStream();
    // fromPeerRTCPeerConnection.ontrack = (event: any) => {
    //   console.log("fromPeerRTCPeerConnection.ontrack")
    //   fromPeerRemoteStream = event.streams[0];
    //   fromPeerRemoteStream.getTracks((track: any) => {
    //     fromPeerRemoteStream.addTrack(track);
    //   });
    //   this.peerStreams.push({
    //     peerParticipantId: peerParticipantId,
    //     stream: fromPeerRemoteStream,
    //   });
    // };

    //establishFromPeerConnection();
  }

  private getNewRTCPeerConnection(): RTCPeerConnection {
    const newPeerConnection: RTCPeerConnection = new RTCPeerConnection(
      STUN_SERVERS
    );
    return newPeerConnection;
  }

  private async establishToPeerConnection(
    connectionId: string,
    currPeerConnection: RTCPeerConnection
  ) {
    console.log(
      "establishToPeerConnection",
      connectionId,
      new Date().toLocaleDateString()
    );

    const connCollectionPath = `meetings/${this.meetingId}/connections`;
    const connectionsCollectionRef: CollectionReference = collection(
      this.firestore,
      connCollectionPath
    );

    const connDocRef = doc(connectionsCollectionRef, connectionId);
    setDoc(connDocRef, { connectionId: connectionId });

    const connDocumentPath = `meetings/${this.meetingId}/connections/${connectionId}`;

    const connOfferCandidatesCollectionRef: CollectionReference = collection(
      this.firestore,
      `${connDocumentPath}/offerCandidates`
    );
    const connAnswerCandidiatesCollectionRef: CollectionReference = collection(
      this.firestore,
      `${connDocumentPath}/answerCandidiates`
    );

    currPeerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log("OFFER", "onicecandidate", this.meetingId, connectionId);
        addDoc(connOfferCandidatesCollectionRef, event.candidate.toJSON());
      }
    };

    const offerDescription = await currPeerConnection.createOffer(offerOptions);
    await currPeerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(connDocRef, { offer });

    onSnapshot(connAnswerCandidiatesCollectionRef, async (snapshot) => {
      snapshot.docChanges().forEach((change: any) => {
        console.log(
          "OFFER",
          "onSnapshot",
          this.meetingId,
          connectionId,
          change.type,
          change.doc.data()
        );

        if (change.type === "added") {
          try {
            const newICECandidate = new RTCIceCandidate(change.doc.data());
            currPeerConnection.addIceCandidate(newICECandidate);
          } catch (err) {
            console.log("ERROR", connectionId);
          }
        }
      });

      const connRemoteDescription = (await getDoc(connDocRef)).data()![
        "answer"
      ];
      if (
        !currPeerConnection.currentRemoteDescription &&
        connRemoteDescription
      ) {
        const answerDescription = new RTCSessionDescription(
          connRemoteDescription
        );
        setTimeout(() => {
          console.log("@@@@@@@", currPeerConnection.iceConnectionState);
          currPeerConnection.setRemoteDescription(answerDescription);
        }, 3000);
      }
    });
  }

  private async establishFromPeerConnection(
    connectionId: string,
    currPeerConnection: RTCPeerConnection
  ) {
    console.log(
      "establishFromPeerConnection",
      connectionId,
      new Date().toLocaleDateString()
    );

    const connCollectionPath = `meetings/${this.meetingId}/connections`;

    const connectionsCollectionRef = collection(
      this.firestore,
      connCollectionPath
    );
    const connDocRef = doc(connectionsCollectionRef, connectionId);

    const connDocumentPath = `meetings/${this.meetingId}/connections/${connectionId}`;
    const connOfferCandidatesCollectionRef: CollectionReference = collection(
      this.firestore,
      `${connDocumentPath}/offerCandidates`
    );
    const connAnswerCandidiatesCollectionRef: CollectionReference = collection(
      this.firestore,
      `${connDocumentPath}/answerCandidiates`
    );

    currPeerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log("ANSWER", "onicecandidate", this.meetingId, connectionId);
        setTimeout(() => {
          addDoc(connAnswerCandidiatesCollectionRef, event.candidate.toJSON());
        }, 3000);
      }
    };

    const connRemoteDescription = (await getDoc(connDocRef)).data()!["offer"];
    const offerDescription = new RTCSessionDescription(connRemoteDescription);
    console.log("%%%%%%%", currPeerConnection.iceConnectionState);

    await currPeerConnection.setRemoteDescription(offerDescription);

    const answerDescription = await currPeerConnection.createAnswer();
    await currPeerConnection.setLocalDescription(
      new RTCSessionDescription(answerDescription)
    );

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(connDocRef, { answer });

    onSnapshot(connOfferCandidatesCollectionRef, async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(
          "ANSWER",
          "onSnapshot",
          this.meetingId,
          connectionId,
          change.type
        );

        if (change.type === "added") {
          try {
            const newICECandidate = new RTCIceCandidate(change.doc.data());
            currPeerConnection.addIceCandidate(newICECandidate);
          } catch (err) {
            console.log("ERROR", connectionId);
          }
        }
      });
    });
  }
}
