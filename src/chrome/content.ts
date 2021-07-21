import { ChromeMessage, Sender, MessageResponse, DataInFrame, FrameData, Message } from "../types";
import { GET_VIDEO_FILESNIPPET } from "../schemas";
import { fetchGraphQL } from "../helperFunctions";
import { 
    fileSnippetBtnStyle,
    greenBoxOSStyle,
    greenBoxOHStyle,
    codeSnippetRMStyle,
    codeSnippetLMStyle,
    redBoxStyle,
    greenBoxStyle,
 } from "./style";

// content message listener function
const contentMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
    console.log('Message recieved: ', message);

    if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.Background &&
        message.message === Message.ACTIVATE_FILESNIPPET
    ) {
        console.log('Activating file snippet');
        const videoURL = 'https://www.youtube.com/watch?v=hQzlNlHcN0A'
        const videoId = videoURL.includes('v=') ? videoURL.split('v=')[1].split('&')[0] : videoURL.split('/')[3]
        const getVideoFileSnippet = await fetchGraphQL(GET_VIDEO_FILESNIPPET, {videoId})
        const fileSnippet = getVideoFileSnippet.data.video_by_pk.fileSnippets[0]
        console.log("File Snippet: ", fileSnippet);

        // parse the integer from a string like "12px"
        

        // sets up containers red and green
        const screen = document.querySelector<HTMLElement>('.video-stream')!
        let screenHeight = screen.style.height
        let screenWidth = screen.style.width
        let redBox = document.createElement('div')
        redBox.style.cssText = redBoxStyle(screenHeight)
        let greenBox = document.createElement('div')
        greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight)
        
        const clearGB = () => {
            greenBox.innerHTML = ''
        }
        const relativeFiF = (fileInFrame: DataInFrame): DataInFrame => {
            const xRatio = parseInt(screenWidth) / fileSnippet.width
            const yRatio = parseInt(screenHeight) / fileSnippet.height
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
            let isFiFRightMost = centerFiF > (parseInt(screenWidth)/2) ? true : false
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
                    code.style.cssText = codeSnippetRMStyle(currentDisplay, relFiF, screenHeight)
                } else {
                    const endFiF = relFiF.x+relFiF.width
                    code.style.cssText = codeSnippetLMStyle(currentDisplay, relFiF, screenWidth, screenHeight)
                }
            })
        }
        
        redBox.appendChild(greenBox)
        
        screen?.parentElement?.parentElement?.appendChild(redBox)
        
        const currentFrameData = (htmlVideoPlayer: any) => {
            const currentTime = htmlVideoPlayer.currentTime
            const duration = htmlVideoPlayer.duration
            const disparityTolerance = 1/duration
        
            const voonFrameDuration = 1/fileSnippet.fps
            
            const currentFrameData = fileSnippet.frameData.find((fd: FrameData) => {
                if (Math.abs(currentTime-(voonFrameDuration*fd.frame)) <= 0.5) {
                    return true
                } else {
                    return false
                }
            })
        
            return currentFrameData
        }
        
        // runs every equidistant amt of time
        let frameDataShowing: number | null
        const annuity = async () => {
            const videoPlayer: any = document.getElementById('movie_player')
            const htmlVideoPlayer: any = document.getElementsByTagName('video')[0]
            
            if (videoPlayer){
                const currentFD = currentFrameData(htmlVideoPlayer) ? currentFrameData(htmlVideoPlayer) : {frame: null, fileInFrames: []}
                const overlayShowing = !videoPlayer.classList.contains('ytp-autohide')
                if (currentFD.frame !== frameDataShowing) {
                    console.log('Changed frameData to frame: ', currentFD.frame);
                    
                    code.style.display = 'none'
                    clearGB()
                    greenBox.appendChild(code)
        
                    for (const fileInFrame of currentFD.fileInFrames) {
                        const btn = document.createElement('div')
                        const relFiF = relativeFiF(fileInFrame)
                        btn.style.cssText = fileSnippetBtnStyle(relFiF)
                        greenBox.appendChild(btn)
                
                        const snippetURL = 'https://voon-snippet.herokuapp.com/' + fileSnippet.githubURL + '/blob/master/' + fileInFrame.fileURL
                        fileBtn(btn, snippetURL, code, relFiF)
                    }
                    frameDataShowing = currentFD.frame
                }
                if (overlayShowing) {
                    greenBox.style.cssText = greenBoxOSStyle(screenHeight, screenWidth)
                } else {
                    greenBox.style.cssText = greenBoxOHStyle(screenHeight, screenWidth)
                }
        
            }
        }
        
        console.log('Starting annuity');
        setInterval(annuity, 500)

    }
}
// apply contentMessageListener to runtime
chrome.runtime.onMessage.addListener(contentMessageListener);