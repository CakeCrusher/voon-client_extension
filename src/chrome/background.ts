export {}

console.log('bg started');


chrome.runtime.onConnect.addListener(function(port) {
    console.log(port);
    
    console.assert(port.name === "knockknock");
    port.onMessage.addListener(function(msg) {
      if (msg.joke === "Knock knock")
        port.postMessage({question: "Who's there?"});
      else if (msg.answer === "Madame")
        port.postMessage({question: "Madame who?"});
      else if (msg.answer === "Madame... Bovary")
        console.log("I don't get it.");
        port.postMessage({question: "I don't get it."});
    });
  })
