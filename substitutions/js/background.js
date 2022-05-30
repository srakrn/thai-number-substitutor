//Default replacements
var default_replacements = [
  ["1", "๑"],
  ["2", "๒"],
  ["3", "๓"],
  ["4", "๔"],
  ["5", "๕"],
  ["6", "๖"],
  ["7", "๗"],
  ["8", "๘"],
  ["9", "๙"],
  ["0", "๐"]
];

//Default Blacklist
var default_blacklisted_sites = [];

var debug = false;

function checkBlackList(url, blacklist) {
  url = url.toLowerCase() || "";
  blacklist = blacklist || [];
  for (var i = blacklist.length - 1; i >= 0; i--) {
    if (url.indexOf(blacklist[i]) > -1) {
      return false;
    }
  }
  return true;
}

function injectionScript(tabId, info, tab) {
  if (debug) {console.log("injection fire");}
  chrome.storage.sync.get(null, function (result) {
    if (result
        && result["status"] === "enabled"
        && checkBlackList(tab.url, result['blacklist'])) {
      chrome.tabs.executeScript(tabId, {
        file: "js/substitutions.js",
        runAt: "document_end"
      }, function (){
        if (debug){console.log('Script Executed');}
      });
    }
  });
}

function addMessage(request, sender, sendResponse) {
  if (debug) { console.log("message fire"); }
  chrome.storage.sync.get(null, function(result) {
    if (request === "config" && result["replacements"]) {
      sendResponse(result["replacements"]);
    }
  });
  return true;
}

function fixDataCorruption() {
  if (debug) { console.log("updateStore"); }
  chrome.storage.sync.get(null, function(result) {
    if (!result["status"]) {
      chrome.storage.sync.set({
        "status": "enabled"
      });
    }
    if (!result["replacements"]) {
      chrome.storage.sync.set({
        "replacements": default_replacements
      });
    }
    if (!result["blacklist"]) {
      chrome.storage.sync.set({
        "blacklist": default_blacklisted_sites
      });
    }
  });
}

function toggleActive() {
  if (debug) { console.log("clickfire"); }
  chrome.storage.sync.get("status", function(result) {
    if (result["status"] === null) {
      status = "enabled";
    } else {
      status = result["status"];
    }
    if (status === "enabled") {
      icon = {
        "path": "images/disabled.png"
      };
      message = {
        "title": "click to enable xkcd substitutions"
      };
      status = "disabled";
    } else if (status === "disabled") {
      icon = {
        "path": "images/enabled.png"
      };
      message = {
        "title": "click to disabled xkcd substitutions"
      };
      status = "enabled";
    }
    chrome.browserAction.setIcon(icon);
    chrome.browserAction.setTitle(message);
    chrome.storage.sync.set({
      "status": status
    });
  });
}

chrome.browserAction.onClicked.addListener(toggleActive);
chrome.runtime.onMessage.addListener(addMessage);
chrome.tabs.onUpdated.addListener(injectionScript);
chrome.runtime.onInstalled.addListener(fixDataCorruption);
chrome.runtime.onStartup.addListener(fixDataCorruption);
