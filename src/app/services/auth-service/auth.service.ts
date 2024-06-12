import { Injectable } from "@angular/core";
import { MeetingService } from "../meeting.service";

const authUrl = "";

export const randomIDGenerator = (length: number = 10): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  for (let i = 0; i < length; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
};

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private meetingService: MeetingService) {
    this.getUser();
  }

  getUser() {
    const userParticipantId = localStorage.getItem("userParticipantId");
    const userParticipantName = localStorage.getItem("userParticipantName");
    console.log(userParticipantId);

    this.meetingService.userParticipantId = userParticipantId
      ? userParticipantId
      : randomIDGenerator();
    this.meetingService.userParticipantName = userParticipantName
      ? userParticipantName
      : "";

    this.meetingService.storeUserDetailsLocally();
  }
}
