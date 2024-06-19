import { message } from "antd";
import axios from "axios";
import { storage } from "../utils/chrome-util";
import { businessHostMap, loginHostMap } from "../config/hostMap";

function extractRedirectUrl(str) {
    const pattern = /window\.location\.href\s*=\s*"(.*?)"/;
    const match = str.match(pattern);

    if (match) {
        return match[1];
    } else {
        return null;
    }
}
function clearCookiesForDomain(domain) {
    chrome.cookies.getAll({ domain: domain }, (cookies) => {
    console.log(cookies);
      cookies.forEach((cookie) => {
        chrome.cookies.remove({
          url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
          name: cookie.name
        }, () => {
          console.log(`Removed cookie: ${cookie.name}`);
        });
      });
    });
  }
export const getLoginTicketUrl = async (env, data) => {
    const loginHost = loginHostMap[env];
    const host = businessHostMap[env];
    clearCookiesForDomain('.yonyoucloud.com');
    clearCookiesForDomain('.yyuap.com');
    const getPostData = (account) => {
        const { username, loginData } = account;
        return loginData
    }
    // https://yht-pre.yonyoucloud.com/cas/login?sysid=yonbip&mode=light&casLoginType=normal&service=https%3A%2F%2Fbip-pre.yonyoucloud.com%2Flogin_light%3Fyhtdesturl%3D%2Fyhtssoislogin%26yhtrealservice%3Dhttps%3A%2F%2Fbip-pre.yonyoucloud.com&locale=en_US
    const url = `https://${loginHost}/cas/login?sysid=yonbip&mode=light&casLoginType=normal&service=https%3A%2F%2F${host}%2Flogin_light%3Fyhtdesturl%3D%2Fyhtssoislogin%26yhtrealservice%3Dhttps%3A%2F%2F${host}`;
    const res = await axios.post(url,
        getPostData(data), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': url
        }
    })
    if (res.status === 200) {
        const url = extractRedirectUrl(res.data);
        if (url?.includes('ticket')) {
            console.log("换票链接获取成功", url)
            return url;
        }
    }
    console.log("没有找到换票链接，请检查请求参数")
    return null
}
export const getAllTanents = async (host) => {
    const url = `https://${host}/iuap-uuas-user/akas/listUserAk`;
    const r = await axios.get(`https://${host}/iuap-uuas-user/fe`, {
        withCredentials: true
    });
    const res = await axios.post(url,
        `pageSize=999&pageNum=1&isAjax=1&locale=zh_CN`, {
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
export const switchTanent = (env, tenantId) => {
    const host = businessHostMap[env];
    return axios.get(`https://${host}/?tenantId=${tenantId}&dimension=${tenantId}&switch=true`)
}

export const switchNow = async (values) => {
    // await storage.set({ ...values });
    const switcherAccounts = await storage.get('switcher_accounts');
    if(!switcherAccounts) return message.error("还没配置租户转换信息！");
    const env = values.env;
    const account = values.account;
    const tanentId = values.tanentId;
    const accountData = switcherAccounts?.[env]?.[account];
    console.log('要进行登录的账户信息',accountData);
    getLoginTicketUrl(env, accountData).then(url => {
        message.success("找到了换票链接，准备换票...");
        if (url) {
            getYhtToken(url).then((res) => {
                if (res.status === 200) {
                    message.success("环境Cookie设置成功，准备切换租户!");
                    switchTanent(env, tanentId).then((res) => {
                        if (res.status === 200) {
                            message.success("成功切换到目标租户！");
                            if (values.pageUrl) {
                                window.open(values.pageUrl);
                                message.success("已在新页面打开！");
                                if(values.openHome){
                                    const origin = new URL(values.pageUrl).origin
                                    window.open(origin);
                                }
                            }
                        } else {
                            message.error("切换租户失败！" + res.statusText);
                        }
                    }).catch(e => {
                        message.error("切换租户失败！" + e);
                    })
                } else {
                    message.success("环境Cookie设置失败!!");
                    console.log(res.data);
                }
            });
        }
    })
};
