import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Switch, Button,Select, Input, Form, message } from "antd";
import { event, storage } from "../../utils/chrome-util.js";
import { eventConst } from "../../consts.js";
import axios from "axios";
import { getAllTanents, getLoginTicketUrl, getYhtToken, switchTanent } from "../../tokenUtils/index.js";
const envMap = {
    test: 'bip-test',
    daily: 'bip-daily',
    pre: 'bip-pre',
    dev: 'iuap-dev',
    c1: 'c1',
    c2: 'c2'
}
const getAllEnvTanents = async () => {
    const envTanentsMap = (await storage.get('envTanentsMap')) || {};
    return envTanentsMap;
}
// 获得租户 并缓存
const TanentLoader = () => {

    const [envTanentsMap, setEnvTanentsMap] = useState({});
    useEffect(() => {
        getAllEnvTanents().then( map=> setEnvTanentsMap(map));
    },[])
    const envKeys = Object.keys(envMap);

    const getEnvTanents = () => {
        getLoginTicketUrl().then(url => {
            if(!url) return message.error("登录换票失败！");
            getYhtToken(url).then((res) => {
                setTimeout(() => {
                    getAllTanents('https://bip-test.yonyoucloud.com').then(data => {
                        console.log("获得data了！",data);
                        // if(data.)
                    } )
                },300)
            });
          })
    }
    return <div>
        {envKeys.map(key => {
            return <div>
            <Button>{key} 环境租户 {envTanentsMap[key]?.length}</Button>
            <Button onClick={() => getEnvTanents(key)}>获取该环境下租户</Button>
            </div>
        })}
    </div>
}

export default TanentLoader;