import React, { useState, useEffect } from 'react'
import './App.css';
import { ChromeMessage, Sender, MessageResponse } from "./types";

function App() {
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const queryInfo = {active: true, lastFocusedWindow: true}

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const url = tabs[0].url!
      setUrl(url)
    })
  }, [])

  const activateFileSnippet = () => {
    console.log('sending message');
    
    const message: ChromeMessage = {
      from: Sender.React,
      message: "activate file snippet",
    }

    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true
    }

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const currentTabId = tabs[0].id!;
      chrome.tabs.sendMessage(
        currentTabId,
        message,
        (response) => {
          console.log('Respnse: ', response);
        }
      )
    })
  }
  
  return (
    <div className="App">
      <h1>Ready</h1>
      <h1>{url}</h1>
      <button onClick={activateFileSnippet}>file snippet</button>
    </div>
  )
}  

export default App
