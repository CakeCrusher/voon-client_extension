import React, { FunctionComponent, useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import AppContainer from "./AppContainer";
import "../App.css";

import { BsFileEarmarkCode } from "react-icons/bs";
import { AiOutlineComment, AiOutlineEyeInvisible } from "react-icons/ai";
import FileSnippetContent from "./FileSnippetContent";
import LiveCommentContent from "./LiveCommentContent";
import AntiSpoilerContent from "./AntiSpoiler";
import { AntiSpoiler, FileSnippet, LiveComment } from "../types";

const AppsWrapper: FunctionComponent = () => {
  const [fileSnippet, setFileSnippet] = useState<FileSnippet>({
    state: false,
  });
  const [liveComment, setLiveComment] = useState<LiveComment>({
    state: false,
    lowVisibility: false,
  });
  const [antiSpoiler, setAntiSpoiler] = useState<AntiSpoiler>({
    state: false,
    showTime: false,
    showThumbnail: false,
    showTitle: false,
  });

  useEffect(() => {
    chrome.storage.sync.get(["fileSnippet", "liveComment", "antiSpoiler"], (res) => {
      setFileSnippet(res.fileSnippet);
      setLiveComment(res.liveComment);
      setAntiSpoiler(res.antiSpoiler);
    });
  }, []);

  const setFileSnippetActivated = (state: boolean) => {
    const newFileSnippet = { ...fileSnippet, state };
    console.log("fileSnippet changed");
    chrome.storage.sync.set({ fileSnippet: newFileSnippet });
    setFileSnippet(newFileSnippet);
  };
  const setLiveCommentActivated = (state: boolean) => {
    const newLiveComment = { ...liveComment, state };
    console.log("liveComment changed");
    chrome.storage.sync.set({ liveComment: newLiveComment });
    setLiveComment(newLiveComment);
  };
  const setAntiSpoilerActivated = (state: boolean) => {
    const newAntiSpoiler = { ...antiSpoiler, state };
    console.log("antiSpoiler changed");
    chrome.storage.sync.set({ antiSpoiler: newAntiSpoiler });
    setAntiSpoiler(newAntiSpoiler);
  };

  return (
    <Flex direction="column" w="full" margin="2px 0px">
      <AppContainer
        color="#e76f51"
        title="File Snippet"
        description="Scans video for files documented on github, then provides you with the corresponding code snippet."
        icon={BsFileEarmarkCode}
        activated={fileSnippet && fileSnippet.state}
        setActivated={setFileSnippetActivated}
      >
        <FileSnippetContent />
      </AppContainer>
      <AppContainer
        color="#2a9d8f"
        title="Live Comment"
        description="Shows timestamped comments live on the video."
        icon={AiOutlineComment}
        activated={liveComment && liveComment.state}
        setActivated={setLiveCommentActivated}
      >
        <LiveCommentContent
          liveComment={liveComment}
          setLiveComment={setLiveComment}
        />
      </AppContainer>
      <AppContainer
        color="#7a7a7a"
        title="Anti Spoiler"
        description="Eliminates time indications."
        icon={AiOutlineEyeInvisible}
        activated={antiSpoiler && antiSpoiler.state}
        setActivated={setAntiSpoilerActivated}
      >
        <AntiSpoilerContent
          antiSpoiler={antiSpoiler}
          setAntiSpoiler={setAntiSpoiler}
        />
      </AppContainer>
    </Flex>
  );
};

export default AppsWrapper;
