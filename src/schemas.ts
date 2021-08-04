export const GET_VIDEO_FILESNIPPET = `
query MyQuery($videoId: String!) {
  video_by_pk(videoId: $videoId) {
    fileSnippets {
      fps
      height
      width
      githubURL
      frameData {
        frame
        fileInFrames {
          fileURL
          height
          width
          x
          y
        }
      }
    }
  }
}
`;
// it is created in video processing not as a schema from client
export const CREATE_FILESNIPPET = `
mutation MyMutation($fps: Int!, $url: String!) {
  makeFileSnippet(fps: $fps, url: $url) {
    videoId
  }
}
`;

export const SAVE_FILESNIPPET = `
mutation MyMutation($dimensions: Shape!, $fps: Int!, $githubURL: String!, $payload: [FrameData!]!, $videoId: String!) {
  makeFileSnippet(dimensions: $dimensions, fps: $fps, githubURL: $githubURL, videoId: $videoId, payload: $payload) {
    videoId
  }
}
`;

export const CREATE_LIVECOMMENT = `
mutation MyMutation($videoId: String!, $comment: String!, $user: String!, $time: Int!) {
  insert_liveComment(objects: {videoId: $videoId, time: $time, user: $user, comment: $comment}) {
    returning {
      id
    }
  }
}
`;

export const CREATE_REPLY = `
mutation MyMutation($user: String!, $liveComment: uuid!, $comment: String!) {
  insert_reply(objects: {comment: $comment, liveComment: $liveComment, user: $user}) {
    returning {
      id
    }
  }
}
`;

export const GET_VIDEO_LIVECOMMENT = `
query MyQuery($videoId: String!) {
  video_by_pk(videoId: $videoId) {
    liveComments {
      comment
      time
      user
      replies {
        comment
        user
      }
    }
  }
}
`;
