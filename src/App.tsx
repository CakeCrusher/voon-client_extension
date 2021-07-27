import {
  Button,
  Box,
  ChakraProvider,
  Code,
  DarkMode,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  OrderedList,
  Spinner,
  useClipboard,
  Input,
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react'
import './App.css';
import { ChromeMessage, Sender, MessageResponse, Message } from "./types";
import AppsWrapper from "./components/AppsWrapper";

function App() {
  const [url, setUrl] = useState<string>('')
  const [fps, setFPS] = useState<number>(0) // its actually "per amount of frames" not "frame per second"
  const [height, setHeight] = useState<number>(16)

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
  
  return (
    <ChakraProvider>
      <DarkMode>
        <Flex
          bgColor="gray.900"
          color="white"
          direction="column"
          rounded="sm"
          shadow="lg"
          w="400px"
          h="full"
        >
          <AppsWrapper />
        </Flex>
      </DarkMode>
    </ChakraProvider>
  )
}  

export default App
