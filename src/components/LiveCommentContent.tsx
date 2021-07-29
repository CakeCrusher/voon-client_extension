import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Button,
  Box,
  ChakraProvider,
  Code,
  Checkbox,
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
import { ChromeMessage, Message, Sender, LiveComment } from "../types";

type LiveCommentContentProps = {
  liveComment: LiveComment,
  setLiveComment: any,
  children?: any
};

const LiveCommentContent: FunctionComponent<LiveCommentContentProps> = ({liveComment, setLiveComment, children}) => {  
  const [showReplies, setShowReplies] = useState(false);
  // const [liveComment, setLiveComment] = useState<LiveComment>({
  //   state: false,
  //   lowVisibility: false
  // });

  const onLowVisibilityChange = () => {
    const newLiveComment = {
      ...liveComment,
      lowVisibility: !liveComment.lowVisibility
    }
    chrome.storage.sync.set({liveComment: newLiveComment});
    setLiveComment(newLiveComment);
  };
  

  return ( 
    <Flex h="40px" direction="row">
      <Flex direction="row" justify="start" align="center" className="appContent">
        <Checkbox marginRight="30px" isChecked={liveComment.lowVisibility} onChange={() => onLowVisibilityChange()}>Low visibility</Checkbox>
        <Checkbox isChecked={showReplies} onChange={(e) => setShowReplies(e.target.checked)}>Show replies</Checkbox>
      </Flex>
    </Flex>
  )
}

export default LiveCommentContent;