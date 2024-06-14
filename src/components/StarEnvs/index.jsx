import { Button } from "antd";
import React, { useState, useEffect } from "react";
import { storage } from "../../utils/chrome-util";
import { switchNow } from "../../tokenUtils";

// 渲染常用环境
const StarEnvs = () => {

    const [starEnvs, setStarEnvs] = useState(null);
    useEffect(() => {
        storage.get('star_envs').then((star_envs) => {
            setStarEnvs(star_envs);
        }).catch(e => {
            console.log(e);
        })
    }, [])


    const renderEnvBtn = (env) => {

        const onClickEnvBtn = () => {
            switchNow(env);
        }
        return <Button onClick={onClickEnvBtn}>
            {env.starEnvName} {env.pageUrl ? '=>链接直达' : undefined}
        </Button>
    }

    if (!starEnvs) return <div>暂未配置常用环境</div>
    return <div>
        {starEnvs.map(renderEnvBtn)}
    </div>
}

export default StarEnvs;