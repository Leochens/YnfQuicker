import React from "react";
import { Switch, Button,Select, Input, Form, message } from "antd";
import "./index.css";
import { event, storage } from "../../utils/chrome-util.js";
import axios from "axios";
import { getAllTanents, getLoginTicketUrl, getYhtToken, switchTanent } from "../../tokenUtils/index.js";
import devTanents from '../../options/configs/iuap-dev.json'
import testTanents from '../../options/configs/test.json'
import dailyTanents from '../../options/configs/daily.json'
import preTanents from '../../options/configs/pre.json'
import accounts from '../../options/configs/accounts.json'
console.log("options.js");
const hostsMap = {
  'iuap-dev': 'iuap-dev.yyuap.com',
  'bip-test': 'bip-test.yonyoucloud.com',
  'bip-daily':'bip-daily.yonyoucloud.com',
  'bip-pre':'bip-pre.yonyoucloud.com',
  // 'c1':'c1.yonyoucloud.com',
  // 'c2':'c2.yonyoucloud.com',
  }
const tanentsMap = {
'iuap-dev': devTanents,
'bip-test': testTanents,
'bip-daily':dailyTanents,
'bip-pre':preTanents,
// 'c1':testTanents,
// 'c2':testTanents,
}

const formConfig = {
  name: "form",
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
  style: {
    maxWidth: 300,
    marginTop: "20px",
  },
  initialValues: {
    remember: true,
  },
  autoComplete: "off",
};

export function TenantSwitcher() {
  const [form] = Form.useForm();
  const [currentHost, setCurrentHost] = React.useState(false);
  const [selectedEnv, setSelectedEnv] = React.useState('bip-test');
  const onFinish = async (values) => {
    console.log(values);
    
    await storage.set({ ...values });
    const env = values.env;
    const tanentId = values.tanentId;
    const host = hostsMap[env];
    if(!host) {
      return message.error("环境配置错误,未找到host");
    }
    getLoginTicketUrl(host, accounts[env]?.[0].data).then(url => {
      message.success("找到了换票链接，准备换票...");
      if(url){
        getYhtToken(url).then((res) => {
          if(res.status === 200){
            message.success("环境Cookie设置成功，准备切换租户!");
            switchTanent(host, tanentId).then((res) => {
              if(res.status === 200){
                message.success("成功切换到目标租户！");
                if(values.pageUrl){
                  window.open(values.pageUrl);
                  message.success("已在新页面打开！");
                } 
              }else{
                message.error("切换租户失败！"+ res.statusText);
              }
            }).catch(e =>  {
              message.error("切换租户失败！"+ e);
            })
          }else {
            message.success("环境Cookie设置失败!!");
            console.log(res.data);
          }
        });
      }
    })
  };

  async function initData() {
    form.setFieldsValue({
     env: selectedEnv
    });
  }

  const getToken = () => {
    getLoginTicketUrl().then(url => {
      message.success("找到了换票链接，准备换票...");
      if(url){
        getYhtToken(url).then((res) => {
          if(res.status === 200){
            message.success("环境Cookie设置成功，准备切换租户!");
            switchTanent()
            message.success("成功切换到目标租户！");
          }else {
            message.success("环境Cookie设置失败!");
            console.log(res.data);
          }
        });
      }
    })
  }
  React.useEffect(() => {
    initData();
  }, []);
  const getTanents = () => {

  }
  const setStarEnv = () => {
    const values = form.getFieldsValue();
    console.log(values);
  }
  const getCurEnvTanents = () => {
    return tanentsMap[selectedEnv]?.map(({tenantName,tenantId})=>{
      return {
        label: tenantName,
        value: tenantId
      }
    })
  }
  const filterOption = (input, { label, value }) =>
  (label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div className="app">
      <h2 style={{ textAlign: "center" }}>环境快速切换</h2>

      <Form {...formConfig} form={form} onFinish={onFinish}>
        <Form.Item
          label="目标环境"
          name="env"
          rules={[
            {
              required: true,
              message: "请输入单据所在目标环境",
            },
          ]}
        >
        <Select onChange={(v) => {
          setSelectedEnv(v)
        }}>
          <Select.Option value="iuap-dev">平台开发环境</Select.Option>
          <Select.Option value="bip-test">测试环境</Select.Option>
          <Select.Option value="bip-daily">日常环境</Select.Option>
          <Select.Option value="bip-pre">预发环境</Select.Option>
          {/* <Select.Option value="c1">核心1环境</Select.Option>
          <Select.Option value="c2">核心2环境</Select.Option> */}
        </Select>
        </Form.Item>
        <Form.Item
          label="租户"
          name="tanentId"
          rules={[
            {
              required: true,
              message: "请输入单据的使用租户",
            },
          ]}
        >
        <Select
        filterOption={filterOption}
        showSearch
        options={getCurEnvTanents()}
        >
        </Select>
        </Form.Item>
        <Form.Item
          label="单据链接"
          name="pageUrl"
        >
          <Input placeholder="请输入单据链接" />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            一键跳转22
          </Button>
        </Form.Item>
      </Form>
        
      <Button type="primary" onClick={setStarEnv}>
          设置当前配置常用环境
      </Button>

    <Button onClick={() => getAllTanents(hostsMap['bip-test'])}>获得测试环境的所有租户</Button>

      {/* <Button onClick={getToken}>获得测试环境的token</Button>
      <Button onClick={() => getAllTanents()}>获得测试环境的所有租户</Button> */}
      {/* <TanentLoader /> */}
    </div>
  );
}
