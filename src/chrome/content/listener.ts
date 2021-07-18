import { ChromeMessage, Sender, MessageResponse } from "../../types";
// import { activateFileSnippet } from "./fileSnippet/fileSnippet";

export const messagesFromReactAppListener = async (message: ChromeMessage, sender: chrome.runtime.MessageSender, response: MessageResponse) => {
    console.log('message recieved');
    

    if (
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === "activate file snippet"
    ) {
        response('asd')
    }
}