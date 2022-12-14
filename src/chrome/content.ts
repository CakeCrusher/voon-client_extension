import {
  ChromeMessage,
  Sender,
  Message,
  FileSnippetOut,
  FrameDataOut,
  FileSnippet,
  LiveComment,
  LiveCommentOut,
  DataInFrameOut,
} from "../types";
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

// navigation
let loadingURL = "";
let completeURL = "";
// fundimentals
let screen: HTMLElement | null;
let screenHeight: string | undefined;
let screenWidth: string | undefined;
let videoPlayer: HTMLElement | null;
let overlayShowing: boolean | undefined;
let htmlVideoPlayer: HTMLVideoElement | null;
let currentTime: number | undefined;
let duration: number | undefined;
let redBox: HTMLElement | undefined;
let greenBox: HTMLElement | undefined;
// FileSnippet
let fileSnippet: FileSnippetOut | undefined;
let fileSnippetContainer: HTMLElement | undefined;
let fileSnippetState: FileSnippet | undefined;
let code: HTMLIFrameElement | undefined;
// LiveComment
let liveCommentsContainer: HTMLElement | undefined;
let liveComments: LiveCommentOut[] | undefined;
let liveCommentState: LiveComment | undefined;
// CONTRIBUTE: Add the states of your app here

// make a chrome.storage.onChanged function with typescript

// create a chrome extension listener for when storage changes

// Storage management
const onStorageChange = async (changes: any) => {
  const keysChanged = Object.keys(changes);
  console.log("Storage change: ", changes);

  if (keysChanged.includes("fileSnippet")) {
    fileSnippetState = changes.fileSnippet.newValue;
    if (changes.fileSnippet.newValue && changes.fileSnippet.oldValue) {
      if (
        changes.fileSnippet.newValue.state !==
        changes.fileSnippet.oldValue.state
      ) {
        // when fileSnippet activation changes
        if (changes.fileSnippet.newValue.state) {
          // when fileSnippet is activated
          initiateFileSnippetContainer();
          const queryInfo: chrome.tabs.QueryInfo = {
            active: true,
            currentWindow: true,
          };
          chrome.tabs &&
            chrome.tabs.query(queryInfo, (tabs: any) => {
              const message: ChromeMessage = {
                from: Sender.Content,
                message: Message.REQUEST_FILESNIPPET,
                tab: {
                  id: tabs[0].id,
                  url: tabs[0].url,
                },
              };
              chrome.runtime.sendMessage(message);
            });
        }
        if (
          !changes.fileSnippet.newValue.state &&
          fileSnippetContainer &&
          code
        ) {
          fileSnippetContainer.remove();
          fileSnippetContainer = undefined;
          // HOTFIX
          code.remove();
          code = undefined;
        }
      }
    }
  }
  if (keysChanged.includes("liveComment")) {
    liveCommentState = changes.liveComment.newValue;
    if (changes.liveComment.newValue && changes.liveComment.oldValue) {
      if (
        changes.liveComment.newValue.state !==
        changes.liveComment.oldValue.state
      ) {
        // when liveComment activation changes
        if (changes.liveComment.newValue.state) {
          initiateLiveCommentsContainer();
        }
        if (!changes.liveComment.newValue.state && liveCommentsContainer) {
          // when liveComment is deactivated
          liveCommentsContainer.remove();
          liveCommentsContainer = undefined;
        }
      }
      if (
        changes.liveComment.newValue.lowVisibility !==
        changes.liveComment.oldValue.lowVisibility
      ) {
        // when liveComment activation changes
        if (changes.liveComment.newValue.lowVisibility) {
          // when liveComment has low visibility
        } else {
          // when liveComment has normal visibility
        }
      }
    }
  }
};
chrome.storage.onChanged.addListener(onStorageChange);
const initiateFileSnippetContainer = () => {
  // HOTFIX: the code element should be added to fileSnippetContainer
  code = document.createElement("iframe");
  code.style.display = "none";
  if (greenBox) {
    greenBox.appendChild(code);
  }

  fileSnippetContainer = document.createElement("div");
  fileSnippetContainer.className = "fileSnippetContainer";
  fileSnippetContainer.style.cssText = `width: ${screenWidth}; height: ${screenHeight};`;
  if (greenBox) {
    greenBox.appendChild(fileSnippetContainer);
  }
};
const initiateLiveCommentsContainer = () => {
  liveCommentsContainer = document.createElement("div");
  liveCommentsContainer.className = "liveCommentsContainer";
  if (screenWidth) {
    liveCommentsContainer.style.cssText = `width: ${Math.round(
      parseInt(screenWidth) / 3
    )}px; height: ${screenHeight};`;
  }
  if (greenBox) {
    greenBox.appendChild(liveCommentsContainer);
  }
};

