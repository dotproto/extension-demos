var logEl = typeof logEl != "undefined" ? logEl : document.getElementById("log");

function log(...parts) {
  parts = parts.map(val => {
    if (typeof val === "string") {
      return val;
    } else {
      return JSON.stringify(val);
    }
  });
  logEl.append(parts.join(" ") + "\n");
}