/**
 * background.js
 */
import {
  event,
  storage
} from "../utils/chrome-util.js";
import {
  eventConst
} from "../consts.js";
import axios from "axios";
import {
  getLoginTicketUrl,
  getYhtToken,
  switchTanent
} from "../tokenUtils/index.js";

console.log("background.js");

// 当前content域名
let currentContentHost = null;

// 全局状态
let statusData = {};

// 安装或更新
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    console.log("This is a first install!");
  } else if (details.reason == "update") {
    console.log(
      "Updated from " +
      details.previousVersion +
      " to " +
      chrome.runtime.getManifest().version +
      "!"
    );
  }
});

// 启动
chrome.runtime.onStartup.addListener(function () {
  console.log("Browser started, initialize plugin data.");
});

// 运行
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    console.log("Active tab updated, let's do something!");
  }
});

// 停止
chrome.runtime.onSuspend.addListener(function () {
  console.log("Browser is about to close, save plugin data.");
});

// 卸载
chrome.runtime.setUninstallURL("https://www.baidu.com/", function () {
  console.log("Uninstall URL has been set");
});

// 浏览器关闭事件
chrome.windows.onRemoved.addListener(function (windowId) {
  chrome.windows.getAll({}, function (windows) {
    if (windows.length == 0) {
      console.log("Browser is closing, the last window was closed.");
    }
  });
});

// 打开新窗口事件
chrome.windows.onCreated.addListener(function () {
  console.log("New window opened.");
});

// 关闭窗口事件
chrome.windows.onRemoved.addListener(function (windowId) {
  console.log("Window with id " + windowId + " was closed.");
});

// 切换标签页事件
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log(activeInfo);
  //   console.log("hostname", window.location.hostname);
  console.log("Tab with id " + activeInfo.tabId + " is now active.");

  // event.emit({ action: "tabChange" });
  event.emitContent({
    action: eventConst.tabChange
  });
});

// 点击插件图标事件
chrome.browserAction.onClicked.addListener(function (tab) {
  console.log("Plugin icon clicked in tab with id " + tab.id + ".");
});

event.on((message) => {
  console.log("background.js message", message);

  const {
    action,
    data
  } = message;

  if (action == "setCurrentContentHost") {
    currentContentHost = data.currentContentHost;
  }
});

/*** 通信函数*/
async function onMessage(message) {
  console.log(message);

  const {
    action,
    data
  } = message;

  if (action == "getCurrentContentHost") {
    return {
      currentContentHost
    };
  } else if (action == eventConst.setCurrentContentStatus) {
    statusData[data.key] = data.value;
  } else if (action == eventConst.getCurrentContentStatus) {
    return {
      key: data.key,
      value: statusData[data.key],
    };
  } else if (action === eventConst.getPassword) {
    console.log('获取token... ');
    storage.get('token').then(token => {
      console.log('token... ', token);

      if (!token) return;
      axios.post('https://c2.yonyoucloud.com/yonbip-ec-base/user/mobile/tmpCode/tenant/getUserTmpCode', {}, {
        headers: {
          'yht_access_token': token
        }
      }).then(r => {
        const res = r.data;
        if (res.code !== 200) {
          console.log(res);
          return;
        }
        const {
          userTmpCode
        } = res.data;
        console.log('userTmpCode', userTmpCode);
        axios.get(`https://tcsxwvpsuqbjrjxmtk.yybip.com/iam/v1/10000/login?code=${userTmpCode}`, {
          headers: {
            'Host': ' tcsxwvpsuqbjrjxmtk.yybip.com',
            'token': token
          }
        }).then(r => {
          // const passRes = r.data;
          console.log(r.data);
          event.emitContent({
            action: 'fillPassword',
            data: r.data?.authCodeInfo
          })
          event.emit({
            action: 'fillPassword',
            data: r.data?.authCodeInfo
          })
        })

      })
    })
  }else if (action === 'executeCode') {
    chrome.tabs.executeScript(
      null, // 当前活动标签页
      {
        code: data.code
      },
      function(res) {
        console.log('执行结果', res);
      }
    );
  }
}

