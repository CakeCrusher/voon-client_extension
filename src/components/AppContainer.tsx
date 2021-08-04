import React, { FunctionComponent, useState } from "react";
import {
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";
import '../App.css';


type AppProps = {
  color: string;
  title: string;
  description: string;
  icon: any;
  children: any;
  activated: boolean;
  setActivated: Function;
}
const AppContainer: FunctionComponent<AppProps> = (props) => {
  const [hovered, setHovered] = useState(false);
  // const [activated, setActivated] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  
  const descriptionStyle = hovered ? {maxHeight: "100px"} : {maxHeight: "0"}

  const colorSliverStyle = iconHovered ? {width: "73px"} : {width: "3px"}
  const appContentStyle = iconHovered ? {paddingLeft: "0px"} : {paddingLeft: "70px"}

  const activatedAppContainer = (
    <Flex
      direction="row"
      className="appContainer"
      w="full"
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      bg={props.color}
    >
      <Flex className="colorSliver" style={colorSliverStyle} bg="rgba(0,0,0,0.5)">
          <Flex
            onClick={() => props.setActivated(!props.activated)}
            onMouseOver={() => setIconHovered(true)}
            onMouseOut={() => setIconHovered(false)}
            just="center"
            align="center"
            margin="25px 0px"
            className="appIconContainer"
          >
            <Icon as={props.icon} className="appIcon" h="10" w="16" color="white" />
          </Flex>
      </Flex>
      <Flex
        w="full"
        style={appContentStyle}
        className="appContentContainer"
      >
        <Flex 
          w="full"
          direction="column"
          margin="10px 10px"
        >
          {props.children}
        </Flex>
      </Flex>
    </Flex>
  )

  const deactivatedAppContainer = (
    <Flex
      direction="row"
      className="appContainer"
      w="full"
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
    <Flex className="colorSliver" style={colorSliverStyle} bg={props.color}>
        <Flex
          onClick={() => props.setActivated(!props.activated)}
          onMouseOver={() => setIconHovered(true)}
          onMouseOut={() => setIconHovered(false)}
          just="center"
          align="center"
          margin="25px 0px"
          className="appIconContainer"
        >
          <Icon as={props.icon} className="appIcon" h="10" w="16" color="white" />
        </Flex>
    </Flex>
    <Flex
      w="full"
      className="appContentContainer"
      style={appContentStyle}
      direction="column"
    >
      <Flex
        direction="column"
        margin="0px 10px"
      >
        <Text fontSize="2xl" fontWeight="bold">
          {props.title}
        </Text>
        <Text style={descriptionStyle} className="appDescription"  overflow="hidden" fontSize="lg">
          {props.description}
        </Text>
      </Flex>
    </Flex>
    </Flex>
  )

  return props.activated ? activatedAppContainer : deactivatedAppContainer
}

export default AppContainer;