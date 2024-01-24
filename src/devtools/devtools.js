/**
 * options.js
 */
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button, Input, Form, message } from "antd";
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
  return new Promise((resolve,reject) => {
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
function App() {
  const [data,setData] = useState({});
  const getCurrNode = () => {
    connect('window.yyds.getCurrNode()').then(r=>{
      console.log(r)
      setData(r);
    })
    // connect('window.yyds.getCurrNode()').then(r=>{
    //   console.log(r)
    //   setData(JSON.stringify(r));
    // })
  }
  const onChangeJSON = (r) => {
    console.log(r);
  };
  return (
    <div className="devpanel">
      <div>我是devtools</div>
      <Button onClick={getCurrNode}>获取当前协议</Button>
      <Button>获取当前meta</Button>
      <JSONEditor json={data} onChangeJSON={onChangeJSON}> </JSONEditor>
    </div>
  );
}

// 渲染到页面
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
