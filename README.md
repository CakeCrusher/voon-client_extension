# Voon: Extension client

## What is Voon?([YouTube](https://www.youtube.com/watch?v=r_--woBCA8s))

https://user-images.githubusercontent.com/37946988/129762821-6c89d60c-bae0-46b2-a61a-fe107b1da129.mov

## Objective
Providing a framework to facilitate the incorporation of features into youtube. So far the potential for features ranges from image recognition on the video to live timestamped comment feed.

## Inspiration
Voon was inspired by the lack of features provided by video streaming sites (where youtube easily claims the majority of the market). The solution, I concluded, was that instead of competing against the goliath of youtube I would build a wrapper framework built on top of youtube (if you cant beat them join them).


## Contributing
Search for the keyword `CONTRIBUTE:` for guidance on where to make changes to contribute your voon app.

## Getting Started with Extension client

1. run `npm install && npm run dev-build`

2. Install the extension in Google Chrome (or any Chromium browser)

3. Navigate to the following URL in Chrome:
```text
<YOUR_BROWSER_NAME>://extensions/
```

4. Make sure `Developer Mode` is turned on, and click the `Load unpacked` button. Select the `build` folder of the project.

5. Once you have the [voon-video_processing]() repository set up, update `videoProcessingURL` in [helperFunctions.ts](https://github.com/CakeCrusher/voon-client_extension/blob/master/src/helperFunctions.ts) with your tunneled URL. To tunnel urls I suggest you use [Ngrok](https://ngrok.com/)

## Full project
Voon is comprised of multiple code repositories: client, backend, video-processing server, iframe provider website, and the database.

### Tech stack
- Client: typescript, react, chrome dev tools
- Backend: node, google API,
- Video-processing server: Flask, tesseractORC, OpenCV, scikit, Docker
- Iframe provider website: Node
- Databse: PostgresSQL, Hasura, GraphQL

## Set up the other Voon repositories
<!-- - [voon-client_extension](https://github.com/CakeCrusher/voon-client_extension/edit/master/README.md) -->
- [video_processing](https://github.com/CakeCrusher/voon-video_processing)
- [backend](https://github.com/CakeCrusher/voon-backend)
- [iframe_service](https://github.com/CakeCrusher/voon-iframe_service)

