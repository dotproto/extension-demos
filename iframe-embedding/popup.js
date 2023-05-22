const toggleButton = document.getElementById("toggle");
toggleButton.addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({type: "toggle-rules"});
  if (response.type === "toggle-complete") {
    window.location += "";
  }
});
