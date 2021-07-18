// import { messagesFromReactAppListener } from './content/listener'

import { ChromeMessage, Sender, MessageResponse, DataInFrameOut, FrameDataOut, VoonOut } from "../types";
// import { GET_VIDEO_FILESNIPPET } from "../schemas";
// import { activateFileSnippet } from "./content/fileSnippet/fileSnippet";
// import { fetchGraphQL } from "../helperFunctions";
import { getFileSnippet, currentFrameData } from "./content/fileSnippet/fileSnippet";
  

export const messagesFromReactAppListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender, response: MessageResponse) => {
    console.log('message recieved');

    if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === "activate file snippet"
    ) {

        const fileSnippet = await getFileSnippet()
        console.log("File Snippet: ", fileSnippet);

        // sets up containers red and green
        const screen = document.querySelector<HTMLElement>('.video-stream')!
        let screenHeight = screen.style.height
        let screenHeightInt = parseInt(screenHeight.slice(0,screenHeight.length - 2))
        let screenWidth = screen.style.width
        let screenWidthInt = parseInt(screenWidth.slice(0,screenWidth.length - 2))
        let redBox = document.createElement('div')
        redBox.style.cssText =
            `position:relative;left:-1px;display:flex;align-items:center;justify-content:center;height:${screenHeight};width:100%;`
        let greenBox = document.createElement('div')
        greenBox.style.cssText =
            `position:relative;bottom:0;height:${screenHeight};width:${screenWidth};background-color:rgba(0,255,0,0.5);`
        
        const clearGB = () => {
            greenBox.innerHTML = ''
        }
        const relativeFiF = (fileInFrame: DataInFrameOut) => {
            const xRatio = screenWidthInt / fileSnippet.width
            const yRatio = screenHeightInt / fileSnippet.height
            const newFileInFrame = {...fileInFrame}
            newFileInFrame['x'] = Math.round(fileInFrame.x*xRatio)
            newFileInFrame['width'] = Math.round(fileInFrame.width*xRatio)
            newFileInFrame['y'] = Math.round(fileInFrame.y*yRatio)
            newFileInFrame['height'] = Math.floor(fileInFrame.height*yRatio)
            return newFileInFrame
        }
        
        let code = document.createElement('iframe')
        code.style.display = 'none'
        
        const fileBtn = (ele: HTMLElement, url: string, codeFrame: HTMLIFrameElement, relFiF: any) => {
            const centerFiF =  relFiF.x + (relFiF.width/2)
            let isFiFRightMost = centerFiF > (screenWidthInt/2) ? true : false
            ele.addEventListener('click', () => {
                console.log('FiF: ', relFiF);
                console.log('RightMost: ', isFiFRightMost);
                
                let currentDisplay 
                if (codeFrame.src == url && codeFrame.style.display == 'block') {
                    currentDisplay = 'none'
                } else {
                    currentDisplay = 'block'
                }
                codeFrame.src = url
        
                if (isFiFRightMost) {
                    code.style.cssText = `position:absolute;display:${currentDisplay};z-index:11;left:0px;top:0px;width:${relFiF.x}px;height:${screenHeight}`
                } else {
                    const endFiF = relFiF.x+relFiF.width
                    code.style.cssText = `position:absolute;display:${currentDisplay};z-index:11;left:${endFiF}px;top:0px;width:${screenWidthInt-endFiF}px;height:${screenHeight}`
                }
            })
        }
        
        redBox.appendChild(greenBox)
        
        screen?.parentElement?.parentElement?.appendChild(redBox)
        

        
        // runs every equidistant amt of time
        let frameDataShowing: number | null
        const annuity = async () => {
            const videoPlayer: any = document.getElementById('movie_player')
            const htmlVideoPlayer: any = document.getElementsByTagName('video')[0]
            console.log("ran annuity");
            
            if (videoPlayer){
                const currentFD = currentFrameData(htmlVideoPlayer, fileSnippet) ? currentFrameData(htmlVideoPlayer, fileSnippet) : {frame: null, fileInFrames: []}
                const overlayShowing = !videoPlayer.classList.contains('ytp-autohide')
                if (currentFD && currentFD.frame !== frameDataShowing) {
                    console.log('Changed frameData to frame: ', currentFD.frame);
                    
                    code.style.display = 'none'
                    clearGB()
                    greenBox.appendChild(code)
        
                    for (const fileInFrame of currentFD.fileInFrames) {
                        const btn = document.createElement('div')
                        const relFiF = relativeFiF(fileInFrame)
                        btn.style.cssText = `position:absolute;z-index:10;height:${relFiF.height}px;width:${relFiF.width}px;border:1px solid red;left:${relFiF.x}px;top:${relFiF.y}px`
                        greenBox.appendChild(btn)
                
                        const snippetURL = 'https://voon-snippet.herokuapp.com/' + fileSnippet.githubURL + '/blob/master/' + fileInFrame.fileURL
                        fileBtn(btn, snippetURL, code, relFiF)
                    }
                    frameDataShowing = currentFD.frame
                }
                if (overlayShowing) {
                    console.log('Showing voon');
                    
                    greenBox.style.cssText =
                        `position:relative;display:block;bottom:0;height:${screenHeight};width:${screenWidth};background-color:rgba(0,255,0,0.5);`
                } else {
                    greenBox.style.cssText =
                        `position:relative;display:none;bottom:0;height:${screenHeight};width:${screenWidth};background-color:rgba(0,255,0,0.5);`
                    // code.style.display = 'none'
                }
        
            }
        }
        
        setInterval(annuity, 500)

        response('finished file snippet')
    }
}

chrome.runtime.onMessage.addListener(messagesFromReactAppListener);