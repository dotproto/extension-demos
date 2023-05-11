// DEMO: Automatically open the demo after install.
chrome.runtime.onInstalled.addListener(openDemo);
chrome.action.onClicked.addListener(openDemo);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("BG.onMessage():", message);

  if (message.type === "get-iframe-tabid") {
    sendResponse(sender.tab.id);
  }
});

// Open example.com to show how a content script and iframe can communicate.
function openDemo() {
  console.log("BG: Opening example.com");
  chrome.tabs.create({url: "https://example.com"});
}
