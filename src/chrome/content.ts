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
import { type } from "os";

// fundimentals
let videoId: string | undefined
let screen: HTMLElement | undefined
let screenHeight: string | undefined
let screenWidth: string | undefined
let videoPlayer: any | undefined
let overlayShowing: boolean | undefined
let htmlVideoPlayer: any | undefined
let currentTime: number | undefined
let duration: number | undefined
let redBox: HTMLElement | undefined
let greenBox: HTMLElement | undefined

// FileSnippet
let relativeFiF: Function | undefined
let fileSnippet: FileSnippetOut | undefined
let fileSnippetContainer: HTMLElement | undefined
let fileSnippetFunction: Function | undefined
let fileSnippetState: FileSnippet | undefined
let code: HTMLIFrameElement | undefined

// LiveComment
let liveCommentsContainer: HTMLElement | undefined
let liveComments: LiveCommentOut[] | undefined
let liveCommentState: LiveComment | undefined

const clock = () => {
  if (document.querySelector<HTMLElement>('.video-stream')) {
    screen = document.querySelector<HTMLElement>('.video-stream')!
    screenHeight = screen.style.height
    screenWidth = screen.style.width
    if (fileSnippetContainer) {
      fileSnippetContainer.style.cssText = `width: ${screenWidth}; height: ${screenHeight};`
    }
    if (liveCommentsContainer) {
      liveCommentsContainer.style.cssText = `width: ${Math.round(parseInt(screenWidth)/3)}px; max-height: ${screenHeight};`
    }

    if (redBox) {
      redBox.style.cssText = redBoxStyle(screenHeight)
    }

    if (videoPlayer && greenBox) {
      overlayShowing = !videoPlayer.classList.contains('ytp-autohide')
      if (overlayShowing) {
        greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight) + SHOW
      } else {
        greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight) + HIDDEN
      }
    }

    if (htmlVideoPlayer) {
      currentTime = htmlVideoPlayer.currentTime
      duration = htmlVideoPlayer.duration
    }
  }
  
  
  if (liveComments && liveCommentState && liveCommentState.state) {
    liveCommentFunction()
  }

  if (fileSnippet && fileSnippetState && fileSnippetState.state && fileSnippetFunction !== undefined) {
    fileSnippetFunction()
  }
}
setInterval(clock, 500)

const liveCommentFunction = async () => { 
  if (liveCommentsContainer) {
    liveCommentsContainer.innerHTML = ""

    const commentFilterByTime = () => {
      let orderedComments
      if (liveComments) {
        const filteredComments = liveComments.filter(comment => {
          if (currentTime) {
            if (Math.abs(comment.time - currentTime) < 1) {
              return true
            } else {
              return false
            }
          }
        })
        
        // order objects by a key in order of smallest to largest
        orderedComments = filteredComments.sort((a, b) => {
          return a.time - b.time
        })
      }
      orderedComments = orderedComments ? orderedComments : []
      return orderedComments
    }
    const relevantComments = commentFilterByTime()

    for (const comment of relevantComments) {
      let commentContainer = document.createElement('div')
      commentContainer.className = 'commentContainer'
      if (liveCommentState && liveCommentState.lowVisibility) {
        commentContainer.style.cssText = `opacity: 0.5;`
      }
  
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
      const showCommentSpacer = Boolean(comment.replies)
      createComment(
        comment.user,
        comment.comment,
        commentContainer,
        showCommentSpacer
      )
  
      if (comment.replies) {
        let repliesContainer = document.createElement('div')
        repliesContainer.className = 'repliesContainer'
  
        const lastReply = comment.replies[comment.replies.length - 1]
  
        for (const reply of comment.replies) {
          const showReplySpacer = reply.comment !== lastReply.comment
          createComment(
            reply.user,
            reply.comment,
            repliesContainer,
            showReplySpacer
          )
        }
  
        commentContainer.appendChild(repliesContainer)
      }
      if (liveCommentsContainer) {
        liveCommentsContainer.appendChild(commentContainer)
      }
    }
  }
}

