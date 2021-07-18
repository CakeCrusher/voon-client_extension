export enum Sender {
    React,
    Content
}

export interface ChromeMessage {
    from: Sender,
    message: any
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
  