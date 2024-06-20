import { Button, Alert, Popover, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import { storage } from "../../utils/chrome-util";
import { switchNow } from "../../tokenUtils";
import { DeleteOutlined, LinkOutlined, QuestionCircleOutlined, EditOutlined } from "@ant-design/icons";

// 渲染常用环境
const StarEnvs = () => {

    const [starEnvs, setStarEnvs] = useState(null);
    useEffect(() => {
        getData()
    }, [])
    const getData = () => {
        storage.get('star_envs').then((star_envs) => {
            setStarEnvs(star_envs);
        }).catch(e => {
            console.log(e);
        })
    }


    const renderEnvBtn = (env) => {

        const onClickEnvBtn = () => {
            switchNow(env);
        }
        // {"account":"13146634152","env":"pre","pageUrl":"https://bip-pre.yonyoucloud.com/iuap-yonbuilder-designer/ucf-wh/designviewer/apps/quickdev/index.html#/onepage/design/AT1BD0DFFE0F180002/PT2019773671873708044/ysmdd?pageCodes=PT2019773680480944133,PT2019773671873708044&locale=zh_CN&feDomainKey=developplatform&busiObj=fanbx1","starEnvName":"预发0905低代码PC","tanentId":"0000LM6AKK0MB7NNYY0000"}
        const popContent = <div>
            <div>账号: {env.account}</div>
            <div>环境: {env.env}</div>
            <div>租户: {env.tanentId}</div>
        </div>
        const confirmDelete = async () => {
            const data = await storage.get('star_envs') ?? [];
            const index = data.findIndex(i => i.starEnvName === env.starEnvName);
            data.splice(index, 1);
            await storage.setByKey('star_envs', data);
            getData()
        }
        return <div style={{ width: '100%', marginBottom: 5 }}>
            <Button size="small" onClick={onClickEnvBtn}>
                {env.starEnvName} {env.pageUrl ? <LinkOutlined style={{ color: 'blue' }} /> : undefined}
            </Button>
            <Popconfirm
                title="删除常用配置"
                // description="Are you sure to delete this task?"
                onConfirm={confirmDelete}
                // onCancel={cancel}
                okText="删除"
                cancelText="取消"
            >
                <Button style={{ marginLeft: 10, padding: 0 }} size="small"> <DeleteOutlined /> </Button>
            </Popconfirm>
            <Popover content={popContent}>
                <Button style={{ marginLeft: 10, padding: 0 }} size="small"> <QuestionCircleOutlined /> </Button>
            </Popover>
            <Button onClick={() => {
                chrome.runtime.openOptionsPage();
            }} style={{ marginLeft: 10, padding: 0 }} size="small"> <EditOutlined /> </Button>
        </div>
    }

    if (!starEnvs) return <div>暂未配置常用环境</div>
    return <div>
        <Alert message={
            <div>
                <div style={{ fontSize: 12 }}>点击下方按钮自动跳转对应环境，如果存在 <LinkOutlined style={{ color: 'blue' }} /> 图标还会打开一个新的链接</div>
                <div style={{ fontSize: 12 }}>如何添加: 在<b>环境切换</b>页签下<b>收藏</b>常用环境</div>
            </div>
        } type="info" />
        <br />
        {starEnvs.map(renderEnvBtn)}
    </div>
}

export default StarEnvs;