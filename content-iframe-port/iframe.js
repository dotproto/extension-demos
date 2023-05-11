log("\niframe loaded.");

let port = null;
main();

async function main() {
  log("Retrieving own tab ID from the background.");
  let tabId = await chrome.runtime.sendMessage({type: "get-iframe-tabid"});

  log(`Tab ID is ${tabId}. Opening a port.\n`);
  port = chrome.tabs.connect(tabId);
  port.onMessage.addListener(handlePortMessage);
}

function handlePortMessage(message) {
  log("\n\nport.onMessage:", message);

  switch (message.stage) {
    case 1:
      log("Sending message 2.");
      port.postMessage({
        stage: 2,
        line: "Who's there?"
      });
      break;
    case 3:
      log("Sending message 4.");
      port.postMessage({
        stage: 4,
        line: "'SYN flood' who?"
      });
      break;
    case 5:
      break;
  }
}
