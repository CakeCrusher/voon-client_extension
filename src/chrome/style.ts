import { DataInFrame } from "../types"

export const fileSnippetBtnStyle = (relFiF: DataInFrame) => `
    position:absolute;
    z-index:10;
    height:${relFiF.height}px;
    width:${relFiF.width}px;
    border:1px solid red;
    left:${relFiF.x}px;
    top:${relFiF.y}px;
`

export const greenBoxOSStyle = (screenHeight: string, screenWidth: string) => `
    position:relative;
    display:block;
    bottom:0;
    height:${screenHeight};
    width:${screenWidth};
    background-color:rgba(0,255,0,0.5);
`

export const greenBoxOHStyle = (screenHeight: string, screenWidth: string) => `
    position:relative;
    display:none;
    bottom:0;
    height:${screenHeight};
    width:${screenWidth};
    background-color:rgba(0,255,0,0.5);
`

export const codeSnippetRMStyle = (currentDisplay: string, relFiF: DataInFrame, screenHeight: string) => `
    position:absolute;
    display:${currentDisplay};
    z-index:11;
    left:0px;
    top:0px;
    width:${relFiF.x}px;
    height:${screenHeight}
`

export const codeSnippetLMStyle = (currentDisplay: string, endFiF: number, screenWidth: string, screenHeight: string) => `
    position:absolute;
    display:${currentDisplay};
    z-index:11;
    left:0px;
    top:0px;
    width:${parseInt(screenWidth)-endFiF}px;
    height:${screenHeight}
`

export const redBoxStyle = (screenHeight: string) => `
    position:relative;
    left:-1px;
    display:flex;
    align-items:center;
    justify-content:center;
    height:${screenHeight};width:100%;
`

export const greenBoxStyle = (screenWidth: string, screenHeight: string) => `
    position:relative;
    bottom:0;
    height:${screenHeight};
    width:${screenWidth};
    background-color:rgba(0,255,0,0.5);
`