import React, { FunctionComponent, useState, useEffect } from "react";
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
  Text,
  Stack,
  Input,
  Progress,
  useMenuButton,
} from "@chakra-ui/react";
import AppContainer from "./AppContainer";
import '../App.css';

import {BsFileEarmarkCode} from "react-icons/bs"
import {AiOutlineComment} from "react-icons/ai"
import { wait } from "../helperFunctions";
import { ChromeMessage, FileSnippet, Message, Sender } from "../types";

type FileSnippetContentType = {
  fileSnippet: FileSnippet;
  setFileSnippet: Function; 
  children?: any;
}

const FileSnippetContent: FunctionComponent<FileSnippetContentType> = ({fileSnippet, setFileSnippet, children}) => {
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fps, setFPS] = useState(30);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const onMessageListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
      console.log('Recieved message: ', message);
      
      if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === Message.CREATE_FILESNIPPET
      ) {
        console.log('Finished creating fileSnippet');
        setGenerated(true)
        // stops all timeouts and intervals
        const killId = window.setTimeout(function() {
          for (var i = killId; i > 0; i--) clearInterval(i)
        }, 1);
        setLoadingProgress(0);
        setLoading(false);
      }
      if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.Content &&
        message.message === Message.HAS_FILESNIPPET
      ) {
        setGenerated(true)
      }
    }
    chrome.runtime.onMessage.addListener(onMessageListener)

    const queryInfo: chrome.tabs.QueryInfo = {active: true,currentWindow: true}
    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const message: ChromeMessage = {
        from: Sender.React,
        message: Message.HAS_FILESNIPPET
      }
      chrome.tabs.sendMessage(
        tabs[0].id!,
        message
      );
    })
  }, [])

  const createFileSnippet = async() => {
    console.log('Requesting creation of fileSnippet to background due to Button press');


    const expectedWait = fps * 2
    const startTime = Date.now();
    // create a set instance that runs every second for 10 seconds
    const interval = setInterval(() => {
      const timeNow = Date.now();
      const timeElapsed = Math.round((timeNow - startTime) / 1000)
      console.log(timeElapsed);
      setLoadingProgress(Math.round((timeElapsed / expectedWait) * 100));
    }, 500);


    setLoading(true);


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
      }; 

      chrome.runtime.sendMessage(
        message
      );
    })
  } 

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
      }; 

      chrome.runtime.sendMessage(
        message
      );
    })
  }

  // react chakra input with state

  const generatingInfo = loading ? <Text>Generating: <strong>{loadingProgress}%</strong></Text> : <Text>Generate File Snippet</Text>

  const FileSnippetActivated  = () => (
    <Flex direction="row" justify="start" align="center" className="appContent">
      <Text paddingRight="5px">File Snippet activated and running</Text>
    </Flex>
  )
  const CreateFileSnippet = () => (
    <>
      <Flex direction="row" justify="start" align="center" className="appContent">
        <Text paddingRight="5px">FPS: </Text>
        <Input value={fps} onChange={(e) => setFPS(parseInt(e.target.value))} className="appInput" placeholder="30" type="number" size="xs" w="30px" />
      </Flex>
      <Button onClick={createFileSnippet} type="submit" isLoading={loading} loadingText={loadingProgress+"%"} opacity="1" className="generateBtn" colorScheme="teal" borderTopLeftRadius="0" borderBottomLeftRadius="0">
        {generatingInfo}
      </Button>
    </>
  )

  const activateButton = generated ? <FileSnippetActivated /> : <CreateFileSnippet />

  return (
    <Flex h="40px" direction="row">
      {activateButton}
    </Flex>
  )
}

export default FileSnippetContent;