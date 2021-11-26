let domianURL = "";
let casPrefixUrl = "";
let onlinePreviewDomainURL = ""
switch (process.env.VUE_APP_CURENV) {
    case "ywl":
        domianURL = "http://risun-itsm.vaiwan.com/jeecg-boot"
        // domianURL = "http://172.16.100.145:8080/jeecg-boot";
        casPrefixUrl = "http://cas.example.org:8443/cas";
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
    case "zy":
        domianURL = "http://172.16.100.145:8080/jeecg-boot";
        casPrefixUrl = "http://cas.example.org:8443/cas";
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
    case "lsf":
        domianURL = "http://172.16.100.145:8080/jeecg-boot";
        // domianURL = "http://itsm-lee.vaiwan.com/jeecg-boot";
        casPrefixUrl = "http://cas.example.org:8443/cas";
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
    case "development":
        domianURL = "http://172.16.100.145:8080/jeecg-boot";
        casPrefixUrl = "http://cas.example.org:8443/cas";
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
    case "test":
        domianURL = "http://172.16.100.145:8080/jeecg-boot";
        casPrefixUrl = "http://cas.example.org:8443/cas";
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
    case "production":
        domianURL = "http://itsm.risun.com:9999/jeecg-boot";
        casPrefixUrl = 'http://cas.example.org:8443/cas';
        onlinePreviewDomainURL = "http://fileview.jeecg.com/onlinePreview"
        break;
}
let url = {
    // 接口请求地址
    domianURL, 
    // 单点登录地址
    casPrefixUrl,
    // online地址
    onlinePreviewDomainURL,
    // staticDomainURL
    staticDomainURL: domianURL + "/sys/common/static",
    pdfDomainURL: domianURL + "/sys/common/pdf/pdfPreviewIframe"
}
window._CONFIG = {};
Object.keys(url).forEach( item => {
    window._CONFIG[item] = url[item]
})