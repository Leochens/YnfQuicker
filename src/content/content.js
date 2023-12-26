/**
 * content.js
 */

import {
  event,
  storage
} from "../utils/chrome-util.js";
import {
  copyText
} from "../utils/copy-util.js";
import {
  getRelativePosition
} from "../utils/dom-util.js";
import {
  randomString
} from "../utils/uuid-util.js";
import {
  eventConst
} from "../consts.js";
import axios from "axios";

console.log("content.js");

var globalId = randomString();

let key = `${window.location.hostname}-value`;

async function showDataId() {
  console.log("showDataId");

  const value = (await storage.get(key)) || "data-id";

  console.log(value);

  for (let element of [...document.querySelectorAll(`[${value}]`)]) {
    console.log(element.offsetTop, element.offsetLeft);

    let attr = element.getAttribute(value);

    let position = getRelativePosition(element);
    let wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    let div = document.createElement("div");
    div.setAttribute("data-xid", globalId);
    div.innerHTML = value + ": " + attr;
    // div.style.top = position.top + "px";
    // div.style.left = position.left + "px";

    div.style.top = 0;
    div.style.left = 0;

    div.style.padding = "0 10px";
    div.style.fontSize = "14px";
    div.style.lineHeight = "1.5";
    div.style.position = "absolute";
    // div.style.zIndex = 99999;
    div.style.backgroundColor = "#1e80ff";
    div.style.color = "#fff";
    div.style.opacity = "0.6";
    div.style.textWrap = "nowrap";

    div.addEventListener("click", function (e) {
      e.preventDefault();

      copyText(attr);
      div.innerHTML = value + ": " + attr + " copyed!";
      // alert("已复制到剪切板");
    });

    wrapper.appendChild(div);
    element.insertBefore(wrapper, element.firstChild);
  }
}

function hideDataId() {
  for (let element of [
      ...document.querySelectorAll(`[data-xid='${globalId}']`),
    ]) {
    element.remove();
  }
}

const actions = {
  showDataId: showDataId,
  hideDataId: hideDataId,
};

// 入口
(() => {
  event.on((message) => {
    console.log("message22", message);

    const {
      action,
      data
    } = message;
    if (action == eventConst.tabChange) {
      event.emit({
        action: eventConst.setCurrentContentHost,
        data: {
          currentContentHost: window.location.hostname,
        },
      });
    } else if (action == eventConst.getDesignerPages) {
      console.log("开始获取")
      axios.post('/iuap-yonbuilder-designer/hpaapp/queryGroupPages', {
        appId: '1846952202132258822'
      }, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      }).then(r => {
        console.log("成功", r.data?.data?.appPages)

        event.emit({
          action: eventConst.setDesignerPages,
          data: {
            pages: (r.data?.data?.appPages || []).map(item => {
              return {
                ...item,
                host: location.host
              }
            }),
          },
        });
      }).catch(e => {
        console.log("获得页面失败", e)
      })
    } else if (action === eventConst.fillPassword) {
      // 获取动态口令并填充
      console.log('动态口令为', data?.authCode);

    }
    actions[action]?.(data);
  });

  // 将页面的host参数传递给popup
  event.emit({
    action: eventConst.setCurrentContentHost,
    data: {
      currentContentHost: window.location.hostname
    },
  });
})();