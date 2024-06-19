/**
 * popup.js
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button, message, Tabs, Icon } from "antd";
import "./popup.css";
import { event, tabs, storage } from "../utils/chrome-util.js";
import { eventConst } from "../consts.js";
import { OptionPage } from "../options/options.js";
import { TenantSwitcher } from "../components/TenantSwicher/index.jsx";
import { envHostMap } from "../config/hostMap.js";
import StarEnvs from "../components/StarEnvs/index.jsx";
import { StarOutlined,SettingOutlined,PlayCircleOutlined } from "@ant-design/icons";
const { TabPane } = Tabs;

function App() {
  const onClick = async () => {
    chrome.runtime.openOptionsPage();
  };
  const processWindowData = async (eventData) => {

    const { key, data = {}, host } = eventData;
    const env = envHostMap[host];
    if (key === 'userinfo') {
      // 在工作台获得了租户信息， 包含所有租户的列表 可以更新可选的租户列表了
      const { allowTenants, userEmail, userMobile } = data;
      message.success("开始获得租户列表...");
      if (!allowTenants) {
        message.error('获得租户列表失败！');
        print(eventData);
        return;
      }
      // 获得之前预存的租户列表信息
      const switcher_accounts = await storage.get('switcher_accounts') ?? {};
      if (!switcher_accounts[env]) {
        return message.error("该域下还未配置账户，请重新登录该环境后再试！");
      }
      const userInfo = switcher_accounts[env][userEmail] ?? switcher_accounts[env][userMobile]
      if (!userInfo) {
        return message.error("该账户还未记录，请重新登录该账号后再试！");
      }
      Object.assign(userInfo, {
        allowTenants: allowTenants?.map((item) => ({
          tenantName: item.tenantName,
          ytenantId: item.ytenantId,
          virtualTenantId: item.virtualTenantId,
          logo: item.logo
        }))
      })
      // 将租户列表保存到当前的账号信息里
      await storage.setByKey('switcher_accounts', switcher_accounts);
      message.success('同步租户列表成功！');

    }
  }
  const eventListen = () => {
    event.on(async (m) => {
      print(m);
      const { action, data } = m;
      if (action === 'onGetWindowData') {
        // console.log('拿到的数据!!', data);
        processWindowData(data);
      }
    });
  }
  const initData = () => {
    // 事件注册
    eventListen();
    // 获得当前的租户名称
  }


  React.useEffect(() => {
    initData();
  }, []);
  const onGetAccounts = () => {
    event.getWindowData({ key: 'userinfo', code: 'window.getUserInfo()' });
    // storage.get('switcher_accounts').then((switcher_accounts) => {
    //   console.log('switcher_accounts', switcher_accounts)
    // })
  }
  const print = (...rest) => {
    event.emitContent({ action: 'print', data: [...rest] });
  }
  return (
    <div className="popup">
      <Tabs
        defaultActiveKey="starEnv"
        size='small'
        items={[
          {
            label: '常用环境',
            key: 'starEnv',
            children: <StarEnvs />,
            icon: StarOutlined
          },
          {
            label: '自选环境',
            key: 'tanentSwitcher',
            icon: PlayCircleOutlined,
            children: <TenantSwitcher print={print} />
          },
          {
            label: '设置',
            key: 'setting',
            icon: SettingOutlined,
            children: <div className="button">
              <Button type="primary" onClick={onGetAccounts}>
                更新该租户的租户列表信息
              </Button>

              {/* <Button type="primary" onClick={onClick}>
              设置
            </Button> */}
              <Button type="primary" onClick={() => {
                storage.get().then(data => {
                  print(data);
                })
              }}>
                当前的存储数据
              </Button>
              <Button type="primary" onClick={() => {
                storage.setByKey('switcher_accounts', {}).then(data => {
                  message.success("清除成功")
                })
              }}>
                清除租户切换数据
              </Button>
              <Button type="primary" onClick={() => {
                storage.setByKey('star_envs', null).then(data => {
                  message.success("清除成功")
                })
              }}>
                清除常用环境
              </Button>
            </div>
          },
          {
            label: '帮助',
            key: 'help',
            children:<div>
              帮助信息
            </div>
          },

        ]}
      />

    </div>
  );
}

// 渲染到页面
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
