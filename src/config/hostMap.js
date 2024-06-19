// 根据业务地址去映射环境
export const envHostMap = {
    'bip-test.yonyoucloud.com': 'test',
    'bip-daily.yonyoucloud.com': 'daily',
    'bip-pre.yonyoucloud.com': 'pre',
    'c1.yonyoucloud.com': 'core',
    'c2.yonyoucloud.com': 'core',
    'c3.yonyoucloud.com': 'core',
    'c4.yonyoucloud.com': 'core',
}
// 根据登录地址去映射环境
export const domainMap = {
    'https://bip-test.yonyoucloud.com': 'test',
    'https://yht-daily.yonyoucloud.com': 'daily',
    'https://yht-pre.yonyoucloud.com': 'pre',
    'https://euc.yonyoucloud.com': 'core',
}
export const loginHostMap = {
    'test': 'bip-test.yonyoucloud.com',
    'daily': 'yht-daily.yonyoucloud.com',
    'pre': 'yht-pre.yonyoucloud.com',
    'core': 'euc.yonyoucloud.com'
}
export const businessHostMap = {
    'test': 'bip-test.yonyoucloud.com',
    'daily': 'bip-daily.yonyoucloud.com',
    'pre': 'bip-pre.yonyoucloud.com',
    'core': 'c1.yonyoucloud.com'
}