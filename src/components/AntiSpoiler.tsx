import React, { FunctionComponent, useState } from "react";
import { Checkbox, Flex } from "@chakra-ui/react";
import "../App.css";
import { AntiSpoiler } from "../types";

type AntiSpoilerContentProps = {
  antiSpoiler: AntiSpoiler;
  setAntiSpoiler: React.Dispatch<AntiSpoiler>;
};

const AntiSpoilerContent: FunctionComponent<AntiSpoilerContentProps> = (
  props: AntiSpoilerContentProps
) => {
  const [showReplies, setShowReplies] = useState(false);

  const onShowTimeChange = () => {
    const newAntiSpoiler = {
      ...props.antiSpoiler,
      showTime: !props.antiSpoiler.showTime,
    };
    chrome.storage.sync.set({ antiSpoiler: newAntiSpoiler });
    props.setAntiSpoiler(newAntiSpoiler);
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
          isChecked={props.antiSpoiler.showTime}
          onChange={() => onShowTimeChange()}
        >
          Time indicators
        </Checkbox>
      </Flex>
    </Flex>
  );
};

export default AntiSpoilerContent;
