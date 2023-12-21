(window.webpackJsonp=window.webpackJsonp||[]).push([[62],{"./js/services/conversion/checkImportEnvironmentFromUrl.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return l}));var r=o("./js/modules/pipelines/user-action.js"),n=o("./js/utils/util.js"),s=o("./js/utils/PostmanUrlUtils.js"),i=o("./js/modules/controllers/UserController.js");function l(t){t=decodeURIComponent(t);var o,l=s.default.getHashVars(t);e.each(l,(function(t){var s=decodeURIComponent(t.key);if(0==s.indexOf("env[")&&"]"==s[s.length-1])try{var l="";try{l=atob(t.value)}catch(o){if(!e.endsWith(t.value,'"'))throw o;t.value=t.value.substring(0,t.value.length-1),l=atob(t.value)}var a=s.substring(4,s.length-1),c=JSON.parse(l),u=[];if(c instanceof Array){var d=c.length;for(o=0;o<d;o++)u.push(e.assign({type:"text",enabled:!0},c[o]))}else e.forOwn(c,(function(e,t){u.push({key:t,value:e,type:"text",enabled:!0})}));i.default.get().then((e=>{let t={name:"create",namespace:"environment",data:{id:n.default.guid(),name:a,values:u,owner:e.id}};Object(r.default)(t),pm.toasts.success("Environment "+a+" 已导入")})).catch((e=>{pm.logger.error("Error in creating evironment",e)}))}catch(e){console.log("Could not import environment")}}))}}.call(this,o("./node_modules/lodash/lodash.js"))},"./js/services/conversion/importCollectionAndEnvironment.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return l}));var r=o("./js/services/conversion/index.js"),n=o("./js/modules/services/AnalyticsService.js"),s=o("./js/utils/util.js"),i=o("./js/utils/PostmanUrlUtils.js");function l(t){r.default.importFileFromUrl(t,((o,l)=>{if(o)return pm.logger.error(o);r.default.checkImportEnvironmentFromUrl(t);var a=i.default.getUrlVars(t),c=e.find(a,(function(e){return"referrer"===e.key})),u=c?decodeURIComponent(c.value):"";n.default.addEvent("collection","create","run_button",null,{referrer:u,collection_id:l.id,collection_link_id:s.default.getCollectionLinkId(t)})}))}}.call(this,o("./node_modules/lodash/lodash.js"))},"./js/services/conversion/importFileFromUrl.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return a})),o.d(t,"parseUrlData",(function(){return c}));var r=o("./node_modules/lodash/lodash.js"),n=o.n(r),s=o("./js/controllers/Importer.js"),i=(o("./js/utils/util.js"),o("./js/utils/HttpService.js")),l=o("./js/modules/services/RemoteSyncRequestService.js");function a(e,t){i.default.request(e).then((({body:o})=>{try{s.default.importData(o,{origin:"import/link",link:e}).then((()=>{n.a.isFunction(t)&&t(null,o)}))}catch(e){"Could not parse"==e?(pm.mediator.trigger("failedCollectionImport","format not recognized"),n.a.isFunction(t)&&t("format not recognized")):(pm.mediator.trigger("failedCollectionImport","Could not import: "+e),n.a.isFunction(t)&&t("Could not import: "+e))}})).catch((({error:e})=>{console.log("Error response while importing: ",e),pm.mediator.trigger("failedCollectionImport","Error response received from URL. Check the console for more."),n.a.isFunction(t)&&t("Error response received from URL. Check the console for more.")}))}function c(e){return"browser"===window.SDK_PLATFORM?l.default.request("/ws/proxy",{method:"post",data:{path:"/api/v1/download",service:"importer",method:"post",body:{url:e}}}).then((({body:e})=>e)).catch((e=>(pm.logger.warn("Error while parsing url data: ",e),pm.toasts.error("从链接获取数据时出错."),null))):i.default.request(e).then((({body:e})=>e)).catch((({error:e})=>(pm.logger.warn("Error while parsing url data: ",e),pm.toasts.error("从链接获取数据时出错."),null)))}},"./js/services/conversion/importFiles.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return i}));o("./node_modules/lodash/lodash.js");var r=o("./js/controllers/Importer.js"),n=o("./node_modules/async/dist/async.js"),s=o.n(n);function i(e,t,o){s.a.eachSeries(e,((n,s)=>{let i=new FileReader;i.onload=function(n){var i=n.currentTarget.result;if("importByFileContainer"===t&&o&&1===e.length)return o(i,{origin:"import/file"});r.default.importData(i,{origin:"import/file"},s)},i.readAsText(n)}))}},"./js/services/conversion/index.js":function(e,t,o){"use strict";o.r(t),function(e){var r=o("./js/services/conversion/checkImportEnvironmentFromUrl.js"),n=o("./js/services/conversion/importCollectionAndEnvironment.js"),s=o("./js/services/conversion/convertData.js"),i=o("./js/services/conversion/importFileFromUrl.js"),l=o("./js/services/conversion/importFiles.js"),a=o("./js/services/conversion/importFolder.js"),c=o("./js/services/conversion/saveEntity.js"),u=o("./js/services/conversion/importers/index.js"),d=o("./node_modules/async/dist/async.js"),m=o.n(d),p=o("./runtime-repl/runner/RunnerHelper.js"),f=o("./js/services/UIEventService.js"),v=o("./onboarding/src/common/components/InviteMembersNudge/InviteMembersNudgeConstants.js");function j(e,t){e?e.isUserFriendly?pm.toasts.error(e.message,{dedupeId:"failed-collection-import"}):pm.toasts.error("导入失败, 集合 "+t.name,{dedupeId:"failed-collection-import"}):(pm.toasts.success("集合 "+t.name+" 已导入"),setTimeout((()=>{f.default.publish(v.OPEN_INVITE_MEMBERS_NUDGE_EVENT)}),3e3))}t.default={checkImportEnvironmentFromUrl:r.default,importCollectionAndEnvironment:n.default,importData:async function(t,o,r){if(e.isEmpty(t))return e.isFunction(r)&&r();m.a.series([e=>{u.default.importCollections(t.collections,o,j,(t=>{e(null,t)}))},r=>{u.default.importGlobals(t.globals,e.pick(o,["activeWorkspace","silentToasts"]),(e=>{r(null,e)}))},r=>{u.default.importHeaderPresets(t.headerPresets,e.pick(o,["currentUserID","activeWorkspace","silentToasts"]),(e=>{r(null,e)}))},r=>{u.default.importEnvironments(t.environments,e.pick(o,["currentUserID","silentToasts","activeWorkspace"]),(e=>{r(null,e)}))},e=>{u.default.importRequests(t.requests,(t=>{e(null,t)}))},e=>{u.default.importCollectionRuns(t.runsInfo,t.events,o,p.handleCollectionRunImportStatus,(t=>{e(null,t)}))}],((t,o)=>{let n={};e.forEach(e.compact(o),(t=>{n[t.type]=e.pick(t,["total","imported","failed"])})),e.isFunction(r)&&r(n)}))},convertRawData:s.default,importDataAs:s.importDataAs,stringify:s.stringify,importFileFromUrl:i.default,parseUrlData:i.parseUrlData,importFiles:l.default,importFolder:a.default,saveEntity:c.default}}.call(this,o("./node_modules/lodash/lodash.js"))},"./js/services/conversion/saveEntity.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return c}));var r=o("./js/models/services/filesystem.js"),n=o("./js/modules/export/index.js"),s=o("./js/modules/services/AnalyticsService.js"),i=o("./js/services/conversion/export-all.js");const l={json:"application/json"},a="collection";function c(t,o={}){let c,u,d,m=o.type,p=e.get(o,"outputVersion","2.1.0");if(m)return n.default.exportSingle(m,t,o).then((e=>{if(!(e&&l[e.type]&&e[e.type]))throw console.warn("Invalid data or unsupported file type",e),new Error("saveEntity: invalid data received");return e})).then((t=>{c=t,u=l[c.type],d=e.get(c,"meta.fileName",m+".json")})).then((()=>JSON.stringify(c.json,null,"\t"))).then((e=>new Promise(((t,o)=>{Object(r.saveAndOpenFile)(d,e,u,((e,r)=>{if(e)return console.warn("Error while saving the exported entity",e),void o(e);t(r)}))})))).then((e=>{if(e!==i.EXPORT_STATE.SUCCESS)return;let o="browser"!==window.SDK_PLATFORM;switch(m){case a:s.default.addEvent(a,"download",p,null,{collection_id:t.id}),o&&pm.toasts.success("您的集合已成功导出.");break;case"environment":s.default.addEvent(m,"download"),o&&pm.toasts.success("您的环境已成功导出.");break;case"globals":s.default.addEvent(m,"download"),o&&pm.toasts.success("您的全局变量已成功导出.")}})).catch((e=>{pm.toasts.error("无法导出此实体. 请检查开发者工具."),console.warn("Error while exporting an entity",t,o,e)}));console.warn(`Unsupported type '${m}' for exporting`)}}.call(this,o("./node_modules/lodash/lodash.js"))}}]);