const processToken = (details) => {
  const token = details.requestHeaders.find(item => item.name === 'token');
  // console.log('拦截请求', details);
  details.requestHeaders.push({
    name: 'Referer',
    value: 'tcsxwvpsuqbjrjxmtk.yybip.com'
  });
  details.requestHeaders.push({
    name: 'Origin',
    value: 'tcsxwvpsuqbjrjxmtk.yybip.com'
  });
  details.requestHeaders.push({
    name: 'User-Agent',
    value: `Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 APIIOS  QYZone_2-7.6.9-1-1 EsnReimbursement esn:// userFontSize=1 yht_access_token=${token}                 YouZoneLocalLanguage=zh_CN youZoneLanguage=zh`
  });
  return {
    requestHeaders: details.requestHeaders
  };
}
// chrome.webRequest.onCompleted.addListener((detail) => {
//   console.log('请求结束', detail)
// }, {
//   urls: ['<all_urls>']
// });
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.url.indexOf('/iuap-uuas-user/akas/listUserAk') !== -1 || details.url.indexOf('/iuap-uuas-user/fe') !== -1) {
      details.requestHeaders.push({
        name: 'Referer',
        value: details.url
      });
      details.requestHeaders.push({
        name: 'Origin',
        value: 'bip-test.yonyoucloud.com'
      });
      details.requestHeaders.push({
        name: 'User-Agent',
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      });
      console.log('请求拦截', details);
    }
    return {
      requestHeaders: details.requestHeaders
    }
  }, {
  urls: [
    // '<all_urls>'
    '*://*.yonyoucloud.com/*',
    '*://*.yyuap.com/*',
  ]
},
  ['blocking', 'requestHeaders', 'extraHeaders']
);
chrome.webRequest.onBeforeRequest.addListener(function (details) {
  if (details.method == 'POST' && details.url.indexOf('/cas/login') !== -1) {
    console.log("捕捉到登录请求", details.requestBody.formData);
    console.log("请求的initiator", details.initiator);
    const data = details.requestBody.formData;
    const domain = details.initiator;

    const username = data.username.pop();
    const tokeninfo = data.tokeninfo.pop();
    storage.get('switcher_accounts').then((accounts = {}) => {
      // 请求的域是否存在配置
      if (!accounts[domain]) {
        accounts[domain] = {};
      }
      accounts[domain][username] = {
        username,
        tokeninfo
      }
      storage.setByKey('switcher_accounts', accounts)
    })
    // storage.set()
  }
}, {
  urls: [
    // '<all_urls>'
    '*://*.yonyoucloud.com/*',
    '*://*.yyuap.com/*',
  ]
},
  ['blocking', 'requestBody', 'extraHeaders'])
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    // console.log('返回数据的header', details);
    // const setCookieHeader = details.responseHeaders.find(header => header.name.toLowerCase() === 'set-cookie');
    // if (setCookieHeader) {
    //   // 提取Set-Cookie中的Cookie值
    //   const cookies = setCookieHeader.value.split(';').map(cookie => {
    //     const [name, value] = cookie.trim().split('=');
    //     return {
    //       name,
    //       value
    //     };
    //   });

    //   // 处理获取到的Cookie值
    //   cookies.forEach(cookie => {
    //     console.log(`Cookie Name: ${cookie.name}, Value: ${cookie.value}`);
    //     // 在这里保存Cookie值到本地存储或执行其他操作
    //   });
    // }
    // return {};
  }, {
  urls: ["<all_urls>"]
},
  ["responseHeaders", "blocking"]
);
chrome.webRequest.onSendHeaders.addListener(function (details) {
  // if (details.url.startsWith('https://tcsxwvpsuqbjrjxmtk.yybip.com')) return processToken(details);
  // if(details.url.indexOf('cas/login') !== -1) {
  //   console.log('修改数据')
  //   details.requestHeaders.push({
  //     name: 'Referer',
  //     value: details.url
  //   });
  //   details.requestHeaders.push({
  //     name: 'Origin',
  //     value: 'bip-test.yonyoucloud.com'
  //   });
  //   details.requestHeaders.push({
  //     name: 'User-Agent',
  //     value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  //   });
  //   console.log('请求拦截', details);
  // }
  // if(details.url.indexOf('/iuap-uuas-user/akas/listUserAk') !== -1) {
  //   console.log('修改数据!!!!', details)
  //   details.requestHeaders.push({
  //     name: 'Referer',
  //     value: 'https://bip-test.yonyoucloud.com/iuap-uuas-user/fe/'
  //   });
  //   details.requestHeaders.push({
  //     name: 'Origin',
  //     value: 'bip-test.yonyoucloud.com'
  //   });
  //   details.requestHeaders.push({
  //     name: 'User-Agent',
  //     value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  //   });
  //   console.log('请求拦截', details);
  // }
  // console.log('发出的请求', details);


  return {
    requestHeaders: details.requestHeaders
  }
}, {
  urls: ['<all_urls>']
},)
window.onMessage = onMessage;