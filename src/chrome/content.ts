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
let videoId: string
let screen: HTMLElement
let screenHeight: string
let screenWidth: string
let videoPlayer: any
let overlayShowing: boolean
let htmlVideoPlayer: any
let currentTime: number
let duration: number
let redBox: HTMLElement
let greenBox: HTMLElement

// FileSnippet
let relativeFiF: Function
let fileSnippet: FileSnippetOut | undefined
let fileSnippetContainer: HTMLElement | undefined
let fileSnippetFunction: Function
let fileSnippetState: FileSnippet

// LiveComment
let liveCommentsContainer: HTMLElement | undefined
let liveComments: LiveCommentOut[] | undefined
let liveCommentState: LiveComment

// const readComments = () => {
//   let commentThreads = document.querySelectorAll('ytd-comment-thread-renderer')
//   let commentThread = commentThreads[1]
//   let commentBody = commentThread.querySelector("#main")
//   let replies = commentThread.querySelector("#replies").querySelectorAll("ytd-comment-replies-renderer")
//   let reply = replies[0]
//   let replyBody = reply.querySelector("#main")
//   // works for both comment and reply
//   let commentHead

//   // scrape comments and replies from youtube dom and store them in a json object
//   let comments = []
//   if (commentBody) {
//     let comment = {
//       id: commentBody.getAttribute('id'),
//       author: commentBody.querySelector('ytd-comment-user-renderer').getAttribute('data-ytid'),
//       authorImage: commentBody.querySelector('ytd-comment-user-renderer').getAttribute('src'),
//       authorName: commentBody.querySelector('ytd-comment-user-renderer').getAttribute('aria-label'),
//       authorUrl: commentBody.querySelector('ytd-comment-user-renderer').getAttribute('href'),
//       text: commentBody.querySelector('ytd-comment-text-renderer').innerHTML,
//       time: commentBody.querySelector('yt-formatted-string').innerHTML,
//       replyCount: reply.querySelector('ytd-comment-replies-renderer').getAttribute('aria-label'),
//       replies: []
//     }
//     comments.push(comment)
//   }
//   if (replies) {
//     for (let i = 0; i < replies.length; i++) {
//       let reply = {
//         id: replies[i].getAttribute('id'),
//         author: replies[i].querySelector('ytd-comment-user-renderer').getAttribute('data-ytid'),
//         authorImage: replies[i].querySelector('ytd-comment-user-renderer').getAttribute('src'),
//         authorName: replies[i].querySelector('ytd-comment-user-renderer').getAttribute('aria-label'),
//         authorUrl: replies[i].querySelector('ytd-comment-user-renderer').getAttribute('href'),
//         text: replies[i].querySelector('ytd-comment-text-renderer').innerHTML,
//         time: replies[i].querySelector('yt-formatted-string').innerHTML,
//         replyCount: replies[i].querySelector('ytd-comment-replies-renderer').getAttribute('aria-label'),
//         replies: []
//       }
//       comments[i].replies.push
// }

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

    redBox.style.cssText = redBoxStyle(screenHeight)
    overlayShowing = !videoPlayer.classList.contains('ytp-autohide')
    if (overlayShowing) {
      greenBox!.style.cssText = greenBoxStyle(screenWidth, screenHeight) + SHOW
    } else {
      greenBox!.style.cssText = greenBoxStyle(screenWidth, screenHeight) + HIDDEN
    }

    currentTime = htmlVideoPlayer.currentTime
    duration = htmlVideoPlayer.duration
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
  liveCommentsContainer!.innerHTML = ""

  const commentFilterByTime = () => {
    const filteredComments = liveComments!.filter(comment => {
      if (Math.abs(comment.time - currentTime) < 1) {
        return true
      } else {
        return false
      }
    })
    // order objects by a key in order of smallest to largest
    const orderedComments = filteredComments.sort((a, b) => {
      return a.time - b.time
    })

    return orderedComments
  }
  const relevantComments = commentFilterByTime()
  
  for (const comment of relevantComments) {
    let commentContainer = document.createElement('div')
    commentContainer.className = 'commentContainer'
    if (liveCommentState.lowVisibility) {
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

    liveCommentsContainer!.appendChild(commentContainer)
  }
}

