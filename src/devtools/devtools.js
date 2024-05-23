/**
 * options.js
 */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button, Input, Form, message, Modal , ColorPicker} from "antd";
import "./devtools.css";
import { event, storage } from "../utils/chrome-util.js";
import { eventConst } from "../consts.js";
import JSONEditor from "./components/JSONEditor.js";
console.log("devtools.js");
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
const QuickAddButton = ({ onAdd }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('');
  const [script, setScript] = useState('');
  const [afterEdit, setAfterEdit] = useState('');
  const handleOk = async () => {
    const quickbuttons = await storage.get('quickbuttons') ?? [];
    const exsited = quickbuttons?.find(item => item.name === name);
    if (exsited) {
      exsited.script = script;
    } else {
      quickbuttons.push({ name, script, afterEdit });
    }
    await storage.set({ quickbuttons })
    setOpen(false);
    onAdd && onAdd();
  }
  const handleCancel = () => {
    setOpen(false);
  }
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>
      添加快速按钮
    </Button>
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
      <Form.Item label={'颜色'}>
        {/* <ColorPicker o */}
        <Input value={afterEdit} onInput={e => setAfterEdit(e.target.value)} />
      </Form.Item>
    </Modal>
  </>
}
function App() {
  const [data, setData] = useState({});
  const [configs, setConfigs] = useState({});
  const [confirmBtnScript, setConfirmBtnScript] = useState();
  useEffect(() => {
    refreshConfig()
  }, [])
  const refreshConfig = () => {
    storage.get().then(config => {
      setConfigs(config);
    })
  }
  // const getCurrNode = () => {
  //   connect('window.yyds.getCurrNode()').then(r => {
  //     console.log(r)
  //     setData(r);
  //   })
  // }
  const execute = (btn) => {
    const { script, afterEdit } = btn ?? {};
    connect(script).then(r => {
      console.log(r)
      setData(r);
    })
    setConfirmBtnScript(afterEdit);
  }
  // const getCurNodeMeta = () => {
  //   // storage.get
  //   connect('window.yyds.getNodeMetaByNid()').then(r => {
  //     console.log(r)
  //     setData(r);
  //   })
  // }
  // const getCurNodeDatasource = () => {
  //   connect('yyds.getDatasourceFieldByStoreFieldAlias(yyds.delMobxPrefix(yyds.getCurrNode().store),yyds.getCurrNode().storeField)?.datasourceField || {}').then(r => {
  //     console.log(r)
  //     setData(r);
  //   })
  // }
  // const getCurZustand = () => {
  //   connect('ZUSTAND_STORES.ReferConfig.getState() || {}').then(r => {
  //     console.log(r)
  //     setData(r);
  //   })
  // }
  const onChangeJSON = (r) => {
    setData(JSON.parse(r));
  };

  const renderButtons = () => {
    return configs?.quickbuttons?.map(btn => <Button style={{margin: 6}} size="small" onClick={() => execute(btn)} >{btn.name}</Button>) ?? null
  }

  const getCurConfig = async () => {
    const configs = await storage.get();
    setData(configs);
    setConfirmBtnScript(`%%updateConfig%%`)
  }

  const confirmChange = () => {
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
    // yyds.replaceNode(yyds.getCurrNode()?.nid, JSON.parse() )
  }
  return (
    <div className="devpanel">
      {/* <Button onClick={getCurrNode}>获取当前协议</Button>
      <Button onClick={getCurNodeMeta}>获取当前meta</Button>
      <Button onClick={getCurNodeDatasource}>获取当前数据源</Button>
    <Button onClick={getCurZustand}>获取当前的参照Store</Button> */}
      <QuickAddButton onAdd={refreshConfig} />
      <Button type="primary" danger onClick={getCurConfig}>查看当前配置</Button>
      <br/>
      {renderButtons()}
      <div style={{ height: 800 }}>
        <JSONEditor json={data} onChangeJSON={onChangeJSON}> </JSONEditor>
      </div>
      {!!confirmBtnScript && <Button onClick={confirmChange}>确认修改</Button>}
    </div>
  );
}

// 渲染到页面
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
