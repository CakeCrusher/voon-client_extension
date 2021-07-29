import { liveCommentsResult } from "./results";
import { LiveCommentIn } from "./types";

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

export const fetchLiveComments = async (variables: LiveCommentIn) => {
    console.log('fetchingLiveComments');
    
    // var requestOptions = {
    //     method: 'GET',
    //     headers: {
    //         'content-type': 'application/json',
    //     }
    // };

    // const requestURL = `https://74d174224478.ngrok.io/liveComments?videoId=${variables.videoId}`
    // const res = await fetch(requestURL, requestOptions).then((res: Response) => res.json())
    
    await wait(500)
    const res = liveCommentsResult
    
    return res
}

export const wait = (ms: number): Promise<boolean> => new Promise(resolve => setTimeout(resolve, ms, true))