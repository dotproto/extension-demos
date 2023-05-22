const CSP_SPLIT_PATTERN = /;\s*/g;

const AUTO_CSP_OVERRIDE = Symbol("Auto CSP Override");
const iframeCspOverrides = [
  {
    url: 'https://dotproto-block-embeds.glitch.me/',
    default: AUTO_CSP_OVERRIDE,
  },
];

async function buildRelaxationRules(siteCspOverrides) {
  let count = 0;
  const countInc = 1;

  const rules = [];
  // Create a new set of rules for each page
  for (const siteOverride of siteCspOverrides) {
    if (siteOverride.default !== AUTO_CSP_OVERRIDE) {
      throw new TypeError(`Unknown default CSP rule ("${siteOverride.default}") specified for "${siteOverride.url}". Only currently supported value is the symbol AUTO_CSP_OVERRIDE.`);
    }

    // Auto CSP: Retrieve the URL's current CSP and update the `frame-ancestors` directive
    // to allow the extension's origin.
    const url = new URL(siteOverride.url);
    const res = await fetch(siteOverride.url);
    const originalCsp = res.headers.get('content-security-policy');
    const csp = amendFrameAncestors(originalCsp);

    const rule = {
      id: count + countInc,
      condition: {
        initiatorDomains: [chrome.runtime.id],
        requestDomains: [url.host],
        resourceTypes: ['sub_frame'],
      },
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          {header: 'X-Frame-Options', operation: 'remove'},
          {header: 'Frame-Options', operation: 'remove'},
          {header: 'Content-Security-Policy', operation: 'set', value: csp},
        ],
      },
    };

    rules.push(rule);
  }
  return rules;
}

// Removes "frame-ancestors" from the supplied CSP.
function dropFrameAncestors(csp) {
  const parts = csp.split(CSP_SPLIT_PATTERN);
  const policies = parts.reduce((acc, policy) => {
      const index = policy.indexOf(" ");
      const name = policy.slice(0, index);
      // Don't include the "frame-ancestors" directive.
      if (name.toLowerCase() !== "frame-ancestors") {
        acc.push(policy);
      }
      return acc;
  }, []);
  return policies.join("; ");
}

// Adds the extension's origin to the "frame-ancestors" directive.
function amendFrameAncestors(csp) {
  const parts = csp.split(CSP_SPLIT_PATTERN);
  const policies = parts.reduce((acc, policy) => {
    const index = policy.indexOf(" ");
    const name = policy.slice(0, index);
    if (name.toLowerCase() === "frame-ancestors") {
      policy += " " + new URL(chrome.runtime.getURL("")).origin;
    }
    acc.push(policy);
    return acc;
  }, []);
  return policies.join("; ");
}

chrome.runtime.onInstalled.addListener(() => {
  updateRelaxationIframeRules();
});

async function updateRelaxationIframeRules() {
  // WARNING: We currently remove ALL dynamic rules. If you use dynamic rules for
  // other purposes, YOU MUST UPDATE THIS OR YOUR RULE WILL BE DELETED!
  const originalRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = originalRules.map(rule => rule.id);
  const rules = await buildRelaxationRules(iframeCspOverrides);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeRuleIds,
    addRules: rules,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggle-rules") {
    (async () => {
      await toggleRelaxationRules();
      sendResponse({type: "toggle-complete"});
    })();
    return true;
  }
});

async function toggleRelaxationRules() {
  const originalRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (originalRules.length) {
    const removeRuleIds = originalRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds});
  } else {
    const addRules = await buildRelaxationRules(iframeCspOverrides);
    await chrome.declarativeNetRequest.updateDynamicRules({addRules});
  }
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => {
  console.log("onRuleMatchedDebug", info);
});
