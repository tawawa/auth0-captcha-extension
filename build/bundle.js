module.exports=function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}var o=n(15),a=r(o),i=n(9),s=r(i);e.exports=a.default.fromExpress(s.default)},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("boom")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("request")},function(e,t,n){var r,o,a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(a,i,s){"undefined"!=typeof e&&e.exports?e.exports=s():(r=s,o="function"==typeof r?r.call(t,n,t,e):r,!(void 0!==o&&(e.exports=o)))}("urljoin",void 0,function(){function e(e,t){return e=e.replace(/:\//g,"://"),e=e.replace(/([^:\s])\/+/g,"$1/"),e=e.replace(/\/(\?|&|#[^!])/g,"$1"),e=e.replace(/(\?.+)\?/g,"$1&")}return function(){var t=arguments,n={};"object"===a(arguments[0])&&(t=arguments[0],n=arguments[1]||{});var r=[].slice.call(t,0).join("/");return e(r,n)}})},function(e,t){e.exports=require("auth0@2.1.0")},function(e,t){e.exports=require("body-parser")},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e){return function(t,n,r){if(console.log("Request validator"),t.headers.authorization&&"Bearer"===t.headers.authorization.split(" ")[0]){var o=t.headers.authorization.split(" ")[1],a=y.default.verify(o,t.webtaskContext.data.EXTENSION_SECRET,{audience:(0,g.default)(t.webtaskContext.data.WT_URL,e),issuer:"https://"+t.webtaskContext.data.AUTH0_DOMAIN});return a?r():n.sendStatus(401)}return n.sendStatus(401)}}function a(e,t){var n=e.webtaskContext.data,r=n.AUTH0_DOMAIN,o="https://"+r+"/oauth/token",a="https://"+r+"/api/v2/",i=n.AUTH0_CLIENT_SECRET,s=n.AUTH0_CLIENT_ID;return new Promise(function(e,t){c.default.post(o,{body:{audience:a,grant_type:"client_credentials",client_id:s,client_secret:i},json:!0}).end(function(e,t,n){return e?reject(e):void resolve(n.access_token)})})}Object.defineProperty(t,"__esModule",{value:!0});var i=n(3),s=r(i),u=n(4),c=r(u),l=n(6),d=r(l),f=n(27),p=r(f),h=n(1),y=r(h),m=n(5),g=r(m),v=n(17),b=r(v),x=d.default.ManagementClient,_=s.default.Router();t.default=_,_.use("/on-install",o("/.extensions/on-install")),_.use("/on-uninstall",o("/.extensions/on-uninstall")),_.use("/on-update",o("/.extensions/on-update")),_.use(function(e,t,n){a(e).then(function(t){var r=new x({domain:e.webtaskContext.data.AUTH0_DOMAIN,token:t});e.auth0=r,n()}).catch(n)}),_.post("/on-install",function(e,t){var n=e.webtaskContext.data;e.auth0.rules.create({name:"captcha-rule-PLEASE-DO-NOT-RENAME",script:(0,b.default)({MAX_ALLOWED_FAILED_ATTEMPTS:n.MAX_ALLOWED_FAILED_ATTEMPTS}),order:2,enabled:!0,stage:"login_success"}).then(function(){t.sendStatus(204)}).catch(function(){t.sendStatus(500)})}),_.put("/on-update",function(e,t){t.sendStatus(204)}),_.delete("/on-uninstall",function(e,t){e.auth0.rules.getAll().then(function(n){var r=p.default.find(n,{name:"captcha-rule-PLEASE-DO-NOT-RENAME"});r&&e.auth0.rules.delete({id:r.id}).then(function(){t.sendStatus(204)}).catch(function(){t.sendStatus(500)})}).catch(function(){t.sendStatus(500)})})},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(3),a=r(o),i=n(14),s=(r(i),n(12)),u=(r(s),n(16)),c=r(u),l=(0,a.default)();l.use("/.extensions",n(8)),l.use(c.default),t.default=l},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t,n,r,o){return new Promise(function(r,o){var a={captchaOk:null===e,sub:n,errorMessage:e},s={expiresInMinutes:2,audience:getRuleUri(req),issuer:getWtUri(req)};i.default.sign(a,t,s,function(e,t){return e?o(e):void r(t)})})}Object.defineProperty(t,"__esModule",{value:!0}),t.default=o;var a=n(1),i=r(a)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t,n){return new Promise(function(r,o){function a(e,t,n){e&&reject(e),200!==t.statusCode&&reject("Error validating captcha: "+t.statusCode);var r=JSON.parse(n);r.success?o(!0):reject("Error from reCaptcha: "+JSON.stringify(r))}r.post({url:"https://www.google.com/recaptcha/api/siteverify",form:{response:e,secret:t,remoteip:n}},a)})}Object.defineProperty(t,"__esModule",{value:!0}),t.default=o;var a=n(4);r(a)},function(e,t,n){"use strict";function r(e){return e&&"[object Function]"==y.call(e)}function o(e){return function(t,n,r){h.get(e+"/userinfo").set("Authorization","Bearer "+t.body.access_token).end(function(e,o){return e?void n.redirect(n.locals.baseUrl):(t.userInfo=o.body,void r())})}}function a(e,t){return function(n,o,a){var i=e;r(e)&&(i=e(n)),n.apiToken=p.sign(n.userInfo,i,{algorithm:"HS256",issuer:o.locals.baseUrl,expiresIn:t}),delete n.userinfo,a()}}function i(e,t){var n=["html","  head","    script.","      window.location.href = '#{returnTo}';","  body"].join("\n"),r=u.compile(n)({returnTo:e.query&&e.query.returnTo?e.query.returnTo:t.locals.baseUrl});return r}var s=n(3),u=n(23),c=n(21),l=n(26),d=n(19),f=n(7),p=n(1),h=n(25),y={}.toString;e.exports=function(e){var t=864e5,r=s.Router(),h=function(e,t,n){n()},y=[h];return e=e||{},e.clientName=e.clientName||"Auth0 Extension",e.clientId=e.clientId,e.exp=e.exp||t,e.experimental=e.experimental||!1,e.credentialsRequired="undefined"!=typeof e.credentialsRequired&&e.credentialsRequired,e.scopes=e.scopes+" openid profile",e.responseType=e.responseType||"token",e.tokenExpiresIn=e.tokenExpiresIn||"10h",e.rootTenantAuthority=e.rootTenantAuthority||"https://auth0.auth0.com",e.authenticatedCallback=e.authenticatedCallback||function(e,t,n,r){r()},e.apiToken&&!e.apiToken.secret&&(console.log('You are using a "development secret" for API token generation. Please setup your secret on "apiToken.secret".'),e.apiToken.secret=n(20).randomBytes(32).toString("hex")),e.apiToken&&e.apiToken.secret&&(y=[o(e.rootTenantAuthority),e.apiToken.payload||h,a(e.apiToken.secret,e.tokenExpiresIn)]),r.use(function(t,n,r){var o="https",a=l.parse(t.originalUrl).pathname.replace(t.path,"");"development"===(process.env.NODE_ENV||"development")&&(o=t.protocol,e.clientId=e.clientId||"N3PAwyqXomhNu6IWivtsa3drBfFjmWJL"),n.locals.baseUrl=l.format({protocol:o,host:t.get("host"),pathname:a}),r()}),r.use(f.urlencoded({extended:!1})),r.use(c({secret:d(),algorithms:["RS256"],credentialsRequired:e.credentialsRequired}).unless({path:["/login","/callback"]})),r.get("/login",function(t,n){var r=n.locals.baseUrl+"/callback";t.query.returnTo&&(r+="?returnTo="+encodeURIComponent(t.query.returnTo));var o;if("string"==typeof e.audience)o="&audience="+encodeURIComponent(e.audience);else if("function"==typeof e.audience){var a=e.audience(t);"string"==typeof a&&(o="&audience="+encodeURIComponent(a))}var i=[e.rootTenantAuthority+(e.experimental?"/authorize":"/i/oauth2/authorize"),"?client_id="+(e.clientId||n.locals.baseUrl),"&response_type="+e.responseType,"&response_mode=form_post","&scope="+encodeURIComponent(e.scopes),"&expiration="+e.exp,"&redirect_uri="+r,o].join("");n.redirect(i)}),r.get("/logout",function(t,n){var r=["html","  head","    script.","      sessionStorage.removeItem('token')","      sessionStorage.removeItem('apiToken')","      window.location.href = '"+e.rootTenantAuthority+"/v2/logout?returnTo=#{baseUrl}&client_id=#{baseUrl}';","  body"].join("\n"),o=u.compile(r)({baseUrl:n.locals.baseUrl});n.header("Content-Type","text/html"),n.status(200).send(o)}),r.post("/callback",y,function(t,n){var r=t.body.access_token,o=p.decode(r,{complete:!0})||{};d()(t,o.header,o.payload,function(o,a){if(o)return n.status(200).send(i(n,n));try{var s,c=p.verify(r,a,{algorithms:["RS256"]}),l=c.aud;if("string"==typeof e.audience)s=e.audience;else if("function"==typeof e.audience){var d=e.audience(t);"string"==typeof d&&(s=d)}if(l===s||l.indexOf(s)===-1)return n.header("Content-Type","text/html"),n.status(200).send(i(t,n))}catch(e){return n.status(200).send(i(n,n))}e.authenticatedCallback(t,n,t.body.access_token,function(e){if(e)return n.sendStatus(500);var r=["html","  head","    script.","      sessionStorage.setItem('token', '"+t.body.access_token+"');",1===y.length?"":"      sessionStorage.setItem('apiToken', '"+t.apiToken+"');","      window.location.href = '#{returnTo}';","  body"].join("\n"),o=u.compile(r)({returnTo:t.query.returnTo?t.query.returnTo:n.locals.baseUrl});n.header("Content-Type","text/html"),n.status(200).send(o)})})}),r.get("/.well-known/oauth2-client-configuration",function(t,n){n.header("Content-Type","application/json"),n.status(200).send({redirect_uris:[n.locals.baseUrl+"/callback"],client_name:e.clientName,post_logout_redirect_uris:[n.locals.baseUrl]})}),r}},function(e,t,n){"use strict";function r(e){return null!=e&&""!==e}function o(e){return(Array.isArray(e)?e.map(o):e&&"object"===("undefined"==typeof e?"undefined":a(e))?Object.keys(e).filter(function(t){return e[t]}):[e]).filter(r).join(" ")}var a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.merge=function e(t,n){if(1===arguments.length){for(var o=t[0],a=1;a<t.length;a++)o=e(o,t[a]);return o}var i=t.class,s=n.class;(i||s)&&(i=i||[],s=s||[],Array.isArray(i)||(i=[i]),Array.isArray(s)||(s=[s]),t.class=i.concat(s).filter(r));for(var u in n)"class"!=u&&(t[u]=n[u]);return t},t.joinClasses=o,t.cls=function(e,n){for(var r=[],a=0;a<e.length;a++)n&&n[a]?r.push(t.escape(o([e[a]]))):r.push(o(e[a]));var i=o(r);return i.length?' class="'+i+'"':""},t.style=function(e){return e&&"object"===("undefined"==typeof e?"undefined":a(e))?Object.keys(e).map(function(t){return t+":"+e[t]}).join(";"):e},t.attr=function(e,n,r,o){return"style"===e&&(n=t.style(n)),"boolean"==typeof n||null==n?n?" "+(o?e:e+'="'+e+'"'):"":0==e.indexOf("data")&&"string"!=typeof n?(JSON.stringify(n).indexOf("&")!==-1&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),n&&"function"==typeof n.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+e+"='"+JSON.stringify(n).replace(/'/g,"&apos;")+"'"):r?(n&&"function"==typeof n.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+e+'="'+t.escape(n)+'"'):(n&&"function"==typeof n.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+e+'="'+n+'"')},t.attrs=function(e,n){var r=[],a=Object.keys(e);if(a.length)for(var i=0;i<a.length;++i){var s=a[i],u=e[s];"class"==s?(u=o(u))&&r.push(" "+s+'="'+u+'"'):r.push(t.attr(s,u,!1,n))}return r.join("")},t.escape=function(e){var t=String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return t===""+e?e:t},t.rethrow=function e(t,r,o,a){if(!(t instanceof Error))throw t;if(!("undefined"==typeof window&&r||a))throw t.message+=" on line "+o,t;try{a=a||n(22).readFileSync(r,"utf8")}catch(n){e(t,null,o)}var i=3,s=a.split("\n"),u=Math.max(o-i,0),c=Math.min(s.length,o+i),i=s.slice(u,c).map(function(e,t){var n=t+u+1;return(n==o?"  > ":"    ")+n+"| "+e}).join("\n");throw t.path=r,t.message=(r||"Jade")+":"+o+"\n"+i+"\n\n"+t.message,t},t.DebugItem=function(e,t){this.lineno=e,this.filename=t}},function(e,t){"use strict";e.exports={title:"Captcha Extension",name:"captcha-extension",version:"0.1.0",author:"abhishek.hingikar@auth0.com",description:"An extension that uses Google's ReCaptcha",type:"application",keywords:["auth0"],auth0:{createClient:!0,scopes:"create:rules read:rules delete:rules",onInstallPath:"/.extensions/on-install",onUninstallPath:"/.extensions/on-uninstall",onUpdatePath:"/.extensions/on-update"}}},function(e,t,n){"use strict";function r(e){return function(t,n,r){var o=i(n.x_wt.jtn);return n.originalUrl=n.url,n.url=n.url.replace(o,"/"),n.webtaskContext=s(t),e(n,r)}}function o(e){var t;return e.ext("onRequest",function(e,n){var r=i(e.x_wt.jtn);e.setUrl(e.url.replace(r,"/")),e.webtaskContext=t}),function(n,r,o){var a=e._dispatch();t=s(n),a(r,o)}}function a(e){return function(t,n,r){var o=i(n.x_wt.jtn);return n.originalUrl=n.url,n.url=n.url.replace(o,"/"),n.webtaskContext=s(t),e.emit("request",n,r)}}function i(e){var t="^/api/run/[^/]+/",n="(?:[^/?#]*/?)?";return new RegExp(t+(e?n:""))}function s(e){function t(e,t,r){var o=n(2);"function"==typeof t&&(r=t,t={}),r(o.preconditionFailed("Storage is not available in this context"))}function r(t,r,o){var a=n(2),i=n(4);"function"==typeof r&&(o=r,r={}),i({uri:e.secrets.EXT_STORAGE_URL,method:"GET",headers:r.headers||{},qs:{path:t},json:!0},function(e,t,n){return e?o(a.wrap(e,502)):404===t.statusCode&&Object.hasOwnProperty.call(r,"defaultValue")?o(null,r.defaultValue):t.statusCode>=400?o(a.create(t.statusCode,n&&n.message)):void o(null,n)})}function o(e,t,r,o){var a=n(2);"function"==typeof r&&(o=r,r={}),o(a.preconditionFailed("Storage is not available in this context"))}function a(t,r,o,a){var i=n(2),s=n(4);"function"==typeof o&&(a=o,o={}),s({uri:e.secrets.EXT_STORAGE_URL,method:"PUT",headers:o.headers||{},qs:{path:t},body:r},function(e,t,n){return e?a(i.wrap(e,502)):t.statusCode>=400?a(i.create(t.statusCode,n&&n.message)):void a(null)})}return e.read=e.secrets.EXT_STORAGE_URL?r:t,e.write=e.secrets.EXT_STORAGE_URL?a:o,e}t.fromConnect=t.fromExpress=r,t.fromHapi=o,t.fromServer=t.fromRestify=a},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(3),a=r(o),i=n(1),s=r(i),u=n(5),c=r(u),l=n(18),d=r(l),f=n(7),p=r(f),h=n(24),y=(r(h),n(11)),m=r(y),g=n(10),v=r(g),b=a.default.Router();b.use(function(e,t,n){var r=e.query.token||e.body.token,o=e.query.state||e.body.state,a=e.webtaskContext.data,i=a.EXTENSION_SECRET,u=a.AUTH0_DOMAIN,l=(0,c.default)(u,"captcha/rule"),d=(0,c.default)(u,"captcha/webtask");s.default.verify(r,i,{issuer:l,audience:d},function(a,s){return a?(0,v.default)("Invalid token: "+a.message,i,null,l,d).then(function(n){t.redirect(e.webtaskContext.data.AUTH0_DOMAIN+"/continue?state="+e.query.state+"&token="+n)}):(e.state=o,e.token=r,e.payload=s,void n())})}),b.use(p.default.urlencoded()),b.get("/",function(e,t){t.header("Content-Type","text/html"),t.status(200).send((0,d.default)(Object.assign({token:e.token,target:e.path},e.payload)))}),b.post("/",function(e,t){var n=e.ip,r=n.ip,o=n.state,a=n.payload,i=e.webtaskContext.data,s=i.EXTENSION_SECRET,u=i.AUTH0_DOMAIN,l=e.body["g-recaptcha-response"],d=(0,c.default)(u,"captcha/rule"),f=(0,c.default)(u,"captcha/webtask");(0,m.default)(l,s,r).then(function(){return(0,v.default)(null,secret,a,d,f)},function(e){return(0,v.default)(e.message,secret,a,d,f)}).then(function(e){t.redirect(u+"/continue?state="+o+"&token="+e)})}),t.default=b},function(e,t,n){"use strict";function r(e){var t=function(e,t,r){function o(n,o){if(o||n.length>MAX_ALLOWED_FAILED_ATTEMPTS){var s=i.sign({sub:e.user_id,clientName:t.clientName},a,{expiresInMinutes:5,audience:wtUri,issuer:ruleUri}),u=auth0.domain.replace(".auth0.com","")+".webtask.io/captcha",c=u.indexOf("?")!==-1?"&":"?";t.redirect={url:u+c+"token="+s+"&webtask_no_cache=1"}}return r(null,e,t)}var a=configuration.CAPTCHA_SECRET,i=n(1);if("redirect-callback"===t.protocol){var s=function(n,o){return n?r(new UnauthorizedError("Error validating token from wt: "+n)):o.sub!==e.user_id?r(new UnauthorizedError("Token does not match the current user.")):o.captchaOk?r(null,e,t):r(new UnauthorizedError("Captcha validation was not successful.\n"+o.errorMessage||""))};return i.verify(t.request.query.token,a,{audience:ruleUri,issuer:wtUri},s)}if(MAX_ALLOWED_FAILED_ATTEMPTS){var u=n(6).ManagementClient(auth0.accessToken);u.logs.getAll({q:"date: ["+(e.last_login||"*")+' to \'*\'] AND type: ("f" OR "fp" OR "fu") AND user_id: "'+req.user_id+'"'}).then(o).catch(function(){return r(new Error("There was an error completing login, please try again later"))})}else o([],!0)}.toString();Object.keys(e).forEach(function(n){var r=new RegExp(n,"g");t=t.replace(r,"JSON.parse("+JSON.stringify(e[n])+")")})}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r},function(e,t,n){var r=n(13);e.exports=function(e){var t=[],n=e||{};return function(e,n,o,a){t.push('<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><style type="text/css">html {\nfont-family: sans-serif;\n-webkit-text-size-adjust: 100%;\n-ms-text-size-adjust: 100%;\n}\nbody { margin: 0; }\n.container { padding-right: 15px; padding-left: 15px;margin-right: auto; margin-left: auto; }\nh1 { margin: .67em 0; font-size: 2em; font-family: inherit; font-weight: 500; line-height: 1.1; color: inherit; }</style><title>Confirm you are human</title><!-- Latest compiled and minified CSS--><script src="https://www.google.com/recaptcha/api.js"></script></head><body><script type="text/javascript">var submitform = function() {\n  document.getElementById("captchaform").submit();\n};</script><div class="container"><form id="captchaform"'+r.attr("action",o,!0,!0)+' method="POST" class="form-signin"><h1>title</h1><p>message</p><input type="hidden"'+r.attr("value",n,!0,!0)+' name="state"><input type="hidden"'+r.attr("value",a,!0,!0)+' name="token"><div'+r.attr("data-sitekey",e,!0,!0)+' data-callback="submitform" class="g-recaptcha"></div></form></div></body></html>')}.call(this,"siteKey"in n?n.siteKey:"undefined"!=typeof siteKey?siteKey:void 0,"state"in n?n.state:"undefined"!=typeof state?state:void 0,"target"in n?n.target:"undefined"!=typeof target?target:void 0,"token"in n?n.token:"undefined"!=typeof token?token:void 0),t.join("")}},function(e,t){e.exports=require("auth0-api-jwt-rsa-validation")},function(e,t){e.exports=require("crypto")},function(e,t){e.exports=require("express-jwt")},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("jade")},function(e,t){e.exports=require("request-promise")},function(e,t){e.exports=require("superagent")},function(e,t){e.exports=require("url")},function(e,t){e.exports=require(void 0)}]);