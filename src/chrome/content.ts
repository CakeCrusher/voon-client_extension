import { ChromeMessage, Sender, MessageResponse, DataInFrame, FrameData, Message, FileSnippetOut, FrameDataOut, FileSnippet, LiveComment, LiveCommentOut } from "../types";
import { GET_VIDEO_FILESNIPPET } from "../schemas";
import { fetchGraphQL } from "../helperFunctions";
import { 
    BASE_STYLE,
    fileSnippetBtnStyle,
    SHOW,
    HIDDEN,
    codeSnippetRMStyle,
    codeSnippetLMStyle,
    redBoxStyle,
    greenBoxStyle,
} from "./style";

let videoId: string
// let theatre: HTMLElement
// let blueBox: HTMLElement
let screen: HTMLElement
let redBox: HTMLElement
let greenBox: HTMLElement
let clearGB: Function
let relativeFiF: Function
let screenHeight: string
let screenWidth: string
let fileSnippet: FileSnippetOut | undefined
let fileSnippetFunction: Function
let fileSnippetState: FileSnippet
let liveComments: LiveCommentOut[] = [
  {
    "comment": "What are these boxes on my screen?",
    "frame": 0,
    "user": "scratchyHead",
    "replies": [
      {
        "comment": "They are buttons that open a interactable file directly on the video.",
        "user": "CakeCrusher"
      },
      {
        "comment": "BARK!!!",
        "user": "HYPEDog"
      }
    ]
  }
]
let liveCommentState: LiveComment

chrome.storage.sync.get(["fileSnippet", "liveComment"], (res) => {
  fileSnippetState = res.fileSnippet
  liveCommentState = res.liveComment
})


const clock = () => {
  if (document.querySelector<HTMLElement>('.video-stream')) {
    screen = document.querySelector<HTMLElement>('.video-stream')!
    screenHeight = screen.style.height
    screenWidth = screen.style.width
    redBox.style.cssText = redBoxStyle(screenHeight)
    greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight)
  }
  if (liveComments && liveCommentState.state) {
    liveCommentFunction()
  }
  if (fileSnippet && fileSnippetState.state) {
    fileSnippetFunction()
  }
}
setInterval(clock, 500)

const liveCommentFunction = async () => { 
  console.log("LCF ran");
   
  let liveCommentsContainer = document.createElement('div')
  liveCommentsContainer.className = 'liveCommentsContainer'
  liveCommentsContainer.style.cssText = `width: ${Math.round(parseInt(screenWidth)/3)}px; height: ${screenWidth}` 
  
  for (const comment of liveComments) {
    let commentContainer = document.createElement('div')
    commentContainer.className = 'commentContainer'

    const createComment = (user: string, comment: string, container: HTMLElement, showSpacer: boolean = true) => {
      let commentHead = document.createElement('div')
      commentHead.className = 'commentHead'
      commentHead.innerText = user
      container.appendChild(commentHead)

      let commentBody = document.createElement('div')
      commentBody.className = 'commentBody'
      commentBody.innerText = comment
      container.appendChild(commentBody)

      if (showSpacer) {
        let spacer = document.createElement('div')
        spacer.className = 'spacer'
        container.appendChild(spacer)
      }
    }

    createComment(
      comment.user,
      comment.comment,
      commentContainer
    )

    if (comment.replies) {
      let repliesContainer = document.createElement('div')
      repliesContainer.className = 'repliesContainer'

      for (const reply of comment.replies) {
        createComment(
          reply.user,
          reply.comment,
          repliesContainer,
          false
        )
      }

      commentContainer.appendChild(repliesContainer)
    }

    liveCommentsContainer.appendChild(commentContainer)
  }

  greenBox!.appendChild(liveCommentsContainer)
}

const onStorageChange = async (changes: any, namespace: any) => {
  const keysChanged = Object.keys(changes);
  
  if (keysChanged.includes('fileSnippet')) {
    fileSnippetState = changes.fileSnippet.newValue
    if (changes.fileSnippet.newValue.state !== changes.fileSnippet.oldValue.state) {
      // when fileSnippet activation changes
      if (changes.fileSnippet.newValue.state) {
        // when fileSnippet is activated
        const queryInfo: chrome.tabs.QueryInfo = {
          active: true,
          currentWindow: true
        }
        chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
          const message: ChromeMessage = {
            from: Sender.Content,
            message: Message.REQUEST_FILESNIPPET,
            tab: {
              id: tabs[0].id!,
              url: tabs[0].url!
            },
          }; 
          chrome.runtime.sendMessage(
            message
          );
        }) 
      }
      if (!changes.fileSnippet.newValue.state) {
        console.log('Cleared GB: ', changes);
        
        clearGB()
      }
    }
  }
  if (keysChanged.includes('liveComment')) {
    liveCommentState = changes.liveComment.newValue
    if (changes.liveComment.newValue.state !== changes.liveComment.oldValue.state) {
      // when liveComment activation changes
      if (!changes.liveComment.newValue.state) {
        // when liveComment is deactivated
      }
    }
    if (changes.liveComment.newValue.lowVisibility !== changes.liveComment.oldValue.lowVisibility) {
      // when liveComment activation changes
      if (changes.liveComment.newValue.lowVisibility) {
        // when liveComment has low visibility
      } else {
          // when liveComment has normal visibility
      }
    }
  }
}
chrome.storage.onChanged.addListener(onStorageChange)

