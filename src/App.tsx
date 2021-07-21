import React, { useState, useEffect } from 'react'
import './App.css';
import { ChromeMessage, Sender, MessageResponse, Message } from "./types";

function App() {
  const [url, setUrl] = useState<string>('')
  const [fps, setFPS] = useState<number>(0) // its actually "per amount of frames" not "frame per second"

  useEffect(() => {
    const queryInfo = {active: true, lastFocusedWindow: true}

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const url = tabs[0].url!
      setUrl(url)
    })

    const onMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
      console.log('Recieved message: ', message);
      
      if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === Message.CREATE_FILESNIPPET
      ) {
        console.log('Finished creating fileSnippet');
      }
    }
    chrome.runtime.onMessage.addListener(onMessageListener)
  }, [])

  const activateFileSnippet = () => {
    console.log('Requesting fileSnippet to background due to Button press');

    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true
    }

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const message: ChromeMessage = {
        from: Sender.React,
        message: Message.REQUEST_FILESNIPPET,
        tab: {
          id: tabs[0].id!,
          url: tabs[0].url!
        }
        // message: Message.CREATE_FILESNIPPET,
      }; 

      chrome.runtime.sendMessage(
        message
      );
    })
  }

  const createFileSnippet = () => {
    console.log('Requesting creation of fileSnippet to background due to Button press');

    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true
    }

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const message: ChromeMessage = {
        from: Sender.React,
        message: Message.CREATE_FILESNIPPET,
        tab: {
          id: tabs[0].id!,
          url: tabs[0].url!
        },
        payload: {fps}
        // message: Message.CREATE_FILESNIPPET,
      }; 

      chrome.runtime.sendMessage(
        message
      );
    })
  }
  // convert string to number
  

  
  return (
    <div className="App">
      <h1>Ready</h1>
      <h1>{url}</h1>
      
      <button onClick={activateFileSnippet}>activate file snippet</button>
      <input type="number" value={fps} onChange={e => setFPS(parseInt(e.target.value))}/>
      <button onClick={createFileSnippet}>create file snippet</button>
    </div>
  )
}  

export default App
