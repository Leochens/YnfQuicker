import axios from "axios";

function extractRedirectUrl(str) {
    const pattern = /window\.location\.href\s*=\s*"(.*?)"/;
    const match = str.match(pattern);

    if (match) {
        return match[1];
    } else {
        return null;
    }
}

export const getLoginTicketUrl = async (host, data) => {
    // https://yht-pre.yonyoucloud.com/cas/login?sysid=yonbip&mode=light&casLoginType=normal&service=https%3A%2F%2Fbip-pre.yonyoucloud.com%2Flogin_light%3Fyhtdesturl%3D%2Fyhtssoislogin%26yhtrealservice%3Dhttps%3A%2F%2Fbip-pre.yonyoucloud.com&locale=en_US
    const url = `https://${host === 'bip-pre.yonyoucloud.com' ? 'yht-pre.yonyoucloud.com': host}/cas/login?sysid=yonbip&mode=light&casLoginType=normal&service=https%3A%2F%2F${host}%2Flogin_light%3Fyhtdesturl%3D%2Fyhtssoislogin%26yhtrealservice%3Dhttps%3A%2F%2F${host}`;
    const res = await axios.post(url,
        data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': url
            }
        })
    if (res.status === 200) {
        const url = extractRedirectUrl(res.data);
        if (url.includes('ticket')) {
            console.log("换票链接获取成功", url)
            return url;
        }
    }
    console.log("没有找到换票链接，请检查请求参数")
    return null
}
export const getAllTanents = async (host) => {
    const url = `https://${host}/iuap-uuas-user/akas/listUserAk`;
    const r = await axios.get(`https://${host}/iuap-uuas-user/fe`,{
        withCredentials: true
    });
    const res = await axios.post(url,
    `pageSize=999&pageNum=1&isAjax=1&locale=zh_CN`,{
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    console.log(res);
    if (res.status === 200) {
        return res.data
    }
    return null;
}
export const getYhtToken = async (url) => {
    return axios.get(url, {
        withCredentials: true
    });
}
export const switchTanent = (host, tenantId) => {
    return axios.get(`https://${host}/?tenantId=${tenantId}&dimension=${tenantId}&switch=true`)
}