// content message listener function
const contentMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
  console.log('Message recieved: ', message);
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.INITIATE_ENVIRONMENT
  ) {
    fileSnippet = undefined
    console.log('Injecting css');
    // create a style element and append it to the head of the document
    const baseStyle = document.createElement('style');
    baseStyle.type = 'text/css';
    baseStyle.innerHTML = BASE_STYLE;
    document.head.appendChild(baseStyle);
    const videoURL = message.payload.url
    videoId = videoURL.includes('v=') ? videoURL.split('v=')[1].split('&')[0] : videoURL.split('/')[3]
    
    // sets up containers red and green
    screen = document.querySelector<HTMLElement>('.video-stream')!
    screenHeight = screen.style.height
    screenWidth = screen.style.width
    redBox = document.createElement('div')
    redBox.id = 'redBox'
    redBox.style.cssText = redBoxStyle(screenHeight)
    greenBox = document.createElement('div')
    greenBox.id = 'greenBox'
    greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight)
    redBox.appendChild(greenBox!)
    screen.parentElement?.parentElement?.appendChild(redBox)
    
    clearGB = () => {
      greenBox.innerHTML = ''
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_FILESNIPPET
  ) {
    console.log('Activating file snippet');
    fileSnippet = message.payload.fileSnippet
    if (fileSnippet) {
      console.log("File Snippet: ", fileSnippet);
      relativeFiF = (fileInFrame: DataInFrame): DataInFrame => {
        
        const xRatio = parseInt(screenWidth) / fileSnippet!.width
        const yRatio = parseInt(screenHeight) / fileSnippet!.height
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
      
      const currentFrameData = (htmlVideoPlayer: any): FrameDataOut | undefined => {
        const currentTime = htmlVideoPlayer.currentTime
        const duration = htmlVideoPlayer.duration
        const disparityTolerance = 1/duration
    
        const voonFrameDuration = 1/fileSnippet!.fps
        
        let currentFrameData = fileSnippet!.frameData.find((fd: FrameDataOut) => {
            if (Math.abs(currentTime-(voonFrameDuration*fd.frame)) <= 0.5) {
              return true
            } else {
              return false
            }
        })
    
        return currentFrameData
      }
      
      // runs every equidistant amt of time
      let frameDataShowing: number | undefined
      fileSnippetFunction = () => {
        const videoPlayer: any = document.getElementById('movie_player')
        const htmlVideoPlayer: any = document.getElementsByTagName('video')[0]
        
        if (videoPlayer){
          const currentFD = currentFrameData(htmlVideoPlayer)
          const currentFrame = currentFD ? currentFD.frame : undefined
          const overlayShowing = !videoPlayer.classList.contains('ytp-autohide')
          // if (currentFrame !== frameDataShowing) {
            // console.log('Changed frameData to frame: ', currentFrame);
            
            code.style.display = 'none'
            // clearGB()
            
            if (currentFD) {
              greenBox.appendChild(code)
    
              for (const fileInFrame of currentFD.fileInFrames) {
                const btn = document.createElement('div')
                const relFiF = relativeFiF(fileInFrame)
                btn.className = 'codeSnippetBtn'
                btn.style.cssText = fileSnippetBtnStyle(relFiF)
                
                greenBox.appendChild(btn)
        
                const snippetURL = 'https://voon-snippet.herokuapp.com/' + fileSnippet!.githubURL + '/blob/master/' + fileInFrame.fileURL
                fileBtn(btn, snippetURL, code, relFiF)
              }
            }
            frameDataShowing = currentFrame
          if (overlayShowing) {
            greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight) + SHOW
          } else {
            greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight) + HIDDEN
          }
        }
      }
    }
  }
  // if (
  //   sender.id === chrome.runtime.id &&
  //   message.from === Sender.Background &&
  //   message.message === Message.CHANGE_LIVECOMMENT_VISIBILITY
  // ) {
  //   console.log('Changing live comment visibility');
  //   const videoPlayer: any = document.getElementById('movie_player')
  //   if (videoPlayer) {
  //     videoPlayer.classList.toggle('ytp-autohide')
  //   }
  // }
  // if (
  //   sender.id === chrome.runtime.id &&
  //   message.from === Sender.Background &&
  //   message.message === Message.ACTIVATE_LIVECOMMENT
  // ) {
  //   console.log('Changing live comment visibility');
  //   const videoPlayer: any = document.getElementById('movie_player')
  //   if (videoPlayer) {
  //     videoPlayer.classList.toggle('ytp-autohide')
  //   }
  // }
}
// apply contentMessageListener to runtime
chrome.runtime.onMessage.addListener(contentMessageListener);