const initiateFileSnippetContainer = () => {
  fileSnippetContainer = document.createElement('div')
  fileSnippetContainer.className = 'fileSnippetContainer'
  fileSnippetContainer.style.cssText = `width: ${screenWidth}; height: ${screenHeight};`
  greenBox!.appendChild(fileSnippetContainer)
}
const initiateLiveCommentsContainer = () => {
  liveCommentsContainer = document.createElement('div')
  liveCommentsContainer.className = 'liveCommentsContainer'
  liveCommentsContainer.style.cssText = `width: ${Math.round(parseInt(screenWidth)/3)}px; height: ${screenHeight};`
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
        initiateFileSnippetContainer()
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
        fileSnippetContainer!.remove()
        fileSnippetContainer = undefined
      }
    }
  }
  if (keysChanged.includes('liveComment')) {
    liveCommentState = changes.liveComment.newValue
    
    if (changes.liveComment.newValue.state !== changes.liveComment.oldValue.state) {
      // when liveComment activation changes
      if (changes.liveComment.newValue.state) {
        initiateLiveCommentsContainer()
      }
      if (!changes.liveComment.newValue.state) {
        // when liveComment is deactivated
        liveCommentsContainer!.remove()
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
chrome.storage.onChanged.addListener(onStorageChange)

// content message listener function
const contentMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
  console.log('Message recieved: ', message);
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.HAS_FILESNIPPET
  ) {
    if (fileSnippet) {
      console.log(`fileSnippet already exists`);
      
      const message: ChromeMessage = {
        from: Sender.Content,
        message: Message.HAS_FILESNIPPET
      }; 
      chrome.runtime.sendMessage(
        message
      );
    } else {
      console.log(`fileSnippet does not exist`);
      
    }

  }
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

    videoPlayer = document.getElementById('movie_player')
    overlayShowing = videoPlayer.classList.contains('ytp-autohide')

    htmlVideoPlayer = document.getElementsByTagName('video')[0]
    currentTime = htmlVideoPlayer.currentTime
    duration = htmlVideoPlayer.duration

    chrome.storage.sync.get(['fileSnippet', 'liveComment'], (res) => {
      if (res.fileSnippet) {
        fileSnippetState = res.fileSnippet
        if (fileSnippetState.state) {
          initiateFileSnippetContainer()
        }
      }
      if (res.liveComment) {
        liveCommentState = res.liveComment
        if (liveCommentState.state) {
          initiateLiveCommentsContainer()
        }
      }
    })

    redBox.appendChild(greenBox!)
    screen.parentElement?.parentElement?.appendChild(redBox)
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_LIVECOMMENT
  ) {
    console.log('Live comments: ', message.payload.liveComments);
    liveComments = message.payload.liveComments
    liveCommentFunction()
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
        const disparityTolerance = 1/duration
    
        const voonFrameDuration = 1/fileSnippet!.fps
        
        const absoluteTimeDifference = (frame: number) => {
          return Math.abs(currentTime-(voonFrameDuration*frame))
        }

        let currentFrameData = fileSnippet!.frameData.filter((fd: FrameDataOut) => {
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
      
      // runs every equidistant amt of time
      let frameDataShowing: number | undefined
      fileSnippetFunction = () => {
        
        const videoPlayer: any = document.getElementById('movie_player')
        const htmlVideoPlayer: any = document.getElementsByTagName('video')[0]
        
        if (videoPlayer){
          const currentFD = currentFrameData(htmlVideoPlayer)
          const currentFrame = currentFD ? currentFD.frame : undefined
          // if (currentFrame !== frameDataShowing) {
            // console.log('Changed frameData to frame: ', currentFrame);
            
            code.style.display = 'none'
            fileSnippetContainer!.innerHTML = ''
            
            
            if (currentFD) {
              fileSnippetContainer!.appendChild(code)
              
              for (const fileInFrame of currentFD.fileInFrames) {
                const btn = document.createElement('div')
                const relFiF = relativeFiF(fileInFrame)
                btn.className = 'codeSnippetBtn'
                btn.style.cssText = fileSnippetBtnStyle(relFiF)
                
                fileSnippetContainer!.appendChild(btn)
        
                const snippetURL = 'https://voon-snippet.herokuapp.com/' + fileSnippet!.githubURL + '/blob/master/' + fileInFrame.fileURL
                fileBtn(btn, snippetURL, code, relFiF)
              }
            }
            frameDataShowing = currentFrame
          if (overlayShowing) {
            fileSnippetContainer!.style.cssText = fileSnippetContainer!.style.cssText + SHOW
          } else {
            fileSnippetContainer!.style.cssText = fileSnippetContainer!.style.cssText + HIDDEN
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