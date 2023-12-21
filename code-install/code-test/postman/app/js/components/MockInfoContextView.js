(window.webpackJsonp=window.webpackJsonp||[]).push([[63],{"./mocks/components/MockInfoContextView.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return I}));var n,i=o("../../node_modules/react/index.js"),s=o.n(i),a=o("../../node_modules/@postman/aether/esmLib/index.js"),c=o("./node_modules/moment/moment.js"),r=o.n(c),l=o("./node_modules/classnames/index.js"),d=o.n(l),m=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),h=o("../../node_modules/mobx/lib/mobx.module.js"),p=o("./js/components/activity-feed/ActivityItemComponents.js"),u=o("./appsdk/contextbar/ContextBarViewHeader.js"),_=o("./js/utils/ClipboardHelper.js"),v=o("./js/components/base/Buttons.js"),f=o("./js/components/base/Avatar.js"),y=o("./js/components/base/Tooltips.js"),b=o("./js/services/NavigationService.js"),g=o("./version-control/common/ForkLabel.js"),C=o("./js/components/base/LoadingIndicator.js"),k=o("./mocks/services/CollectionService.js"),j=o("./js/modules/services/APIService.js"),E=o("./js/stores/get-store.js"),x=o("./mocks/components/MockOffline.js"),w=o("./js/modules/services/AnalyticsService.js"),S=o("./report/embeddable/components/EmbeddedReport.js");let I=Object(m.observer)(n=class extends i.Component{constructor(e){super(e),this.state={idCopySuccess:!1,urlCopySuccess:!1,isUserTooltipVisible:!1,collection:null,fetchingCollection:!0,errorFetchingCollection:!1,isOffline:!1},this.tooltipRef=s.a.createRef(),this.handleCopyId=this.handleCopyId.bind(this),this.handleCopyUrl=this.handleCopyUrl.bind(this),this.handleCollectionClick=this.handleCollectionClick.bind(this),this.handleEnvironmentClick=this.handleEnvironmentClick.bind(this),this.getUserIcon=this.getUserIcon.bind(this),this.getUserName=this.getUserName.bind(this),this.showUserTooltip=this.showUserTooltip.bind(this),this.hideUserTooltip=this.hideUserTooltip.bind(this),this.fetchCollection=this.fetchCollection.bind(this),this.handleRequestAccess=this.handleRequestAccess.bind(this)}componentDidMount(){this.syncStatusStoreReactionDisposer=Object(h.reaction)((()=>Object(E.getStore)("SyncStatusStore").isSocketConnected),(e=>{!e&&(this.state.fetchingCollection||this.state.errorFetchingCollection)&&this.setState({isOffline:!0}),e&&this.setState({isOffline:!1},(()=>{this.fetchCollection()}))}),{fireImmediately:!0})}componentWillUnmount(){clearTimeout(this.clearIdCopySuccessTimeout),clearTimeout(this.clearUrlCopySuccessTimeout),this.syncStatusStoreReactionDisposer&&this.syncStatusStoreReactionDisposer()}fetchCollection(){const t=Object(h.toJS)(e.get(this.props,"contextData.collection"));e.get(this.props,"contextData.active")&&!1!==e.get(t,"_isAccessible")?(this.setState({fetchingCollection:!0,errorFetchingCollection:!1}),Object(k.fetchCollection)(e.get(this.props,"contextData.collection.id")).then((e=>{this.setState({collection:e,fetchingCollection:!1,errorFetchingCollection:!1})})).catch((e=>{this.setState({collection:null,fetchingCollection:!1,errorFetchingCollection:!0})}))):this.setState({fetchingCollection:!1,errorFetchingCollection:!1})}handleCopyId(){this.state.idCopySuccess||(_.default.copy(e.get(this.props,"contextData.id","")),this.setState({idCopySuccess:!0},(()=>{this.clearIdCopySuccessTimeout=setTimeout((()=>this.setState({idCopySuccess:!1})),3e3)})))}handleCopyUrl(){this.state.urlCopySuccess||(_.default.copy(e.get(this.props,"contextData.url","")),w.default.addEventV2({category:"mock",action:"copy_url",label:"mock_info_context_bar",entityId:e.get(this.props,"contextData.id"),traceId:e.get(this.props,"contextData.traceId")}),this.setState({urlCopySuccess:!0},(()=>{this.clearUrlCopySuccessTimeout=setTimeout((()=>this.setState({urlCopySuccess:!1})),3e3)})))}handleCollectionClick(){const t=e.get(this.props,"contextData.collection.id","");w.default.addEventV2({category:"mock",action:"view_collection",label:"mock_info_context_bar",entityId:e.get(this.props,"contextData.id"),traceId:e.get(this.props,"contextData.traceId")}),b.default.transitionTo("collection.openWithWsSelect",{cid:t})}handleEnvironmentClick(){const t=e.get(this.props,"contextData.environment.id","");w.default.addEventV2({category:"mock",action:"view_environment",label:"mock_info_context_bar",entityId:e.get(this.props,"contextData.id"),traceId:e.get(this.props,"contextData.traceId")}),b.default.transitionTo("environment.openWithWsSelect",{eid:t})}handleRequestAccess(t,o,n){w.default.addEventV2({category:"mock",action:"initiate_request_access_"+t,label:"mock_info_context_bar",entityId:e.get(this.props,"contextData.id"),traceId:e.get(this.props,"contextData.traceId")}),Object(j.openAuthenticatedRoute)(`${pm.dashboardUrl}/request-access?entityType=${t}&entityId=${o}&type=${n}`)}getIcon(e){return e?s.a.createElement(a.Icon,{name:"icon-state-success-stroke",className:"mock-info-context-view__entity__content__button__success"}):s.a.createElement(a.Icon,{name:"icon-action-copy-stroke",className:"mock-info-context-view__entity__content__button__copy"})}getUserIcon(e={}){return e.isAccessible?s.a.createElement(p.ProfilePic,{id:e.id}):s.a.createElement(f.default,{size:"small",userId:e.id,customPic:e.profilePicUrl})}getUserName(e={}){return e.isAccessible?s.a.createElement(p.User,{id:e.id,name:e.name||e.username}):s.a.createElement(i.Fragment,null,s.a.createElement("span",{className:"activity-item-user",ref:this.tooltipRef,onMouseEnter:this.showUserTooltip,onMouseLeave:this.hideUserTooltip},e.name),this.tooltipRef.current&&!e.isPublic&&s.a.createElement(y.Tooltip,{immediate:!0,show:this.state.isUserTooltipVisible,target:this.tooltipRef.current,placement:"bottom"},s.a.createElement(y.TooltipBody,null,"此用户资料是私有的.")))}showUserTooltip(){this.setState({isUserTooltipVisible:!0})}hideUserTooltip(){this.setState({isUserTooltipVisible:!1})}render(){const t=e.get(this.props,"contextData",{}),o=r()(t.createdAt).format("DD MMM YYYY, h:mm A");return!this.state.isOffline&&this.state.fetchingCollection?s.a.createElement("div",{className:"mock-info-context-view-loading"},s.a.createElement(C.default,null)):s.a.createElement("div",{className:"mock-info-context-view-wrapper"},s.a.createElement(u.ContextBarViewHeader,{title:this.props.title,onClose:this.props.onClose}),this.state.isOffline&&s.a.createElement(x.default,{origin:"context-bar"}),!this.state.isOffline&&this.state.errorFetchingCollection&&s.a.createElement("div",{className:"mock-info-context-view__error__wrapper"},s.a.createElement("div",{className:"mock-info-context-view__error"},s.a.createElement(a.IllustrationInternalServerError,null),s.a.createElement("div",{className:"mock-info-context-view__error__content"},s.a.createElement("div",{className:"mock-info-context-view__error__content__header"},"出了些问题"),s.a.createElement("div",{className:"mock-info-context-view__error__content__sub-header"},"发生意外错误. 请再试一次.")),s.a.createElement(v.Button,{className:"btn-small mock-info-context-view__error__retry-button",type:"primary",onClick:this.fetchCollection},"再试一次"))),!(this.state.isOffline||this.state.errorFetchingCollection)&&s.a.createElement("div",{className:"mock-info-context-view"},s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"ID"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},s.a.createElement("div",{className:"mock-info-context-view__entity__content__id",title:t.id},t.id),s.a.createElement(v.Button,{className:"mock-info-context-view__entity__content__button",tooltip:this.state.idCopySuccess?"已拷贝":"拷贝模拟 ID",type:"icon",onClick:this.handleCopyId},this.getIcon(this.state.idCopySuccess)))),s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"创建者"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},t.createdBy&&this.getUserIcon(t.createdBy),t.createdBy&&this.getUserName(t.createdBy))),s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"创建于"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},o)),s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"模拟服务器URL"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},s.a.createElement("div",{className:"mock-info-context-view__entity__content__url",title:t.url},t.url),s.a.createElement(v.Button,{className:"mock-info-context-view__entity__content__button",tooltip:this.state.urlCopySuccess?"已拷贝":"拷贝模拟 URL",type:"icon",onClick:this.handleCopyUrl},this.getIcon(this.state.urlCopySuccess)))),s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"集合"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},e.get(t,"collection._isDeleted")?s.a.createElement("div",null,"关联的集合已被删除"):!1===e.get(t,"collection._isAccessible")&&s.a.createElement("div",null,"集合无法访问",s.a.createElement("div",{className:"mock-info-context-view__entity__content__request-access",onClick:()=>this.handleRequestAccess("collection",e.get(t,"collection.id"),"share_entity")},"请求访问")),!e.get(t,"collection._isDeleted")&&e.get(t,"collection._isAccessible")&&s.a.createElement("div",{className:"mock-info-context-view__entity__content__collection",title:e.get(t,"collection.name"),onClick:this.handleCollectionClick},e.get(t,"collection.name")),e.get(this.state,"collection.meta.forkedFrom")&&s.a.createElement("div",{className:"mock-info-context-view__entity__content__collection-fork-label"},s.a.createElement(g.default,{baseEntity:{id:e.get(this.state,"collection.meta.forkedFrom.id"),name:e.get(this.state,"collection.meta.forkedFrom.name"),model:"collection"},forkedEntity:{forkLabel:e.get(this.state,"collection.meta.forkedFrom.forkName")},label:e.get(this.state,"collection.meta.forkedFrom.forkName"),size:"large"})),!e.get(t,"collection._isDeleted")&&e.get(t,"collection._isAccessible")&&s.a.createElement("div",{title:e.get(t,"collection.versionName"),className:d()({"mock-info-context-view__entity__content__collection-version-tag":!0,"mock-info-context-view__entity__content__collection-version-tag__current":e.isEqual(e.get(t,"collection.versionTag"),"latest")})},e.get(t,"collection.versionName")))),s.a.createElement("div",{className:"mock-info-context-view__entity"},s.a.createElement("div",{className:"mock-info-context-view__entity__label"},"环境"),s.a.createElement("div",{className:"mock-info-context-view__entity__content"},e.get(t.environment,"name")?s.a.createElement("div",{className:"mock-info-context-view__entity__content__environment",title:e.get(t,"environment.name"),onClick:this.handleEnvironmentClick},e.get(t,"environment.name")):s.a.createElement("div",{className:"mock-info-context-view__entity__content__environment-empty"},e.get(t,"environment._isDeleted")&&"关联的环境已被删除",!1===e.get(t,"environment._isAccessible")&&s.a.createElement("div",null,"环境无法访问",s.a.createElement("div",{className:"mock-info-context-view__entity__content__request-access",onClick:()=>this.handleRequestAccess("environment",e.get(t,"environment.id"),"share_entity")},"请求访问")),!e.get(t,"environment")&&"没有环境"))),s.a.createElement(S.default,{entityId:this.props.contextData.id,reportId:"mockUsage"})))}})||n}.call(this,o("./node_modules/lodash/lodash.js"))},"./mocks/services/CollectionService.js":function(e,t,o){"use strict";o.r(t),o.d(t,"fetchCollection",(function(){return i}));var n=o("./js/modules/services/RemoteSyncRequestService.js");function i(e){return e?n.default.request(`/collection/${e}`,{method:"get"}).then((({body:e})=>Promise.resolve(e))).catch((({error:e})=>Promise.reject(e))):Promise.reject(new Error("CollectionService~fetchCollection: id not provided"))}},"./report/embeddable/components/EmbeddedReport.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return u}));var n=o("../../node_modules/react/index.js"),i=o.n(n),s=o("./report/embeddable/components/charts/AreaChart.js"),a=o("./report/embeddable/services/EmbeddedReportingService.js"),c=o("./node_modules/uuid/index.js"),r=o.n(c),l=o("./js/modules/services/AnalyticsService.js"),d=o("./js/utils/util.js"),m=o("./js/stores/get-store.js");function h(){return h=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},h.apply(this,arguments)}const p={mockUsage:{metric:"hits",title:"模拟使用情况",service:a.default.mockUsage,ChartComponent:s.default,valueKey:"mockUsage",analyticsData:{entityType:"mock"}},monitorUsage:{metric:"hits",title:"监视器使用情况",service:a.default.monitorUsage,ChartComponent:s.default,valueKey:"monitorUsage",analyticsData:{entityType:"monitor",entityId:d.default.getTeamId(Object(m.getStore)("CurrentUserStore"))}}};function u({reportId:t,entityId:o}){let[s,a]=Object(n.useState)([]),[c,d]=Object(n.useState)(!0),[m,u]=Object(n.useState)(!1),[_,v]=Object(n.useState)(!1),[f]=Object(n.useState)(r.a.v4()),y=Object(n.useRef)(!1),b=Object(n.useRef)(),g=function(e){const[t,o]=Object(n.useState)(!1),i=new IntersectionObserver((([e])=>o(e.isIntersecting)));return Object(n.useEffect)((()=>(i.observe(e.current),()=>{i.disconnect()})),[e]),t}(b);const C=e.get(p,t);return Object(n.useEffect)((()=>(y.current=!0,()=>{y.current=!1})),[]),Object(n.useEffect)((()=>{y.current&&C&&C.service(f,o).then((t=>{if(y.current){const o=t.body.data.map((t=>({timestamp:t.timestamp,value:e.get(t.values,C.valueKey)})));a(o),d(!1)}})).catch((e=>{u(!0),d(!1),pm.logger.error("EmbeddedReports",t,e)}))}),[t,o]),Object(n.useEffect)((()=>{c||!g||_||(l.default.addEventV2AndPublish(h({category:"embedded-reports",label:t,action:"view",value:1,entityType:"mock",entityId:o,traceId:f},e.get(C,"analyticsData",{}))),v(!0))}),[g,c]),C?i.a.createElement("div",{ref:b},C&&i.a.createElement(C.ChartComponent,{loading:c,error:m,data:s,metric:C.metric,title:C.title})):(pm.logger.error("EmbeddedReports:","______",t,"is not available yet"),null)}}.call(this,o("./node_modules/lodash/lodash.js"))},"./report/embeddable/components/charts/AreaChart.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return m}));var n=o("../../node_modules/react/index.js"),i=o.n(n),s=o("./node_modules/moment/moment.js"),a=o.n(s),c=o("./js/components/base/LoadingIndicator.js");function r(){return r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},r.apply(this,arguments)}class l extends n.Component{constructor(e){super(e),this.chartRef=i.a.createRef(),this.handleGraphClick=this.handleGraphClick.bind(this),this.initializeChart=this.initializeChart.bind(this)}componentDidMount(){this.initializeChart()}componentWillUnmount(){this.chart&&this.chart.destroy()}handleGraphClick(e,t){const o=t[0];o&&this.props.onDataPointClick(o._index)}initializeChart(){if(!this.props.chartJs)return;const e=this.chartRef.current.getContext("2d"),t=Object.assign([],this.props.values),o=Object.assign([],this.props.labels),n=this.props.chartJs;this.chart&&this.chart.destroy(),this.chart=new n.default(e,{type:"line",data:{labels:o,datasets:[{data:t,backgroundColor:"rgba(242, 107, 58, 0.1)",borderColor:"#FF6C37"}]},options:{events:["mousemove","mouseout"],hover:{mode:"nearest",onHover:this.props.onHover,intersect:!1},legend:!1,tooltips:{displayColors:!1,cornerRadius:3,titleFontFamily:"Inter",titleFontSize:12,bodyFontFamily:"Inter",bodyFontSize:12,xPadding:8,yPadding:8,mode:"nearest"},scales:{yAxes:[{type:"linear",ticks:r({fontSize:10,fontFamily:"Inter",maxTicksLimit:5,stepSize:1,padding:4,beginAtZero:!0},this.props.yLabelCallback?{callback:this.props.yLabelCallback}:{})}],xAxes:[{type:"time",time:{parser:"YYYY-MM-DD HH:mm:ss",tooltipFormat:"ll",minUnit:"day",displayFormats:{millisecond:"D MMM",second:"D MMM",minute:"D MMM",hour:"D MMM",day:"D MMM",week:"ll",month:"MMM YYYY",quarter:"[Q]Q - YYYY",year:"YYYY"}},gridLines:{display:!1,drawBorder:!1},ticks:{fontSize:10,fontFamily:"Inter"}}]}}})}render(){return this.props.error?"加载图表时出错. 请重新加载页面.":this.props.chartJs?i.a.createElement("canvas",{height:"150px",ref:this.chartRef}):"我们无法加载此报告. 请刷新页面重试."}}function d(t){let o=t.data.map((e=>e.timestamp)),s=t.data.map((e=>e.value)),[r,d]=Object(n.useState)();if(Object(n.useEffect)((()=>{d(`${e.last(s)||0} ${t.metric} on ${a()(e.last(o),"YYYY-MM-DD").format("MMM DD")}`)}),[t.data]),t.loading)return i.a.createElement("div",{className:"embeddable-report-graph-card__loader"},i.a.createElement(c.default,null));if(t.error)return i.a.createElement("div",{className:"embeddable-report-graph-card__empty"},i.a.createElement("h5",{className:"pm-h5 embeddable-report-graph-card__empty__title"},"报告未加载."),i.a.createElement("p",{className:"embeddable-report-graph-card__empty__body"},"那是不应该发生的. 尝试刷新页面."));return i.a.createElement(n.Fragment,null,i.a.createElement("p",{className:"embeddable-report-graph-card__summary"},i.a.createElement("span",null,r),i.a.createElement("span",{className:"embeddable-report-graph-card__summary__disclaimer"},"UTC 时间")),i.a.createElement(l,{chartJs:t.chartJs,error:t.errorLoadingChartjs,labels:o,values:s,onHover:(n,i)=>{"mouseout"===n.type?d(`${e.last(s)||0} ${t.metric} on ${a()(e.last(o),"YYYY-MM-DD HH:mm:ss").format("MMM DD")}`):d(`${e.get(s,e.get(i,[0,"_index"]),0)} ${t.metric} on ${a()(e.get(o,e.get(i,[0,"_index"])),"YYYY-MM-DD HH:mm:ss").format("MMM DD")}`)},yLabelCallback:t.yLabelCallback,onDataPointClick:t.onDataPointClick}))}class m extends n.Component{constructor(e){super(e),this.state={loadingChartjs:!0,errorLoadingChartjs:!1,loadedChartjs:!1},this.unmounted=!1}componentDidMount(){o.e(76).then(o.t.bind(null,"./node_modules/chart.js-legacy/dist/Chart.js",7)).then((e=>{this.unmounted||(this.Chart=e,this.setState({loadingChartjs:!1,errorLoadingChartjs:!1,loadedChartjs:!0}))})).catch((()=>{this.unmounted||this.setState({loadingChartjs:!1,errorLoadingChartjs:!0,loadedChartjs:!1})}))}componentWillUnmount(){this.unmounted=!0}render(){return i.a.createElement("div",{className:"embeddable-report-graph-card",id:this.props.id},i.a.createElement("h4",{className:"embeddable-report-graph-card__title"},this.props.title),this.props.tooltip&&i.a.createElement(IconWithTooltip,{align:"left",className:"embeddable-report-graph-card__info",content:this.props.tooltip,name:"question",size:"sm"}),i.a.createElement(d,r({},this.props,this.state,{chartJs:this.Chart,loading:this.props.loading||this.state.loadingChartjs})))}}}.call(this,o("./node_modules/lodash/lodash.js"))},"./report/embeddable/services/EmbeddedReportingService.js":function(e,t,o){"use strict";o.r(t);var n=o("./js/modules/services/RemoteSyncRequestService.js"),i=o("./js/modules/services/AnalyticsService.js"),s=o("./js/utils/util.js"),a=o("./js/stores/get-store.js");t.default={mockUsage:async(e,t)=>{let o=new Date;let s=await n.default.request("/ws/proxy",{method:"post",data:{method:"post",service:"report",path:"/reports/mock",body:{reportId:"mockUsage",reportOptions:{timeMacro:"P1M",mockId:t}}}}),a=new Date;return i.default.addEventV2AndPublish({category:"embedded-reports",label:"mockUsage",action:"load-time",value:a-o,entityType:"mock",entityId:t,traceId:e}),s},monitorUsage:async e=>{let t=new Date;let o=await n.default.request("/ws/proxy",{method:"post",data:{method:"post",service:"report",path:"/reports/monitor",body:{reportId:"monitorUsage",reportOptions:{timeMacro:"P12M"}}}}),c=new Date;return i.default.addEventV2AndPublish({category:"embedded-reports",label:"monitorUsage",action:"load-time",value:c-t,entityType:"mock",entityId:s.default.getTeamId(Object(a.getStore)("CurrentUserStore")),traceId:e}),o}}}}]);