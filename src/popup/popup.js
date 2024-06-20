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
import { StarOutlined, SettingOutlined, PlayCircleOutlined, LikeFilled } from "@ant-design/icons";

const Help = () => {
  return <div style={{ fontSize: 12 }}>
    <div>本插件默认支持的环境为 test(测试环境) daily(日常环境) pre(预发环境) core(核心环境)</div>
    <div>
      使用流程:
    </div>
    <div>
      1. 先在BIP登录页面进行<b>账号密码形式</b>的登录,暂不支持手机号验证码登录。登录后插件会自动记录账号登录信息。
    </div>
    <div style={{ color: 'red' }} >
      2. 进入工作台后，在<b>设置</b>页签点击<b>获得可用租户列表按钮</b>，来抓取租户信息，否则对应环境的账号下的租户列表是空的。
    </div>
    <div>
      3. 信息抓取完毕后，在<b>环境切换</b>页签下，选择环境、账号、租户进行切换，也可以配置一个链接。点击<b>一键跳转</b> 按钮可以直接跳转到对应的链接页面
    </div>
    <div>4. 如果这个配置你经常使用，可以点击<b>收藏</b>按钮，这样可以在<b>常用环境</b>页签下展示出快速跳转按钮，便捷操作。</div>
  </div>
}
function App() {
  const openOptionsPage = async () => {
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
    message.info("请确认在工作台首页点击该按钮");
    event.getWindowData({ key: 'userinfo', code: 'window.getUserInfo()' });
    // storage.get('switcher_accounts').then((switcher_accounts) => {
    //   console.log('switcher_accounts', switcher_accounts)
    // })
  }
  const handleClickLikeBtn = () => {
    const messages = [
      '谢谢你的点赞!🚀',
      '作者:Leochens-ZHL!🌅',
      '好人一生平安🎁',
      '感谢内测人员wbk!🎉',
      '感谢内测试人员caven!🎉',
      '羡慕你这么无聊!🌚',
      '你再点一下试试🌚',
      '你在摸鱼吗?🤡'];
    function getRandomInt(min, max) {
      min = Math.ceil(min);   // 向上取整
      max = Math.floor(max);  // 向下取整
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const index = getRandomInt(0, messages.length - 1);
    return message.info(messages[index]);
  }
  const print = (...rest) => {
    event.emitContent({ action: 'print', data: [...rest] });
  }
  return (
    <div className="popup">
      <div style={{lineHeight: '40px',fontSize: 18, textAlign: 'center'}}>
        <b><i>BIPHelper</i></b>-快捷环境租户切换
      </div>
      <Tabs
        defaultActiveKey="starEnv"
        destroyInactiveTabPane
        size='small'
        items={[
          {
            label: '常用环境',
            key: 'starEnv',
            children: <StarEnvs />,
            icon: StarOutlined
          },
          {
            label: '环境切换',
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
                获得可用租户列表按钮
              </Button>
              <Button type="primary" onClick={openOptionsPage}>
                前往详细配置页
              </Button>
              {/* <Button type="primary" onClick={() => {
                storage.get().then(data => {
                  print(data);
                })
              }}>
                当前的存储数据
              </Button> */}
              {/* <Button type="primary" onClick={() => {
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
              </Button> */}
            </div>
          },
          {
            label: '帮助',
            key: 'help',
            children: <Help />
          },

        ]}
      />
      <div style={{
        position: 'fixed',
        right: 10,
        bottom: 10,
        fontSize: 20,
      }}>
        <LikeFilled onClick={handleClickLikeBtn} />
      </div>
    </div>
  );
}

// 渲染到页面
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
