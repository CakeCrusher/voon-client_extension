import { liveCommentsResult } from "./results";
import { DataInFrame, DataInFrameOut, FileSnippetOut, LiveCommentIn, makeFileSnippetIn } from "./types";

export const fetchGraphQL = async (schema: String, variables: Object = {}) => {
    var graphql = JSON.stringify({
        query: schema,
        variables
    })
    var requestOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'secret'
        },
        body: graphql,
    };
    const database_url = 'https://voon-demo.herokuapp.com/v1/graphql'
    const res = await fetch(database_url, requestOptions).then((res:any) => res.json())
    return res
}

export const postNewFileSnippet = async (createFileSnippetVariables: makeFileSnippetIn) => {
    console.log('createFileSnippetVariables', createFileSnippetVariables);
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(createFileSnippetVariables),
    };
    const database_url = 'https://516309ab6bac.ngrok.io/text-data'
    const res = await fetch(database_url, requestOptions).then((res:any) => res.json())
    return res
}

export const fetchLiveComments = async (variables: LiveCommentIn) => {
    console.log('fetchingLiveComments');
    
    var requestOptions = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    };

    const requestURL = `https://0bbf25c4dc96.ngrok.io/liveComments?videoId=${variables.videoId}`
    const res = await fetch(requestURL, requestOptions).then((res: Response) => res.json())
    
    // await wait(500)
    // const res = liveCommentsResult
    
    return res
}

export const wait = (ms: number): Promise<boolean> => new Promise(resolve => setTimeout(resolve, ms, true))

export const relativeFiF = (screenWidth: string, screenHeight: string, fileSnippet: FileSnippetOut, fileInFrame: DataInFrameOut): DataInFrameOut | undefined => {
    if (screenHeight && screenWidth && fileSnippet) {
      const xRatio = parseInt(screenWidth) / fileSnippet.width
      const yRatio = parseInt(screenHeight) / fileSnippet.height
      const newFileInFrame = {...fileInFrame}
      newFileInFrame['x'] = Math.round(fileInFrame.x*xRatio)
      newFileInFrame['width'] = Math.round(fileInFrame.width*xRatio)
      newFileInFrame['y'] = Math.round(fileInFrame.y*yRatio)
      newFileInFrame['height'] = Math.floor(fileInFrame.height*yRatio)
      return newFileInFrame
    }
    return undefined
  }