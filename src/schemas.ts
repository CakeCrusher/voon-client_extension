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

export const CREATE_FILESNIPPET: String = `

`

export const CREATE_LIVECOMMENT: String = `
mutation MyMutation($videoId: String!, $user: String!, $frame: Int!, $comment: String!) {
  insert_liveComment(objects: {comment: $comment, frame: $frame, user: $user, videoId: $videoId}) {
    returning {
      id
    }
  }
}
`

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
      frame
      user
      replies {
        comment
        user
      }
    }
  }
}
`