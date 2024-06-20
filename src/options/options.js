/**
 * options.js
 */
import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button, Select, Input, Form, message, Tabs } from "antd";
import "./options.css";
import StorageEditor from "../components/StorageEditor/index.jsx";
// import { event, storage } from "../utils/chrome-util.js";
console.log("options.js");

export function OptionPage() {
  return (
    <div className="option-page">
      <Tabs
        style={{height: '100%'}}
        tabPosition={'left'}
        items={[
          {
            label: '存储配置',
            key: 'localdata',
            children: <StorageEditor/>
          }
        ]}
      ></Tabs>
    </div>
  );
}

// 渲染到页面
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OptionPage />);
