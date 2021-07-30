import { ChromeMessage, FileSnippet, LiveComment, LiveCommentIn, Message, Sender } from "../types";
import { fetchGraphQL, fetchLiveComments, wait } from "../helperFunctions";
import { GET_VIDEO_FILESNIPPET, GET_VIDEO_LIVECOMMENT } from "../schemas";

const initiateEnvironmentIfPossible = async (tabId: number, url: string) => {
  if (url?.includes('www.youtube.com')) {
    const message: ChromeMessage = {
      from: Sender.Background,
      message: Message.INITIATE_ENVIRONMENT,
      payload: {url}
    }
    chrome.tabs.sendMessage(
      tabId,
      message
    );
  } else {
    Error('Not a youtube video');
  }
}

const sendFileSnippetIfAvailable = async (tabId: number, url: string) => {
  if (url?.includes('www.youtube.com')) {
    const videoId = url.includes('v=') ? url.split('v=')[1] : url.split('/')[4];
    const variables = {videoId};
    const getFileSnippet = await fetchGraphQL(GET_VIDEO_FILESNIPPET, variables);
    const fileSnippet = getFileSnippet.data.video_by_pk ? getFileSnippet.data.video_by_pk.fileSnippets[0] : null;
    if (fileSnippet) {
      const message: ChromeMessage = {
        from: Sender.Background,
        message: Message.ACTIVATE_FILESNIPPET,
        payload: {fileSnippet}
      }
      chrome.tabs.sendMessage(
        tabId,
        message
      );
    }
    else {
      Error('No file snippet available');
    }
  } else {
    Error('Not a youtube video');
  }
}

const sendLiveCommentIfAvailable = async (tabId: number, url: string) => {
  console.log('attempting to send liveComment');
  

  if (url?.includes('www.youtube.com')) {
    const videoId = url.includes('v=') ? url.split('v=')[1] : url.split('/')[4];
    const variables: LiveCommentIn = {videoId};
    // const getLiveComment = await fetchGraphQL(GET_VIDEO_LIVECOMMENT, variables);
    // const liveComments = getLiveComment.data.video_by_pk ? getLiveComment.data.video_by_pk.liveComments : null;
    const getLiveComment = await fetchLiveComments(variables)
    const liveComments = getLiveComment.liveComments

    if (liveComments) {
      console.log('Sending live comments');
      
      const message: ChromeMessage = {
        from: Sender.Background,
        message: Message.ACTIVATE_LIVECOMMENT,
        payload: {liveComments}
      }
      chrome.tabs.sendMessage(
        tabId,
        message
      );
    }
    else {
      Error('No live comments available');
    }
  } else {
    Error('Not a youtube video');
  }
}

const onUpdatedListener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  console.log('change info: ', changeInfo);
  if (changeInfo.status === 'loading', changeInfo.url) {
    const message: ChromeMessage = {
      from: Sender.Background,
      message: Message.RESET_CONTENT
    }
    chrome.tabs.sendMessage(
      tabId,
      message
    ); 
  }
  if (tab.url && changeInfo.status === "complete") {
    console.log('Sending file snippet to tab as requested by Updated Tab');
    
    initiateEnvironmentIfPossible(tabId, tab.url);
    setTimeout(() => {
      sendFileSnippetIfAvailable(tabId, tab.url!);
      sendLiveCommentIfAvailable(tabId, tab.url!);
    }, 100);
  }
}
chrome.tabs.onUpdated.addListener(onUpdatedListener)



const onMessageListener =  (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
  if (
    sender.id === chrome.runtime.id &&
    message.from === (Sender.React || Sender.Content) &&
    message.message === Message.REQUEST_FILESNIPPET
  ) {
    console.log('Sending file snippet to tab as requested by React');
    
    sendFileSnippetIfAvailable(message.tab!.id!, message.tab!.url!);
  }
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
    message.message === Message.CREATE_FILESNIPPET
  ) {
    console.log('Creating file snippet as requested by React');
     
    createFileSnippet(message.tab!.url!, message.payload!.fps!, message.tab!.id!);
  }
}
chrome.runtime.onMessage.addListener(onMessageListener);

const createFileSnippet = async (url: string, fps: number, tabId: number) => {
  
  // await wait(1000)
  var requestOptions = {
      method: 'POST',
      headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNjIyMzE1MTA5LCJleHAiOjE2MjQ5MDcxMDl9.m450OrMGlChAVcU2z99FzzmVAOsF7zu6y7oa_r6xNk8'
      },
      body: JSON.stringify({
          "url": url,
          "per_frame": fps
      }),
  };
  const API = 'http://18.183.131.213:8080/process-video'
  const res = await fetch(API, requestOptions).then((res:any) => res.json())

  console.log(res);
  
  console.log('Sending notice of completion to tab');
  const message = {
    from: Sender.Background,
    message: Message.FINISHED_FILESNIPPET,
  }
  chrome.runtime.sendMessage(
    message
  );
  
  // // for simplicity
  // console.log('Response: ', res);
  // return res
}