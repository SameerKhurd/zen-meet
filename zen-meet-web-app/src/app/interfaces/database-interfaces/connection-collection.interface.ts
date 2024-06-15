export interface ConnectionDoc {
  connectionId: string;
}

export interface CallDoc {
  sessionTimeId: number;
  data: any;
  type: 'answer' | 'offer';
}

export interface CandidateDoc {
  sessionTimeId: number;
  candidateData: RTCIceCandidateInit;
}
