import { ChromeMessage, Message, Sender } from "../types";
import { fetchGraphQL, wait } from "../helperFunctions";
import { GET_VIDEO_FILESNIPPET } from "../schemas";

const sendFileSnippetIfAvailable = async (tabId: number, url: string) => {
  url = 'https://www.youtube.com/watch?v=hQzlNlHcN0A'
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
  } else {
    Error('Not a youtube video');
  }
}

const onUpdatedListener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (tab.url && changeInfo.status === "complete") {
    console.log('Sending file snippet to tab as requested by Updated Tab');
    
    sendFileSnippetIfAvailable(tabId, tab.url);
  }
}
chrome.tabs.onUpdated.addListener(onUpdatedListener)

const onMessageListener =  (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
  if (
    sender.id === chrome.runtime.id &&
    message.from === Sender.React &&
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
  
  await wait()
  // var requestOptions = {
  //     method: 'POST',
  //     headers: {
  //         'content-type': 'application/json',
  //         'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNjIyMzE1MTA5LCJleHAiOjE2MjQ5MDcxMDl9.m450OrMGlChAVcU2z99FzzmVAOsF7zu6y7oa_r6xNk8'
  //     },
  //     body: JSON.stringify({
  //         "url": url,
  //         "per_frame": fps
  //     }),
  // };
  // const API = 'http://18.183.131.213:8080/process-video'
  // const res = await fetch(API, requestOptions).then((res:any) => res.json())

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