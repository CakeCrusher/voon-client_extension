import { ChromeMessage, LiveCommentIn, Message, Sender } from "../types";
import {
  fetchGraphQL,
  fetchLiveComments,
  createFileSnippet,
} from "../helperFunctions";
import { GET_VIDEO_FILESNIPPET } from "../schemas";

const onUpdatedListener = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  if (changeInfo && changeInfo.status) {
    const payload = {
      status: changeInfo.status,
      url: tab.url,
    };
    console.log("Sending status update: ", payload);

    const message: ChromeMessage = {
      from: Sender.Background,
      message: Message.STATUS_UPDATE,
      tab: { id: tabId },
      payload,
    };
    chrome.tabs.sendMessage(tabId, message);
  }
};
chrome.tabs.onUpdated.addListener(onUpdatedListener);

const onMessageListener = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender
) => {
  if (
    sender.id === chrome.runtime.id &&
    (message.from === Sender.React || message.from === Sender.Content) &&
    message.message === Message.REQUEST_FILESNIPPET
  ) {
    console.log("Sending file snippet to tab as requested by React");
    if (message.tab && message.tab.id && message.tab.url) {
      sendFileSnippetIfAvailable(message.tab.id, message.tab.url);
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.Content &&
    message.message === Message.INITIATE_ENVIRONMENT
  ) {
    if (message.tab && message.tab.id && message.tab.url) {
      console.log("Initiating content");
      initiateEnvironmentIfPossible(message.tab.id, message.tab.url);
      setTimeout(() => {
        if (message.tab && message.tab.id && message.tab.url) {
          sendFileSnippetIfAvailable(message.tab.id, message.tab.url);
          sendLiveCommentIfAvailable(message.tab.id, message.tab.url);
        }
      }, 100);
    }
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.CREATE_FILESNIPPET
  ) {
    console.log("Creating file snippet as requested by React");

    if (message.tab && message.tab.url && message.tab.id) {
      createFileSnippet(message.tab.url, message.payload.fps);
    }
  }
  // CONTRIBUTE: Add condition to act on your messages
};
chrome.runtime.onMessage.addListener(onMessageListener);
const initiateEnvironmentIfPossible = async (tabId: number, url: string) => {
  if (url && url.includes("www.youtube.com/watch?v=")) {
    console.log(`Inititating environment for ${url}`);
    const message: ChromeMessage = {
      from: Sender.Background,
      message: Message.INITIATE_ENVIRONMENT,
      payload: { url },
    };
    chrome.tabs.sendMessage(tabId, message);
  } else {
    console.log(`Not a youtube video ${url}`);
  }
};
const sendFileSnippetIfAvailable = async (tabId: number, url: string) => {
  if (url && url.includes("www.youtube.com/watch?v=")) {
    const videoId = url.includes("v=") ? url.split("v=")[1] : url.split("/")[4];
    const variables = { videoId };
    const getFileSnippet = await fetchGraphQL(GET_VIDEO_FILESNIPPET, variables);
    const fileSnippet = getFileSnippet.data.video_by_pk
      ? getFileSnippet.data.video_by_pk.fileSnippets[0]
      : undefined;
    console.log("fileSnippet: ", fileSnippet);

    if (fileSnippet) {
      const message: ChromeMessage = {
        from: Sender.Background,
        message: Message.ACTIVATE_FILESNIPPET,
        payload: { fileSnippet },
      };
      chrome.tabs.sendMessage(tabId, message);
    }
  }
};
const sendLiveCommentIfAvailable = async (tabId: number, url: string) => {
  if (url && url.includes("www.youtube.com/watch?v=")) {
    const videoId = url.includes("v=") ? url.split("v=")[1] : url.split("/")[4];
    const variables: LiveCommentIn = { videoId };
    const getLiveComment = await fetchLiveComments(variables);
    const liveComments = getLiveComment.liveComments;
    console.log("liveComments: ", liveComments);

    if (liveComments) {
      const message: ChromeMessage = {
        from: Sender.Background,
        message: Message.ACTIVATE_LIVECOMMENT,
        payload: { liveComments },
      };
      chrome.tabs.sendMessage(tabId, message);
    }
  }
};
