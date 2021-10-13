export enum Sender {
  Background,
  React,
  Content,
}

export enum Message {
  CREATE_FILESNIPPET = "create file snippet",
  HAS_FILESNIPPET = "has file snippet",
  ACTIVATE_FILESNIPPET = "activate file snippet",
  REQUEST_FILESNIPPET = "request file snippet",
  FINISHED_FILESNIPPET = "finished file snippet",
  ACTIVATE_LIVECOMMENT = "activate live comment",
  CHANGE_LIVECOMMENT_VISIBILITY = "change live comment visibility",
  INITIATE_ENVIRONMENT = "initiate environment",
  VIDEODETAILS = "video details",
  RESET_CONTENT = "reset content",
  STATUS_UPDATE = "status update",
}

export interface ChromeMessage {
  from: Sender;
  message: string;
  tab?: Tab;
  payload?: any;
}

export type OnUpdateFeed = {
  status: any;
  url: string;
};

export type LiveCommentOut = {
  comment: string;
  user: string;
  time: number;
  replies?: ReplyOut[];
};
type ReplyOut = {
  comment: string;
  user: string;
};

export type Tab = {
  id?: number;
  url?: string;
};

export type MessageResponse = (response?: any) => void;

export type makeFileSnippetIn = {
  url: string;
  per_frame: number;
};

export type FileSnippetOut = {
  githubURL: string;
  fps: number;
  height: number;
  width: number;
  frameData: FrameDataOut[];
};

export type FrameDataOut = {
  frame: number;
  fileInFrames: DataInFrameOut[];
};

export type DataInFrameOut = {
  fileURL: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FrameData = {
  frame: number;
  data: DataInFrame[];
};

export type DataInFrame = {
  file_name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FileSnippet = {
  state: boolean;
};

export type LiveComment = {
  state: boolean;
  lowVisibility: boolean;
};

export type AntiSpoiler = {
  state: boolean;
  showTime: boolean;
  showThumbnail: boolean;
  showTitle: boolean;
}

export type LiveCommentIn = {
  videoId: string;
};