// Extension messaging
const contentMessageListener = async (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender
) => {
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.STATUS_UPDATE
  ) {
    if (
      message.payload.status === "loading" &&
      message.payload.url !== loadingURL &&
      message.tab
    ) {
      // because on the first load the content is not ready the loadingURL is '' and so on the first navigation
      console.log("Status feed indicates navigation. Running reset");

      // loadingURL = message.payload.url
      resetContent();
    }
    if (
      message.payload.status === "complete" &&
      message.payload.url !== completeURL &&
      message.tab
    ) {
      console.log("Status feed indicates navigation. Running initiation");
      // HOTFIX: loadingURL should be changed only when status = loading
      loadingURL = message.payload.url;
      completeURL = message.payload.url;
      // send a message to the background for a RESET_CONTENT
      const messageToSend: ChromeMessage = {
        from: Sender.Content,
        message: Message.INITIATE_ENVIRONMENT,
        tab: { id: message.tab.id, url: message.payload.url },
      };
      chrome.runtime.sendMessage(messageToSend);
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.RESET_CONTENT
  ) {
    resetContent();
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.HAS_FILESNIPPET
  ) {
    console.log("Does file snippet exist: ", Boolean(fileSnippet));
    if (fileSnippet) {
      const message: ChromeMessage = {
        from: Sender.Content,
        message: Message.HAS_FILESNIPPET,
      };
      chrome.runtime.sendMessage(message);
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.INITIATE_ENVIRONMENT
  ) {
    initiateEnvironment();
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.VIDEODETAILS
  ) {
    console.log("Responding video details");

    const message: ChromeMessage = {
      from: Sender.Content,
      message: Message.VIDEODETAILS,
      payload: {
        duration,
        currentTime,
      },
    };
    chrome.runtime.sendMessage(message);
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_LIVECOMMENT
  ) {
    console.log("Activating live comments: ", message.payload.liveComments);
    liveComments = message.payload.liveComments;
    liveCommentFunction();
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Background &&
    message.message === Message.ACTIVATE_FILESNIPPET
  ) {
    console.log("Activating file snippet: ", message.payload.fileSnippet);
    fileSnippet = message.payload.fileSnippet;
    fileSnippetFunction();
  }
  // CONTRIBUTE: update the state of your app here
};
chrome.runtime.onMessage.addListener(contentMessageListener);
const resetContent = () => {
  console.log("Resetting content");

  if (greenBox !== undefined) {
    greenBox.innerHTML = "";
  }
  screen = null;
  screenHeight = undefined;
  screenWidth = undefined;
  videoPlayer = null;
  overlayShowing = undefined;
  htmlVideoPlayer = null;
  currentTime = undefined;
  duration = undefined;
  if (redBox) {
    redBox.remove();
  }
  redBox = undefined;
  if (greenBox) {
    greenBox.remove();
  }
  greenBox = undefined;
  // FileSnippet
  fileSnippet = undefined;
  if (fileSnippetContainer) {
    fileSnippetContainer.remove();
  }
  fileSnippetContainer = undefined;
  if (code) {
    code.remove();
  }
  code = undefined;

  // LiveComment
  if (liveCommentsContainer) {
    liveCommentsContainer.remove();
  }
  liveCommentsContainer = undefined;
  liveComments = undefined;
};
const initiateEnvironment = () => {
  console.log("Initiating environment");

  // create a style element and append it to the head of the document
  const baseStyle = document.createElement("style");
  baseStyle.type = "text/css";
  baseStyle.innerHTML = BASE_STYLE;
  document.head.appendChild(baseStyle);

  // sets up containers red and green
  if (document.querySelector<HTMLElement>(".video-stream")) {
    screen = document.querySelector<HTMLElement>(".video-stream");
  }
  if (screen) {
    screenHeight = screen.style.height;
    screenWidth = screen.style.width;
  }

  redBox = document.createElement("div");
  redBox.id = "redBox";
  greenBox = document.createElement("div");
  greenBox.id = "greenBox";
  if (screenHeight && screenWidth) {
    redBox.style.cssText = redBoxStyle(screenHeight);
    greenBox.style.cssText = greenBoxStyle(screenWidth, screenHeight);
  }

  videoPlayer = document.getElementById("movie_player");
  if (videoPlayer) {
    overlayShowing = !videoPlayer.classList.contains("ytp-autohide");
  }

  htmlVideoPlayer = document.getElementsByTagName("video")[0];
  currentTime = htmlVideoPlayer.currentTime;
  duration = htmlVideoPlayer.duration;

  chrome.storage.sync.get(["fileSnippet", "liveComment"], (res) => {
    if (res.fileSnippet) {
      fileSnippetState = res.fileSnippet;
      if (fileSnippetState && fileSnippetState.state) {
        initiateFileSnippetContainer();
      }
    }
    if (res.liveComment) {
      liveCommentState = res.liveComment;
      if (liveCommentState && liveCommentState.state) {
        initiateLiveCommentsContainer();
      }
    }
  });

  if (greenBox) {
    redBox.appendChild(greenBox);
  }
  if (screen) {
    screen.parentElement?.parentElement?.appendChild(redBox);
  }
};
const liveCommentFunction = async () => {
  if (liveCommentsContainer) {
    liveCommentsContainer.innerHTML = "";

    const commentFilterByTime = () => {
      let orderedComments;
      if (liveComments) {
        const filteredComments = liveComments.filter((comment) => {
          if (currentTime) {
            if (Math.abs(comment.time - currentTime) < 1) {
              return true;
            } else {
              return false;
            }
          }
        });

        // order objects by a key in order of smallest to largest
        orderedComments = filteredComments.sort((a, b) => {
          return a.time - b.time;
        });
      }
      orderedComments = orderedComments ? orderedComments : [];
      return orderedComments;
    };
    const relevantComments = commentFilterByTime();

    for (const comment of relevantComments) {
      const commentContainer = document.createElement("div");
      commentContainer.className = "commentContainer";
      if (liveCommentState && liveCommentState.lowVisibility) {
        commentContainer.style.cssText = `opacity: 0.5;`;
      }

      const createComment = (
        user: string,
        comment: string,
        container: HTMLElement,
        showSpacer = true
      ) => {
        const commentHead = document.createElement("div");
        commentHead.className = "commentHead";
        commentHead.innerText = user;
        container.appendChild(commentHead);

        const commentBody = document.createElement("div");
        commentBody.className = "commentBody";
        commentBody.innerText = comment;
        container.appendChild(commentBody);

        if (showSpacer) {
          const spacer = document.createElement("div");
          spacer.className = "spacer";
          container.appendChild(spacer);
        }
      };
      const showCommentSpacer = Boolean(comment.replies);
      createComment(
        comment.user,
        comment.comment,
        commentContainer,
        showCommentSpacer
      );

      if (comment.replies) {
        const repliesContainer = document.createElement("div");
        repliesContainer.className = "repliesContainer";

        const lastReply = comment.replies[comment.replies.length - 1];

        for (const reply of comment.replies) {
          const showReplySpacer = reply.comment !== lastReply.comment;
          createComment(
            reply.user,
            reply.comment,
            repliesContainer,
            showReplySpacer
          );
        }

        commentContainer.appendChild(repliesContainer);
      }
      if (liveCommentsContainer) {
        liveCommentsContainer.appendChild(commentContainer);
      }
    }
  }
};
const fileSnippetFunction = () => {
  videoPlayer = document.getElementById("movie_player");
  htmlVideoPlayer = document.getElementsByTagName("video")[0];

  const fileBtn = (
    ele: HTMLElement,
    url: string,
    codeFrame: HTMLIFrameElement,
    relFiF: DataInFrameOut
  ) => {
    const centerFiF = relFiF.x + relFiF.width / 2;
    let isFiFRightMost: boolean;
    if (screenWidth) {
      isFiFRightMost = centerFiF > parseInt(screenWidth) / 2 ? true : false;
    } else {
      isFiFRightMost = true;
    }
    ele.addEventListener("click", () => {
      console.log("FiF: ", relFiF);
      console.log("RightMost: ", isFiFRightMost);

      let currentDisplay;
      if (codeFrame.src == url && codeFrame.style.display == "block") {
        currentDisplay = "none";
      } else {
        currentDisplay = "block";
      }
      codeFrame.src = url;

      if (screenHeight && screenWidth && code) {
        if (isFiFRightMost) {
          code.style.cssText = codeSnippetRMStyle(
            currentDisplay,
            relFiF,
            screenHeight
          );
        } else {
          const endFiF = relFiF.x + relFiF.width;
          code.style.cssText = codeSnippetLMStyle(
            currentDisplay,
            endFiF,
            screenWidth,
            screenHeight
          );
        }
      }
    });
  };

  const currentFrameData = (): FrameDataOut | undefined => {
    if (fileSnippet) {
      const voonFrameDuration = 1 / fileSnippet.fps;

      const absoluteTimeDifference = (frame: number) => {
        return currentTime
          ? Math.abs(currentTime - voonFrameDuration * frame)
          : 0;
      };

      const currentFrameData = fileSnippet.frameData.filter(
        (fd: FrameDataOut) => {
          if (absoluteTimeDifference(fd.frame) <= 10) {
            return true;
          } else {
            return false;
          }
        }
      );

      const orderedComments = currentFrameData.sort((a, b) => {
        return (
          absoluteTimeDifference(a.frame) - absoluteTimeDifference(b.frame)
        );
      });

      if (orderedComments.length > 0) {
        return orderedComments[0];
      } else {
        return undefined;
      }
    }
    return undefined;
  };

  const relativeFiF = (
    screenWidth: string,
    screenHeight: string,
    fileInFrame: DataInFrameOut
  ): DataInFrameOut | undefined => {
    if (screenHeight && screenWidth && fileSnippet) {
      const xRatio = parseInt(screenWidth) / fileSnippet.width;
      const yRatio = parseInt(screenHeight) / fileSnippet.height;
      const newFileInFrame = { ...fileInFrame };
      newFileInFrame["x"] = Math.round(fileInFrame.x * xRatio);
      newFileInFrame["width"] = Math.round(fileInFrame.width * xRatio);
      newFileInFrame["y"] = Math.round(fileInFrame.y * yRatio);
      newFileInFrame["height"] = Math.floor(fileInFrame.height * yRatio);
      return newFileInFrame;
    }
    return undefined;
  };

  if (videoPlayer) {
    const currentFD = currentFrameData();

    // code.style.display = 'none'
    if (fileSnippetContainer) {
      fileSnippetContainer.innerHTML = "";
    }

    if (currentFD) {
      if (fileSnippetContainer) {
        for (const fileInFrame of currentFD.fileInFrames) {
          const btn = document.createElement("div");
          let relFiF: DataInFrameOut | undefined;
          if (screenWidth && screenHeight && fileSnippet && fileInFrame) {
            relFiF = relativeFiF(screenWidth, screenHeight, fileInFrame);
          }
          btn.className = "codeSnippetBtn";
          if (relFiF) {
            btn.style.cssText = fileSnippetBtnStyle(relFiF);
          }

          fileSnippetContainer.appendChild(btn);
          if (fileSnippet && code) {
            const snippetURL =
              "https://voon-snippet.herokuapp.com/" +
              fileSnippet.githubURL +
              "/blob/master/" +
              fileInFrame.fileURL;
            if (relFiF) {
              fileBtn(btn, snippetURL, code, relFiF);
            }
          }
        }
      }
    }
    if (fileSnippetContainer) {
      if (overlayShowing) {
        fileSnippetContainer.style.cssText =
          fileSnippetContainer.style.cssText + SHOW;
      } else {
        fileSnippetContainer.style.cssText =
          fileSnippetContainer.style.cssText + HIDDEN;
      }
    }
  }
};

// live with video
const clock = () => {
  screen = document.querySelector<HTMLElement>(".video-stream");
  if (screen) {
    screenHeight = screen.style.height;
    screenWidth = screen.style.width;
    if (fileSnippetContainer) {
      fileSnippetContainer.style.cssText = `width: ${screenWidth}; height: ${screenHeight};`;
    }
    if (liveCommentsContainer) {
      liveCommentsContainer.style.cssText = `width: ${Math.round(
        parseInt(screenWidth) / 3
      )}px; max-height: ${screenHeight};`;
    }

    if (redBox) {
      redBox.style.cssText = redBoxStyle(screenHeight);
    }

    if (videoPlayer && greenBox) {
      overlayShowing = !videoPlayer.classList.contains("ytp-autohide");
      if (overlayShowing) {
        greenBox.style.cssText =
          greenBoxStyle(screenWidth, screenHeight) + SHOW;
      } else {
        greenBox.style.cssText =
          greenBoxStyle(screenWidth, screenHeight) + HIDDEN;
      }
    }

    if (htmlVideoPlayer) {
      currentTime = htmlVideoPlayer.currentTime;
      duration = htmlVideoPlayer.duration;
    }
  }

  if (liveComments && liveCommentState && liveCommentState.state) {
    liveCommentFunction();
  }

  if (fileSnippet && fileSnippetState && fileSnippetState.state) {
    fileSnippetFunction();
  }
  // CONTRIBUTE: Add script under the conditions that the state is activated
};
setInterval(clock, 500);
