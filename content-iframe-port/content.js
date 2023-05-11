let port = null;
const container = document.createElement("div");
document.body.append(container);

// Log received messages to a pre tag on the page.
var logEl = document.createElement("pre");
logEl.innerText = "// content script log\n";
container.append(logEl);

// Append the extension iframe to the page.
log("Adding the extension's iframe to the page.")
const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("iframe.html");
container.append(iframe);

///////////////////////////////////
// Establish the message channel //
///////////////////////////////////

// Step 0 is adding the iframe to the page.
// data it needs to open a port from the background

// Step 2 When the iframe is ready, it will open a port to communicate with us.
chrome.runtime.onConnect.addListener((newPort) => {
  log("\n\n\nA port has connected.");

  port = newPort;
  port.onMessage.addListener(handlePortMessage);

  log("Initiating joke sequence.");
  log("Sending message 1.");
  port.postMessage({
    stage: 1,
    line: "Knock knock.",
  });
});

function handlePortMessage(message) {
  log("\n\nport.onMessage:", message);

  switch(message.stage) {
    case 2:
      log("Sending message 3.");
      port.postMessage({
        stage: 3,
        line: "SYN flood."
      });
      break;
    case 4:
      log("Sending message 5.");
      port.postMessage({
        step: 5,
        line: "Knock knock...",
      });
      break;
  }
}

////////////
// Styles //
////////////

container.style = `
  box-sizing: border-box;
  display: flex;
  width: 100%;
  padding: 0;
  background: none;
  box-shadow: none;
`;
logEl.style = `
  box-sizing: border-box;
  display: inline-block;
  min-height: 300px;
  width: 100%;
  border: 1px solid gray;
  padding: 0.5em;
  margin: 0;
  background: linear-gradient(transparent 0lh, transparent 1lh, rgba(0,0,0,.05) 1lh, rgba(0,0,0,.05) 2lh);
  background-size: 2lh 2lh;
  background-origin:content-box;
`;
iframe.style = `
  box-sizing: border-box;
  border: 1px solid gray;
  width: 100%;
`;