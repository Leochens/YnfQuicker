(()=>{"use strict";var e={n:t=>{var o=t&&t.__esModule?()=>t.default:()=>t;return e.d(o,{a:o}),o},d:(t,o)=>{for(var n in o)e.o(o,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:o[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=browser;var o=e.n(t);const n={async emitContent(e){const t=await o().tabs.query({active:!0,currentWindow:!0});t&&t.length>0&&await o().tabs.sendMessage(t[0].id,e)},emitBackground:e=>chrome.extension.getBackgroundPage().onMessage(e),async emit(e){await o().runtime.sendMessage(e)},on(e){o().runtime.onMessage.addListener(e)}},a={get:async e=>(await o().storage.local.get()||{})[e],async set(e){await o().storage.local.set(e)}};function s(e){const t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}function l(e){let t=e.offsetLeft,o=e.offsetTop,n=e.offsetParent;for(;n;)t+=n.offsetLeft,o+=n.offsetTop,n=n.offsetParent;return{left:t-e.scrollLeft,top:o-e.scrollTop}}const r="tabChange",c="setCurrentContentHost";console.log("content.js");var i=Math.random().toString(36).slice(2);let d=`${window.location.hostname}-value`;const f={showDataId:async function(){console.log("showDataId");const e=await a.get(d)||"data-id";console.log(e);for(let t of[...document.querySelectorAll(`[${e}]`)]){console.log(t.offsetTop,t.offsetLeft);let o=t.getAttribute(e),n=(l(t),document.createElement("div"));n.style.position="relative";let a=document.createElement("div");a.setAttribute("data-xid",i),a.innerHTML=e+": "+o,a.style.top=0,a.style.left=0,a.style.padding="0 10px",a.style.fontSize="14px",a.style.lineHeight="1.5",a.style.position="absolute",a.style.backgroundColor="#1e80ff",a.style.color="#fff",a.style.opacity="0.6",a.style.textWrap="nowrap",a.addEventListener("click",(function(t){t.preventDefault(),s(o),a.innerHTML=e+": "+o+" copyed!"})),n.appendChild(a),t.insertBefore(n,t.firstChild)}},hideDataId:function(){for(let e of[...document.querySelectorAll(`[data-xid='${i}']`)])e.remove()}};n.on((e=>{console.log("message",e);const{action:t,data:o}=e;t==r&&n.emit({action:c,data:{currentContentHost:window.location.hostname}}),f[t](o)})),n.emit({action:c,data:{currentContentHost:window.location.hostname}})})();