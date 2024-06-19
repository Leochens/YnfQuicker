import React, { useState, useEffect } from "react";
import { Switch, Button, Select, Input, Form, message } from "antd";
import "./index.css";
import { event, storage } from "../../utils/chrome-util.js";
import { getLoginTicketUrl, getYhtToken, switchNow, switchTanent } from "../../tokenUtils/index.js";
import FormModal from "../FormModal/index.jsx";
console.log("options.js");

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
    marginTop: "5px",
  },
  initialValues: {
    remember: true,
  },
  autoComplete: "off",
};

export function TenantSwitcher({ print }) {
  const [form] = Form.useForm();
  const [selectedEnv, setSelectedEnv] = React.useState();
  const [selectedAccount, setSelectedAccount] = React.useState();
  const [selectedTenant, setSelectedTenant] = React.useState();
  const [switcherAccounts, setSwitcherAccounts] = useState(null);

  const onFinish = async (values) => {
    print(values);
    switchNow(values);
  };
  useEffect(() => { }, [
    storage.get('switcher_accounts').then((switcher_accounts) => {
      setSwitcherAccounts(switcher_accounts)
    }).catch(e => {
      console.log(e);
    })
  ], [])

  async function initData() {
    form.setFieldsValue({
      env: selectedEnv
    });
  }
  React.useEffect(() => {
    initData();
  }, []);
  // const getTanents = () => {

  // }
  const setStarEnv = async (starEnvName) => {
    const values = form.getFieldsValue();
    if(!values.env || !values.account || !values.tanentId) {
      return message.error('请把环境 账号 租户选择完成再继续！');
    }
    const starEnvs = await storage.get('star_envs') ?? [];
    starEnvs.push({
      ...values,
      starEnvName
    });
    await storage.setByKey('star_envs', starEnvs);
    message.success('设置常用环境成功！');
  }
  const filterOption = (input, { label, value }) =>
    (label ?? '').toLowerCase().includes(input.toLowerCase());

  // 获得环境信息
  const getEnvOptions = () => {
    return Object.keys(switcherAccounts).map((env) => ({ label: env, value: env }));
  }
  // 获得账号信息
  const getEnvAccountOptions = () => {
    const accountMap = switcherAccounts?.[selectedEnv]
    if (!accountMap) return [];
    return Object.keys(accountMap).map((key) => ({ label: accountMap[key].username, value: accountMap[key].username }));
  }
  const getTenantOptions = () => {
    const tenants = switcherAccounts[selectedEnv]?.[selectedAccount]?.allowTenants;
    if (!tenants) return [];
    return tenants?.map((tenant) => ({ label: tenant.tenantName, key: tenant.tenantName + tenant.virtualTenantId, value: tenant.ytenantId }))
  }
  if (!switcherAccounts) {
    return <div>
      环境切换功能还未配置，请登录至少一个环境的租户后再试。
    </div>
  }
  return (
    <div className="tenant-switcher">
      <h2 style={{ textAlign: "center" }}>环境快速切换</h2>

      <Form size="small" {...formConfig} form={form} onFinish={onFinish}>
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
          <Select
            onChange={(v) => {
              setSelectedEnv(v)
            }}
            showSearch
            options={getEnvOptions()}
          >
          </Select>
        </Form.Item>
        <Form.Item
          label="账号"
          name="account"
          rules={[
            {
              required: true,
              message: "请选择账号",
            },
          ]}
        >
          <Select
            onChange={(v) => {
              setSelectedAccount(v)
            }}
            showSearch
            options={getEnvAccountOptions()}
          >
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
            onChange={(v) => {
              setSelectedTenant(v)
            }}
            showSearch
            options={getTenantOptions()}
          >
          </Select>
        </Form.Item>
       
        <Form.Item
          label="单据链接"
          name="pageUrl"
        >
          <Input placeholder="请输入单据链接,不输入则只切租户" />
        </Form.Item>
        <Form.Item
          label="是否打开工作台"
          name="openHome"
        >
          <Select
            showSearch
            options={[{label: '是', value: true},{label: '否', value: false}]}
          >
          </Select>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            一键跳转
          </Button>
        </Form.Item>
      </Form>

      <FormModal
        modalConfig={{
          title: '起个名字吧'
        }}
        formItems={[
          {
            label: '名称',
            name: 'envName'
          }
        ]}
        onSubmit={(values) => {
          print('onSubmit',values);
          setStarEnv(values.envName)
        }}
        button={<Button type="primary" >
          设置当前配置为常用环境
        </Button>}>

      </FormModal>

      {/* <Button onClick={() => getAllTanents(hostsMap['bip-test'])}>获得测试环境的所有租户</Button> */}

      {/* <Button onClick={getToken}>获得测试环境的token</Button>
      <Button onClick={() => getAllTanents()}>获得测试环境的所有租户</Button> */}
      {/* <TanentLoader /> */}
    </div>
  );
}