const initiateFileSnippetContainer = () => {
  fileSnippetContainer = document.createElement('div')
  fileSnippetContainer.className = 'fileSnippetContainer'
  fileSnippetContainer.style.cssText = `width: ${screenWidth}; height: ${screenHeight};`
  if (greenBox) {
    greenBox.appendChild(fileSnippetContainer)
  }
}
const initiateLiveCommentsContainer = () => {
  liveCommentsContainer = document.createElement('div')
  liveCommentsContainer.className = 'liveCommentsContainer'
  liveCommentsContainer.style.cssText = `width: ${Math.round(parseInt(screenWidth!)/3)}px; height: ${screenHeight};`
  if (greenBox) {
    greenBox.appendChild(liveCommentsContainer)
  }
}


const onStorageChange = async (changes: any, namespace: any) => {
  const keysChanged = Object.keys(changes);
  console.log('Storage change: ', changes);
  
  
  if (keysChanged.includes('fileSnippet')) {
    fileSnippetState = changes.fileSnippet.newValue
    if (changes.fileSnippet.newValue && changes.fileSnippet.oldValue) {
      if (changes.fileSnippet.newValue.state !== changes.fileSnippet.oldValue.state) {
        // when fileSnippet activation changes
        if (changes.fileSnippet.newValue.state) {
          // when fileSnippet is activated
          initiateFileSnippetContainer()
          const queryInfo: chrome.tabs.QueryInfo = {
            active: true,
            currentWindow: true
          }
          chrome.tabs && chrome.tabs.query(queryInfo, (tabs: any) => {
            const message: ChromeMessage = {
              from: Sender.Content,
              message: Message.REQUEST_FILESNIPPET,
              tab: {
                id: tabs[0].id,
                url: tabs[0].url
              },
            }; 
            chrome.runtime.sendMessage(
              message
            );
          }) 
        }
        if (!changes.fileSnippet.newValue.state && fileSnippetContainer && code) {
          fileSnippetContainer.remove()
          fileSnippetContainer = undefined
          // HOTFIX
          code.remove()
          code = undefined
        }
      }
    }
  }
  if (keysChanged.includes('liveComment')) {
    liveCommentState = changes.liveComment.newValue
    if (changes.liveComment.newValue && changes.liveComment.oldValue) {
      if (changes.liveComment.newValue.state !== changes.liveComment.oldValue.state) {
        // when liveComment activation changes
        if (changes.liveComment.newValue.state) {
          initiateLiveCommentsContainer()
        }
        if (!changes.liveComment.newValue.state && liveCommentsContainer) {
          // when liveComment is deactivated
          liveCommentsContainer.remove()
          liveCommentsContainer = undefined
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
}
chrome.storage.onChanged.addListener(onStorageChange)

// content message listener function
let loadingURL = ''
let completeURL = ''

const resetContent = () => {
  console.log('Resetting content');
    
  if (greenBox !== undefined) {
    greenBox.innerHTML = ''
  }
  videoId = undefined
  screen = undefined
  screenHeight = undefined
  screenWidth = undefined
  videoPlayer = undefined
  overlayShowing = undefined
  htmlVideoPlayer = undefined
  currentTime = undefined
  duration = undefined
  if (redBox) {
    redBox.remove()
  }
  redBox = undefined
  if (greenBox) {
    greenBox.remove()
  }
  greenBox = undefined
  // FileSnippet
  relativeFiF = undefined
  fileSnippet = undefined
  if (fileSnippetContainer) {
    fileSnippetContainer.remove()
  }
  fileSnippetContainer = undefined
  fileSnippetFunction = undefined
  if (code) {
    code.remove()
  }
  code = undefined
  

  // LiveComment
  if (liveCommentsContainer) {
    liveCommentsContainer.remove()
  }
  liveCommentsContainer = undefined
  liveComments = undefined
}
const initiateEnvironment = (url: string) => {
  console.log('Initiating environment');
    
  // create a style element and append it to the head of the document
  const baseStyle = document.createElement('style');
  baseStyle.type = 'text/css';
  baseStyle.innerHTML = BASE_STYLE;
  document.head.appendChild(baseStyle);
  const videoURL = url
  videoId = videoURL.includes('v=') ? videoURL.split('v=')[1].split('&')[0] : videoURL.split('/')[3]
  
  // sets up containers red and green
  if (document.querySelector<HTMLElement>('.video-stream')) {
    screen = document.querySelector<HTMLElement>('.video-stream')!
  }
  if (screen) {
    screenHeight = screen.style.height
    screenWidth = screen.style.width
  }

  redBox = document.createElement('div')
  redBox.id = 'redBox'
  greenBox = document.createElement('div')
  greenBox.id = 'greenBox'
  if (screenHeight && screenWidth) {
    redBox.style.cssText = redBoxStyle(screenHeight)
    greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight)
  }

  videoPlayer = document.getElementById('movie_player')
  overlayShowing = !videoPlayer.classList.contains('ytp-autohide')

  htmlVideoPlayer = document.getElementsByTagName('video')[0]
  currentTime = htmlVideoPlayer.currentTime
  duration = htmlVideoPlayer.duration

  chrome.storage.sync.get(['fileSnippet', 'liveComment'], (res) => {
    if (res.fileSnippet) {
      fileSnippetState = res.fileSnippet
      if (fileSnippetState && fileSnippetState.state) {
        initiateFileSnippetContainer()
      }
    }
    if (res.liveComment) {
      liveCommentState = res.liveComment
      if (liveCommentState && liveCommentState.state) {
        initiateLiveCommentsContainer()
      }
    }
  })

  if (greenBox) {
    redBox.appendChild(greenBox)
  }
  if (screen) {
    screen.parentElement?.parentElement?.appendChild(redBox)
  }
}

const contentMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.STATUS_UPDATE
  ) {
    if (message.payload.status === 'loading' && message.payload.url !== loadingURL && message.tab) {
      // because on the first load the content is not ready the loadingURL is '' and so on the first navigation
      console.log('Status feed indicates navigation. Running reset');
      
      // loadingURL = message.payload.url
      resetContent()
    }
    if (message.payload.status === 'complete' && message.payload.url !== completeURL && message.tab) {
      console.log('Status feed indicates navigation. Running initiation');
      // HOTFIX: loadingURL should be changed only when status = loading
      loadingURL = message.payload.url
      completeURL = message.payload.url
      // send a message to the background for a RESET_CONTENT 
      const messageToSend: ChromeMessage = {
        from: Sender.Content,
        message: Message.INITIATE_ENVIRONMENT,
        tab: {id: message.tab.id, url: message.payload.url}
      };
      chrome.runtime.sendMessage(messageToSend);
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.RESET_CONTENT
  ) {
    resetContent()
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.HAS_FILESNIPPET
  ) {
    console.log('Does file snippet exist: ', Boolean(fileSnippet));
    if (fileSnippet) {
      const message: ChromeMessage = {
        from: Sender.Content,
        message: Message.HAS_FILESNIPPET
      }; 
      chrome.runtime.sendMessage(
        message
      );
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.INITIATE_ENVIRONMENT
  ) {
    initiateEnvironment(message.payload.url)
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.VIDEODETAILS
  ) {
    console.log('Responding video details');
    
    const message: ChromeMessage = {
      from: Sender.Content,
      message: Message.VIDEODETAILS,
      payload: {
        duration,
        currentTime
      }
    }; 
    chrome.runtime.sendMessage(
      message
    );
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_LIVECOMMENT
  ) {
    console.log('Activating live comments: ', message.payload.liveComments);
    liveComments = message.payload.liveComments
    liveCommentFunction()
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_FILESNIPPET
  ) {
    console.log('Activating file snippet: ', message.payload.fileSnippet);
    fileSnippet = message.payload.fileSnippet
    
    if (fileSnippet) {
      relativeFiF = (fileInFrame: DataInFrame): DataInFrame | undefined => {
        if (screenHeight && screenWidth && fileSnippet) {
          const xRatio = parseInt(screenWidth) / fileSnippet.width
          const yRatio = parseInt(screenHeight) / fileSnippet.height
          const newFileInFrame = {...fileInFrame}
          newFileInFrame['x'] = Math.round(fileInFrame.x*xRatio)
          newFileInFrame['width'] = Math.round(fileInFrame.width*xRatio)
          newFileInFrame['y'] = Math.round(fileInFrame.y*yRatio)
          newFileInFrame['height'] = Math.floor(fileInFrame.height*yRatio)
          return newFileInFrame
        }
        return undefined
      }
      
      code = document.createElement('iframe')
      code.style.display = 'none'
      // HOTFIX: the code element should be added to fileSnippetContainer
      if (greenBox) {
        greenBox.appendChild(code)
      }
      
      const fileBtn = (ele: HTMLElement, url: string, codeFrame: HTMLIFrameElement, relFiF: any) => {
        const centerFiF =  relFiF.x + (relFiF.width/2)
        let isFiFRightMost: Boolean
        if (screenWidth) {
          isFiFRightMost = centerFiF > (parseInt(screenWidth)/2) ? true : false
        } else {
          isFiFRightMost = true
        }
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
          
          if (screenHeight && screenWidth && code) {
            if (isFiFRightMost) {
              code.style.cssText = codeSnippetRMStyle(currentDisplay, relFiF, screenHeight)
            } else {
              const endFiF = relFiF.x+relFiF.width
              code.style.cssText = codeSnippetLMStyle(currentDisplay, endFiF, screenWidth, screenHeight)
            }
          }
        })
      }
      
      const currentFrameData = (htmlVideoPlayer: any): FrameDataOut | undefined => {
        if (fileSnippet) {
          const disparityTolerance = duration ? 1/duration : 0
    
          const voonFrameDuration = 1/fileSnippet.fps
          
          const absoluteTimeDifference = (frame: number) => {
            return currentTime ? Math.abs(currentTime-(voonFrameDuration*frame)) : 0
          }
  
          let currentFrameData = fileSnippet.frameData.filter((fd: FrameDataOut) => {
              if (absoluteTimeDifference(fd.frame) <= 10) {
                return true
              } else {
                return false
              }
          })
  
          const orderedComments = currentFrameData.sort((a, b) => {
            return absoluteTimeDifference(a.frame) - absoluteTimeDifference(b.frame)
          })
  
          if (orderedComments.length > 0) {
            return orderedComments[0]
          } else {
            return undefined
          }
        }
        return undefined
      }
      
      // runs every equidistant amt of time
      let frameDataShowing: number | undefined


      fileSnippetFunction = () => {
        const videoPlayer: any = document.getElementById('movie_player')
        const htmlVideoPlayer: any = document.getElementsByTagName('video')[0]
        
        if (videoPlayer){
          const currentFD = currentFrameData(htmlVideoPlayer)
          const currentFrame = currentFD ? currentFD.frame : undefined
            
          // code.style.display = 'none'
          if (fileSnippetContainer) {
            fileSnippetContainer.innerHTML = ''
          }
          
          
          if (currentFD) {
            if (fileSnippetContainer) {
            
              for (const fileInFrame of currentFD.fileInFrames) {
                const btn = document.createElement('div')
                let relFiF
                if (relativeFiF !== undefined) {
                  relFiF = relativeFiF(fileInFrame)
                }
                btn.className = 'codeSnippetBtn'
                btn.style.cssText = fileSnippetBtnStyle(relFiF)
                
                fileSnippetContainer.appendChild(btn)
                if (fileSnippet && code) {
                  const snippetURL = 'https://voon-snippet.herokuapp.com/' + fileSnippet.githubURL + '/blob/master/' + fileInFrame.fileURL
                  fileBtn(btn, snippetURL, code, relFiF)
                }
              }
            }
          }
          frameDataShowing = currentFrame
          if (fileSnippetContainer) {
            if (overlayShowing) {
              fileSnippetContainer.style.cssText = fileSnippetContainer.style.cssText + SHOW
            } else {
              fileSnippetContainer.style.cssText = fileSnippetContainer.style.cssText + HIDDEN
            }
          }
        }
      }
    }
    
  }
}
chrome.runtime.onMessage.addListener(contentMessageListener);