import React, { FunctionComponent, useState, useEffect } from "react";
import { Button, Flex, Text, Input } from "@chakra-ui/react";
import "../App.css";

import { fetchGraphQL, postNewFileSnippet } from "../helperFunctions";
import { SAVE_FILESNIPPET } from "../schemas";
import { ChromeMessage, makeFileSnippetIn, Message, Sender } from "../types";

const FileSnippetContent: FunctionComponent = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fps, setFPS] = useState(1);
  const [generated, setGenerated] = useState(false);

  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const onMessageListener = async (
      message: ChromeMessage,
      sender: chrome.runtime.MessageSender
    ) => {
      console.log("Recieved message: ", message);
      if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.Content &&
        message.message === Message.HAS_FILESNIPPET
      ) {
        setGenerated(true);
      }
      if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.Content &&
        message.message === Message.VIDEODETAILS
      ) {
        setVideoDuration(message.payload.duration);
      }
    };
    chrome.runtime.onMessage.addListener(onMessageListener);

    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs.length && tabs[0].url && tabs[0].id) {
          setUrl(tabs[0].url);
          const messageToCheckFileSnippet: ChromeMessage = {
            from: Sender.React,
            message: Message.HAS_FILESNIPPET,
          };
          chrome.tabs.sendMessage(tabs[0].id, messageToCheckFileSnippet);
          console.log("Sent request to check if there is fileSnippet");

          const messageToRequestVideodetails: ChromeMessage = {
            from: Sender.React,
            message: Message.VIDEODETAILS,
          };
          chrome.tabs.sendMessage(tabs[0].id, messageToRequestVideodetails);
        }
      });
  }, []);

  const createFileSnippet = async () => {
    console.log(
      "Requesting creation of fileSnippet to background due to Button press"
    );
    setLoading(true);

    const expectedWait = fps * 9 * videoDuration;
    const startTime = Date.now();
    // create a set instance that runs every second for 10 seconds
    const interval = setInterval(() => {
      const timeNow = Date.now();
      const timeElapsed = Math.round((timeNow - startTime) / 1000);
      let tempLoadingProgress = Math.round((timeElapsed / expectedWait) * 100);
      if (tempLoadingProgress > 99) {
        tempLoadingProgress = 99;
      }
      setLoadingProgress(tempLoadingProgress);
    }, 500);
    const createFileSnippetVariables: makeFileSnippetIn = {
      url,
      per_frame: fps,
    };
    const madeFileSnippet = await postNewFileSnippet(
      createFileSnippetVariables
    );
    console.log("madeFileSnippet", madeFileSnippet);
    await fetchGraphQL(SAVE_FILESNIPPET, madeFileSnippet);

    setLoadingProgress(100);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
      clearInterval(interval);
      setLoadingProgress(0);
    }, 500);

    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
    };
    console.log("Requesting activation of fileSnippet to background");
    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs[0].id && tabs[0].url) {
          const message: ChromeMessage = {
            from: Sender.React,
            message: Message.REQUEST_FILESNIPPET,
            tab: {
              id: tabs[0].id,
              url: tabs[0].url,
            },
          };
          chrome.runtime.sendMessage(message);
        }
      });
  };

  const generatingInfo = loading ? (
    <Text>
      Generating: <strong>{loadingProgress}%</strong>
    </Text>
  ) : (
    <Text>Generate File Snippet</Text>
  );

  const FileSnippetActivated = () => (
    <Flex direction="row" justify="start" align="center" className="appContent">
      <Text paddingRight="5px">File Snippet activated and running</Text>
    </Flex>
  );
  const CreateFileSnippet = () => (
    <>
      <Flex
        direction="row"
        justify="start"
        align="center"
        className="appContent"
        borderTopRightRadius="0px"
        borderBottomRightRadius="0px"
      >
        <Text paddingRight="5px">FPS: </Text>
        <Input
          value={fps}
          onChange={(e) => setFPS(parseInt(e.target.value))}
          className="appInput"
          placeholder="30"
          type="number"
          size="xs"
          w="30px"
        />
      </Flex>
      <Button
        onClick={createFileSnippet}
        type="submit"
        isLoading={loading}
        loadingText={loadingProgress + "%"}
        opacity="1"
        className="generateBtn"
        colorScheme="teal"
        borderTopLeftRadius="0"
        borderBottomLeftRadius="0"
      >
        {generatingInfo}
      </Button>
    </>
  );

  const activateButton = generated ? (
    <FileSnippetActivated />
  ) : (
    <CreateFileSnippet />
  );

  return (
    <Flex h="40px" direction="row">
      {activateButton}
    </Flex>
  );
};

export default FileSnippetContent;
