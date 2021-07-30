export const GET_VIDEO_FILESNIPPET: String = `
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
`
// it is created in video processing not as a schema from client
export const CREATE_FILESNIPPET: String = `
mutation MyMutation($fps: Int!, $url: String!) {
  makeFileSnippet(fps: $fps, url: $url) {
    videoId
  }
}
`

export const SAVE_FILESNIPPET: String = `
mutation MyMutation($dimensions: Shape!, $fps: Int!, $githubURL: String!, $payload: [FrameData!]!, $videoId: String!) {
  makeFileSnippet(dimensions: $dimensions, fps: $fps, githubURL: $githubURL, videoId: $videoId, payload: $payload) {
    videoId
  }
}
`

export const CREATE_LIVECOMMENT: String = `
mutation MyMutation($videoId: String!, $comment: String!, $user: String!, $time: Int!) {
  insert_liveComment(objects: {videoId: $videoId, time: $time, user: $user, comment: $comment}) {
    returning {
      id
    }
  }
}
`
// {
//   "videoId": "hQzlNlHcN0A",
//   "comment": "What happens at the start?",
//   "user": "questionNarc",
//   "time": 3
// }

export const CREATE_REPLY: String = `
mutation MyMutation($user: String!, $liveComment: uuid!, $comment: String!) {
  insert_reply(objects: {comment: $comment, liveComment: $liveComment, user: $user}) {
    returning {
      id
    }
  }
}
`

export const GET_VIDEO_LIVECOMMENT: String = `
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
`