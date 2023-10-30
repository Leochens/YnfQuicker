(()=>{"use strict";var e={n:n=>{var o=n&&n.__esModule?()=>n.default:()=>n;return e.d(o,{a:o}),o},d:(n,o)=>{for(var t in o)e.o(o,t)&&!e.o(n,t)&&Object.defineProperty(n,t,{enumerable:!0,get:o[t]})},o:(e,n)=>Object.prototype.hasOwnProperty.call(e,n)};const n=browser;var o=e.n(n);const t={async emitContent(e){const n=await o().tabs.query({active:!0,currentWindow:!0});n&&n.length>0&&await o().tabs.sendMessage(n[0].id,e)},emitBackground:e=>chrome.extension.getBackgroundPage().onMessage(e),async emit(e){await o().runtime.sendMessage(e)},on(e){o().runtime.onMessage.addListener(e)}};const s="tabChange",i="setCurrentContentStatus",a="getCurrentContentStatus";console.log("background.js");let r=null,c={};chrome.runtime.onInstalled.addListener((function(e){"install"==e.reason?console.log("This is a first install!"):"update"==e.reason&&console.log("Updated from "+e.previousVersion+" to "+chrome.runtime.getManifest().version+"!")})),chrome.runtime.onStartup.addListener((function(){console.log("Browser started, initialize plugin data.")})),chrome.tabs.onUpdated.addListener((function(e,n,o){"complete"==n.status&&o.active&&console.log("Active tab updated, let's do something!")})),chrome.runtime.onSuspend.addListener((function(){console.log("Browser is about to close, save plugin data.")})),chrome.runtime.setUninstallURL("https://www.baidu.com/",(function(){console.log("Uninstall URL has been set")})),chrome.windows.onRemoved.addListener((function(e){chrome.windows.getAll({},(function(e){0==e.length&&console.log("Browser is closing, the last window was closed.")}))})),chrome.windows.onCreated.addListener((function(){console.log("New window opened.")})),chrome.windows.onRemoved.addListener((function(e){console.log("Window with id "+e+" was closed.")})),chrome.tabs.onActivated.addListener((function(e){console.log(e),console.log("Tab with id "+e.tabId+" is now active."),t.emitContent({action:s})})),chrome.browserAction.onClicked.addListener((function(e){console.log("Plugin icon clicked in tab with id "+e.id+".")})),t.on((e=>{console.log("background.js message",e);const{action:n,data:o}=e;"setCurrentContentHost"==n&&(r=o.currentContentHost)})),window.onMessage=async function(e){console.log(e);const{action:n,data:o}=e;if("getCurrentContentHost"==n)return{currentContentHost:r};if(n==i)c[o.key]=o.value;else if(n==a)return{key:o.key,value:c[o.key]}}})();