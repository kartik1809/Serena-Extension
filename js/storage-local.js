const storageLocal = {
  save: (o, s, t = () => {}) => {
    const a = { [o]: JSON.stringify(s) };
    chrome.storage.local.set(a, t);
  },
  load: (o, s, t = () => {}) => {
    const a = { [o]: JSON.stringify(s) };
    chrome.storage.local.get(a, (s) => {
      t(JSON.parse(s[o]));
    });
  },
};
