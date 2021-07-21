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