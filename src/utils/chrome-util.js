/**
 * https://github.com/mozilla/webextension-polyfill
 */

import browser from "webextension-polyfill";

/**
 * 事件
 */
export const event = {
  /**
   * 给content 发送消息
   * @param {*} message {action, data}
   */
  async emitContent(message) {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs && tabs.length > 0) {
      await browser.tabs.sendMessage(tabs[0].id, message);
    }
  },

  // 和 background.js 通信
  emitBackground(message) {
    const background = chrome.extension.getBackgroundPage();
    return background.onMessage(message);
  },

  getWindowData({key, code}) {
    event.emitBackground({
      action: 'executeCode',
      data: {
        code: `
        var script = document.createElement('script');
    script.textContent = \`
      var event = new CustomEvent('getWindowData', {detail: {
        data: ${code},
        key: '${key}',
        host: window.location.host
      }});
      window.dispatchEvent(event);
    \`;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
        `
      },
    });
  },

  async emit(message) {
    await browser.runtime.sendMessage(message);
  },

  // callback(message, sender, sendResponse)
  on(callback) {
    // 接收消息
    browser.runtime.onMessage.addListener(callback);
  },
};

/**
 * 存储
 */
export const storage = {
  async get(key) {
    const data = (await browser.storage.local.get()) || {};
    if (!key) return data;
    return data[key];
  },

  async set(data) {
    await browser.storage.local.set(data);
  },
  async clear() {
    await browser.storage.local.clear();
  },
  async setByKey(key, data) {
    const originData = storage.get();
    await browser.storage.local.set({ ...originData, [key]: data });
  },
};

/**
 * 获取当前 tab ID
 */
export function getCurrentTabId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs.length ? tabs[0].id : null);
    });
  });
}


const proxy = new Map();
const defineProxy = new Map();
export function DependencyEnsure(scope, key) {
  if (scope[key]) {
    return Promise.resolve(scope[key]);
  }

  let cachedScope = proxy.get(scope);
  let cachedProxy = defineProxy.get(scope);
  if (!cachedScope) {
    cachedScope = {};
    cachedProxy = {};
    proxy.set(scope, cachedScope);
    defineProxy.set(scope, cachedProxy);
  }
  if (cachedScope[key]) {
    return cachedScope[key];
  }

  let $resolve;
  // 防止重复defineProperty
  if (cachedProxy[key]) return cachedProxy[key];
  const promise = new Promise(resolve => $resolve = resolve);
  Object.defineProperty(scope, key, {
    get() {
      return cachedScope[key];
    },
    set(value) {
      cachedScope[key] = value;
      $resolve(value);
    }
  });
  cachedProxy[key] = promise;
  return promise;
}