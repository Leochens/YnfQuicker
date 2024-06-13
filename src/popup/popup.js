/**
 * popup.js
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button, message } from "antd";
import "./popup.css";
import { event, tabs, storage } from "../utils/chrome-util.js";
import { eventConst } from "../consts.js";
import { OptionPage } from "../options/options.js";
import { TenantSwitcher } from "../components/TenantSwicher/index.jsx";

function App() {
  const [checked, setChecked] = React.useState(false);
  const [pass, setPass] = React.useState('');
  const [currentHost, setCurrentHost] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState("");
  const [designerPages, setDesignerPages] = React.useState([]);

  const onChange = (value) => {
    setChecked(value);

    if (value) {
      event.emitContent({ action: "showDataId" });
    } else {
      event.emitContent({ action: "hideDataId" });
    }

    let key = `${currentHost}-status`;
    event.emitBackground({
      action: eventConst.setCurrentContentStatus,

      data: {
        key,
        value,
      },
    });
  };

  const onClick = async () => {
    chrome.runtime.openOptionsPage();
  };
  const handleRenderDesignerPages = () => {
    return designerPages.map(page => {
      return <div>
        <h3>{page.groupName}:</h3>
        <div>
          <Button onClick={() => { window.open('https://' + page.host + page.voucherPages[0].url) }} size="small">PC端页面</Button>
          <Button onClick={() => { window.open('https://' + page.host + page.voucherPages[1].url) }} size="small">移动端页面</Button>
        </div>
      </div>
    })
  }

  async function initData() {
    event.on(async (m) => {
      console.log("popup.js m", m);
      const { action, data } = m;

      if (action == "onContentInit") {
        await storage.set({
          currentHost: data.currentHost,
        });
      } else if (action == "setDesignerPages") {
        setDesignerPages(data.pages)
      } else if (action === eventConst.fillPassword) {
        console.log('动态口令为', data?.authCode);
        setPass(data?.authCode);
      }else if(action === 'onGetWindowData') {
        console.log('拿到的数据!!', data);  // "Hello, world!"
      }
    });

    const res = await event.emitBackground({
      action: eventConst.getCurrentContentHost,
      data: {},
    });

    console.log(res);

    let key = `${res.currentContentHost}-value`;
    const value = (await storage.get(key)) || "data-id";
    setCurrentValue(value);
    setCurrentHost(res.currentContentHost);

    let statusKey = `${res.currentContentHost}-status`;
    const statusRes = await event.emitBackground({
      action: eventConst.getCurrentContentStatus,

      data: {
        key: statusKey,
      },
    });

    setChecked(statusRes.value);
  }

  React.useEffect(() => {
    initData();
  }, []);

  const getDesignerPages = () => {
    event.emitContent({ action: "getDesignerPages" });
  }
  const handleFillPassword = () => {
    event.emitBackground({ action: eventConst.getPassword });
  }
  const onGetAccounts = () => {
    event.getWindowData({ key: 'userinfo', code: 'window.getUserInfo()' });
    storage.get('switcher_accounts').then((switcher_accounts) => {
      console.log('switcher_accounts', switcher_accounts)
    })
  }
  return (
    <div className="app">
      {/* <div className="title">YnfQuicker</div> */}

      {/* <div style={{ marginTop: "20px" }}>当前host: {currentHost}</div>
      <a target="__blank" href="https://git.yonyou.com/">用友git</a> <br/>
      <a target="__blank" href="https://gfjira.yyrd.com/secure/Dashboard.jspa">JIRA</a><br/>
      <a  target="__blank" href="https://gfwiki.yyrd.com/pages/viewpage.action?pageId=22542653">wiki</a><br/> */}
      <TenantSwitcher />
      <div className="button">
        <Button type="primary" onClick={onGetAccounts}>
          获得账户信息
        </Button>

        <Button type="primary" onClick={onClick}>
          设置
        </Button>
      </div>
    </div>
  );
}

// 渲染到页面
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
