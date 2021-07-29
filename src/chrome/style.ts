import { DataInFrame } from "../types"

export const BASE_STYLE = `
    .codeSnippetBtn {
        position:absolute;
        z-index:10;
        --angle: 0deg;
        border: 1px solid;
        border-radius: 10px;
        border-image: linear-gradient(var(--angle), rgb(231, 111, 81), rgb(255, 255, 255)) 1;
        animation: 4s rotate linear infinite;
    }

    @keyframes rotate {
        to {
            --angle: 360deg;
        }
    }

    @property --angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
    }
    .fileSnippetContainer {
        position: relative;
        bottom:0;
    }
    .liveCommentsContainer {
        position: absolute;
        right: 0;
        top: 0;
        padding: 10px;
        overflow-y: hidden;
        z-index: 11;
    }
    .commentContainer {
        position: relative;
        max-width: 100%;
        background-color: white;
        margin-bottom: 10px;
        border-radius: 2px;
        padding: 3px 5px;
    }
    .commentHead {
        font-size: 14px;
        margin-bottom: 3px;
        opacity: 0.7;
        color: black;
    }
    .commentBody {
        font-size: 16px;
        overflow: hidden;
        color: black;
    }
    .spacer {
        width: 100%;
        height: 1px;
        background-color: black;
        opacity: 0.2;
        margin: 10px 0px;
    }
    .commentFooter:hover {
        text-decoration: underline;
    }
    .repliesContainer {
        padding-left: 15px;
    }
`

export const SHOW = `
    display:block;
`

export const HIDDEN = `
    display:none;
`

export const fileSnippetBtnStyle = (relFiF: DataInFrame) => `
    height:${relFiF.height}px;
    width:${relFiF.width}px;
    left:${relFiF.x}px;
    top:${relFiF.y}px;
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
    height:${screenHeight};
    width:100%;
`

export const greenBoxStyle = (screenWidth: string, screenHeight: string) => `
    position: relative;
    bottom:0;
    height:${screenHeight};
    width:${screenWidth};
    background-color:rgba(0,255,0,0.5);
`