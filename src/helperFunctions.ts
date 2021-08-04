import {
  LiveCommentIn,
  makeFileSnippetIn,
  Message,
  Sender,
} from "./types";

export const fetchGraphQL = async (schema: string, variables: Object = {}) => {
  const graphql = JSON.stringify({
    query: schema,
    variables,
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": "secret",
    },
    body: graphql,
  };
  const database_url = "https://voon-demo.herokuapp.com/v1/graphql";
  const res = await fetch(database_url, requestOptions).then((res: any) =>
    res.json()
  );
  return res;
};

export const postNewFileSnippet = async (
  createFileSnippetVariables: makeFileSnippetIn
) => {
  console.log("createFileSnippetVariables", createFileSnippetVariables);

  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(createFileSnippetVariables),
  };
  const database_url = "https://516309ab6bac.ngrok.io/text-data";
  const res = await fetch(database_url, requestOptions).then((res: any) =>
    res.json()
  );
  return res;
};

export const fetchLiveComments = async (variables: LiveCommentIn) => {
  console.log("fetchingLiveComments");

  const requestOptions = {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  };
  const requestURL = `https://0bbf25c4dc96.ngrok.io/liveComments?videoId=${variables.videoId}`;
  const res = await fetch(requestURL, requestOptions).then((res: Response) =>
    res.json()
  );

  // await wait(500)
  // const res = liveCommentsResult

  return res;
};

export const createFileSnippet = async (
  url: string,
  fps: number,
  tabId: number
) => {
  console.log(`Creating file snippet on background`);

  // await wait(1000)
  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNjIyMzE1MTA5LCJleHAiOjE2MjQ5MDcxMDl9.m450OrMGlChAVcU2z99FzzmVAOsF7zu6y7oa_r6xNk8",
    },
    body: JSON.stringify({
      url: url,
      per_frame: fps,
    }),
  };
  const API = "http://18.183.131.213:8080/process-video";
  const res = await fetch(API, requestOptions).then((res: any) => res.json());

  console.log(res);

  console.log("Sending notice of completion to tab");
  const message = {
    from: Sender.Background,
    message: Message.FINISHED_FILESNIPPET,
  };
  chrome.runtime.sendMessage(message);
};

export const wait = (ms: number): Promise<boolean> =>
  new Promise((resolve) => setTimeout(resolve, ms, true));
