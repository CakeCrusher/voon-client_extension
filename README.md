# Voon: Extension client

## What is Voon?([YouTube](https://www.youtube.com/watch?v=r_--woBCA8s))

https://user-images.githubusercontent.com/37946988/129762821-6c89d60c-bae0-46b2-a61a-fe107b1da129.mov

## Getting Started with Extension client

1. run `npm install && npm run dev-build`

2. Install the extension in Google Chrome (or any Chromium browser)

3. Navigate to the following URL in Chrome:
```text
<YOUR_BROWSER_NAME>://extensions/
```

4. Make sure `Developer Mode` is turned on, and click the `Load unpacked` button. Select the `build` folder of the project.

5. Once you have the [voon-video_processing]() repository set up, update `videoProcessingURL` in [helperFunctions.ts](https://github.com/CakeCrusher/voon-client_extension/blob/master/src/helperFunctions.ts) with your tunneled URL. To tunnel urls I suggest you use [Ngrok](https://ngrok.com/)

## Set up the other Voon repositories
<!-- - [voon-client_extension](https://github.com/CakeCrusher/voon-client_extension/edit/master/README.md) -->
- [video_processing](https://github.com/CakeCrusher/voon-video_processing)
- [backend](https://github.com/CakeCrusher/voon-backend)
- [iframe_service](https://github.com/CakeCrusher/voon-iframe_service)

