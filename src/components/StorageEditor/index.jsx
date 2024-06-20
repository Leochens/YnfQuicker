import React, { useState, useRef, useEffect, useMemo } from "react";
import { Switch, Button, Select, Input, Form, message, Tabs } from "antd";
import JSONEditor from "../JSONEditor";
import { storage } from "../../utils/chrome-util";

export default function StorageEditor() {
    const jsoneditorRef = useRef(null);
    const [config, setConfig] = useState({});
    const [key, setKey] = useState(null);
    useEffect(() => {
        getData().then(() => {
            setKey('all')
        })
    }, []);
    const getData = async () => {
        const config = await storage.get()
        setConfig(config);
    }

    const handleClickBtn = (key) => {
        setKey(key);
    }
    const data = useMemo(() => {
        if (!key || key === 'all') return config;
        return config[key];
    }, [key])
    const renderButtons = () => {
        return Object.keys(config).map(k => <Button type={key === k ? 'primary' : undefined} onClick={() => handleClickBtn(k)}>{k}</Button>)
    }
    const handleUpdateData = async () => {
        if (!key) return message.error("请先选择一个数据源");
        const newData = jsoneditorRef.current?.jsoneditor?.getText();
        // console.log(newData);
        let parsedData;
        try {
            parsedData = JSON.parse(newData);
        } catch (e) {
            message.error('JSON解析失败！尝试写入现有格式');
            parsedData = newData;
        }
        console.log(parsedData);
        if (key === 'all') {
            // 更新全部数据
            await storage.clear();
            await storage.set(JSON.parse(JSON.stringify(parsedData)));
        } else {
            // 更新指定数据
            await storage.setByKey(key, parsedData);
        }
        return message.success("更新成功!")
    }
    return <div style={{ height: '800px' }}>
        <JSONEditor ref={jsoneditorRef} json={data}> </JSONEditor>
        <br />
        <Button type={key === 'all' ? 'primary' : undefined} onClick={() => {
            setKey('all')
        }}>全部</Button>
        {renderButtons()}
        <br />
        <Button onClick={handleUpdateData}>修改当前数据</Button>
    </div>
}

