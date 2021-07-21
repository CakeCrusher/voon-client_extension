export enum Sender {
    Background,
    React,
    Content
}

export enum Message {
    CREATE_FILESNIPPET = 'create file snippet',
    ACTIVATE_FILESNIPPET = 'activate file snippet',
    REQUEST_FILESNIPPET = 'request file snippet',
    FINISHED_FILESNIPPET = 'finished file snippet',
}

export interface ChromeMessage {
    from: Sender,
    message: string,
    tab?: Tab,
    payload?: any,
}

export type Tab = {
    id?: number,
    url?: string,
}

export type MessageResponse = (response?: any) => void

export type MakeVoonIn = {
    videoId: String
    githubURL: String
    fps: number
    dimensions: Shape
    payload: FrameData[]
}
type Shape = {
    x: number
    y: number
}

export type VoonOut = {
    githubURL: String
    fps: number
    height: number
    width: number
    frameData: FrameDataOut[]
}

export type FrameDataOut = {
    frame : number
    fileInFrames : DataInFrameOut[]
}

export type DataInFrameOut = {
    fileURL: String
    x: number
    y: number
    width: number
    height: number
}

export type FrameData = {
    frame : number
    data : DataInFrame[]
}

export type DataInFrame = {
    file_name: String
    x: number
    y: number
    width: number
    height: number
}
  