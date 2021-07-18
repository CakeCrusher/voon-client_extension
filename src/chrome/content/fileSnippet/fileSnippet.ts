// import { fetchGraphQL } from "../../../helperFunctions"
// import { GET_VIDEO_FILESNIPPET } from "../../../schemas"
// import { ChromeMessage, Sender, MessageResponse, DataInFrameOut, FrameDataOut, VoonOut } from "../../../types";

// export const getFileSnippet = async () => {
//   const videoURL = 'https://www.youtube.com/watch?v=hQzlNlHcN0A'
//   const videoId = videoURL.includes('v=') ? videoURL.split('v=')[1].split('&')[0] : videoURL.split('/')[3]
//   const getVideoFileSnippet = await fetchGraphQL(GET_VIDEO_FILESNIPPET, {videoId})
//   const fileSippet: VoonOut = getVideoFileSnippet.data.video_by_pk.fileSnippets[0]
//   return fileSippet
// }

// export const currentFrameData = (htmlVideoPlayer: any, fileSnippet: VoonOut): FrameDataOut | undefined => {
//   const currentTime = htmlVideoPlayer.currentTime
//   const duration = htmlVideoPlayer.duration
//   const disparityTolerance = 1/duration

//   const voonFrameDuration = 1/fileSnippet.fps
  
//   const currentFrameData = fileSnippet.frameData.find((fd: FrameDataOut) => {
//       if (Math.abs(currentTime-(voonFrameDuration*fd.frame)) <= 0.5) {
//           return true
//       } else {
//           return false
//       }
//   })

//   return currentFrameData
// }