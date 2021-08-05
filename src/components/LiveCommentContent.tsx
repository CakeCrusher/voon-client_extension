import React, { FunctionComponent, useState } from "react";
import { Checkbox, Flex } from "@chakra-ui/react";
import "../App.css";
import { LiveComment } from "../types";

type LiveCommentContentProps = {
  liveComment: LiveComment;
  setLiveComment: React.Dispatch<LiveComment>;
};

const LiveCommentContent: FunctionComponent<LiveCommentContentProps> = (
  props: LiveCommentContentProps
) => {
  const [showReplies, setShowReplies] = useState(false);

  const onLowVisibilityChange = () => {
    const newLiveComment = {
      ...props.liveComment,
      lowVisibility: !props.liveComment.lowVisibility,
    };
    chrome.storage.sync.set({ liveComment: newLiveComment });
    props.setLiveComment(newLiveComment);
  };

  return (
    <Flex h="40px" direction="row">
      <Flex
        direction="row"
        justify="start"
        align="center"
        className="appContent"
      >
        <Checkbox
          marginRight="30px"
          isChecked={props.liveComment.lowVisibility}
          onChange={() => onLowVisibilityChange()}
        >
          Low visibility
        </Checkbox>
        <Checkbox
          isChecked={showReplies}
          onChange={(e) => setShowReplies(e.target.checked)}
        >
          Show replies
        </Checkbox>
      </Flex>
    </Flex>
  );
};

export default LiveCommentContent;
