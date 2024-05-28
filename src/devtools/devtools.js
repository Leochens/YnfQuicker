/**
 * options.js
 */
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Button, Input, Form, message, Modal, Collapse, Row, Col } from "antd";
import "./devtools.css";
import { storage } from "../utils/chrome-util.js";
import JSONEditor from "./components/JSONEditor.js";
import { EditOutlined, PlusSquareOutlined } from '@ant-design/icons'
chrome.devtools.panels.create("YNFHelper",
  "", //image file
  "dist/devtools/devtools.html",
  function (panel) { }
);
const connect = (code) => {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      code,
      function (result, isException) {
        if (isException) {
          console.error(isException);
          reject(isException);
        } else {
          resolve(result);
        }
      }
    );
  })

}
const QuickAddButton = ({ groupName, onAdd }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('');
  const [script, setScript] = useState('');
  const [afterEdit, setAfterEdit] = useState('');
  const [style, setStyle] = useState(null);
  const clear = () => {
    setName('');
    setScript('');
    setAfterEdit('');
    setScript('');
  }
  const handleOk = async () => {
    const quickbuttons = await storage.get('quickbuttons') ?? [];
    const group = quickbuttons[groupName];
    if (!group) return message.error(`按钮组 ${groupName} 不存在！`);
    const btns = group.btns;
    const exsited = btns?.find(item => item.name === name);
    if (exsited) {
      exsited.script = script;
    } else {
      btns.push({ name, script, afterEdit, style });
    }
    quickbuttons[groupName].btns = btns;
    await storage.set({ quickbuttons })
    setOpen(false);
    clear();
    onAdd && onAdd();
  }
  const handleCancel = () => {
    setOpen(false);
    clear();
  }
  return <>
    <Button size="small" icon={<PlusSquareOutlined />} type="primary" onClick={() => setOpen(true)}></Button>
    <Modal title="添加快速操作" open={open} onOk={handleOk} onCancel={handleCancel}>
      <Form.Item label={'按钮名称'}>
        <Input value={name} onInput={e => setName(e.target.value)} />
      </Form.Item>
      <Form.Item label={'执行脚本'}>
        <Input value={script} onInput={e => setScript(e.target.value)} />
      </Form.Item>
      <Form.Item label={'编辑后脚本'}>
        <Input value={afterEdit} onInput={e => setAfterEdit(e.target.value)} />
      </Form.Item>
      <Form.Item label={'样式(小驼峰)'}>
        <Input value={style} onInput={e => setStyle(e.target.value)} />
      </Form.Item>
    </Modal>
  </>
}
const QuickAddGroup = ({ onAdd }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('');
  const handleOk = async () => {
    const quickbuttons = await storage.get('quickbuttons') ?? [];
    const group = quickbuttons[name];
    if (group) return message.error("分组已存在，请更换名称");
    quickbuttons[name] = { btns: [] };
    await storage.set({ quickbuttons })
    setOpen(false);
    onAdd && onAdd();
    setName('');
  }
  const handleCancel = () => {
    setOpen(false);
    setName('')
  }
  return <>
    <Button size="small" icon={<PlusSquareOutlined />} type="primary" onClick={() => setOpen(true)}>新增分组</Button>
    <Modal title="添加分组" open={open} onOk={handleOk} onCancel={handleCancel}>
      <Form.Item label={'分组名称'}>
        <Input value={name} onInput={e => setName(e.target.value)} />
      </Form.Item>
    </Modal>
  </>
}
function App() {
  const [data, setData] = useState({});
  const [configs, setConfigs] = useState({});
  const [confirmBtnScript, setConfirmBtnScript] = useState();
  const jsoneditorRef = useRef(null);

  useEffect(() => {
    refreshConfig()
  }, [])
  const refreshConfig = () => {
    storage.get().then(config => {
      setConfigs(config);
    })
  }
  const execute = (btn) => {
    const { script, afterEdit } = btn ?? {};
    connect(script).then(r => {
      console.log(r)
      setData(r);
    })
    setConfirmBtnScript(afterEdit);
  }
  const renderButtons = () => {
    const renderBtns = (btns, groupName) => {
      const bs = btns?.map(btn => {
        let style = {}
        try {
          style = JSON.parse(btn?.style)
        } catch (e) {
        }
        return <Button style={{ margin: 2, ...style }} size="small" onClick={() => execute(btn)} >{btn.name}</Button>
      }) ?? null

      return <div>
        <QuickAddButton onAdd={refreshConfig} groupName={groupName} />
        {bs}
      </div>
    }
    const quickbuttonGroups = configs?.quickbuttons ?? {};
    const items = Object.keys(quickbuttonGroups).map((groupName, index) => (
      <Collapse.Panel style={{ padding: 0 }} header={groupName} key={index}>
        {renderBtns(quickbuttonGroups[groupName]?.btns, groupName)}
      </Collapse.Panel>));
    return <Collapse
      ghost
      style={{ background: '#f9f8f7' }}
      defaultActiveKey={['0']}
      size='small'
      bordered={false}>
      {items}
    </Collapse>
  }

  const getCurConfig = async () => {
    const configs = await storage.get();
    setData(configs);
    setConfirmBtnScript(`%%updateConfig%%`)
  }

  const confirmChange = () => {
    const newData = jsoneditorRef.current?.jsoneditor?.getText();
    console.log(newData);
    let data;
    try {
      data = JSON.parse(newData);
    } catch (e) {
      message.error('JSON解析失败！尝试写入现有格式');
      data = newData;
    }
    setData(data);
    if (!confirmBtnScript) return;
    if (confirmBtnScript === '%%updateConfig%%') {
      storage.set(data).then(() => {
        refreshConfig();
      })
      return;
    }
    const str = confirmBtnScript.replace(/%%data%%/g, JSON.stringify(data));
    console.log(str);
    connect(str).then(r => {
      console.log(r)
      message.success('执行成功');
    }).catch(e => {
      message.error(`执行失败：` + str);
    })
  }
  return (
    <div className="devpanel">
      <div style={{ height: 650 }}>
        <JSONEditor ref={jsoneditorRef} json={data}> </JSONEditor>
      </div>
      <Row align="center" style={{
        maxHeight: 200,
        minHeight: 100,
        overflow: 'auto'
      }} gutter={10}>
        <Col span={18}>
          {renderButtons()}
        </Col>
        <Col span={6}>
          <Button style={{ marginBottom: 10 }} size="small" type="primary" danger onClick={getCurConfig}>查看当前配置</Button>
          <QuickAddGroup onAdd={refreshConfig} />
          {!!confirmBtnScript && <Button  style={{ marginTop: 10 }} size="small" icon={<EditOutlined />} onClick={confirmChange}>确认修改</Button>}
        </Col>
      </Row>
    </div>
  );
}

// 渲染到页面
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
