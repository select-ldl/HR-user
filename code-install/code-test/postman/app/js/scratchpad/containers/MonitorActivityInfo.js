(window.webpackJsonp=window.webpackJsonp||[]).push([[39],{24619:function(t,e,o){"use strict";o.r(e),function(t){o.d(e,"default",(function(){return g}));var n,i=o(2),a=o.n(i),s=o(9),r=o(2353),c=o(1656),l=o(6743),m=o.n(l),_=o(7124),d=o(24612),f=o(7148),h=o(7326),v=o(5929),p=o(8314),y=o(7145),u=o(24615),E=o(24620),w=o(7756),I=o(8317),N=o(6375),T=o(6762),O=o(8635);function b(){return b=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var o=arguments[e];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}return t},b.apply(this,arguments)}let g=Object(r.observer)(n=class extends i.Component{constructor(e){super(e),this.loadCollectionInfo=async()=>{let e;try{e=await Object(N.subscribeOne)(this.props.controller.store.data.collection)}catch(e){pm.logger.warn(I.COLLECTION_FETCH_ERROR.warn,e),pm.toasts.error(t.get(e,"message")||I.COLLECTION_FETCH_ERROR.error)}finally{this.setState({collectionInfo:e,collectionLoading:!1})}},this.loadEnvironmentInfo=async()=>{let t;try{let e=this.props.controller.store.data.environment;e&&(t=await Object(T.subscribeOne)(e))}catch(t){}finally{this.setState({environment:t,environmentLoading:!1})}},this.loadVersionInfo=async()=>{let e;const o=this.props.controller.store.data.versionTag;try{const n=await this.loadOwnVersions({collectionUid:this.props.controller.store.data.collection});let i=t.find(n,["id",o]);e=i?i.name:"CURRENT"}catch(e){pm.logger.warn(I.VERSION_TAGS_ERROR.warn,e),pm.toasts.error(t.get(e,"message")||I.VERSION_TAGS_ERROR.error)}finally{this.setState({versionName:e})}},this.monitorPermissionStore=new p.default,this.showPrvtUserTooltip=this.showPrvtUserTooltip.bind(this),this.hidePrvtUserTooltip=this.hidePrvtUserTooltip.bind(this),this.state={showPrvtUserTooltip:!1,idCopySuccess:!1,forkedFromCollectionId:null,forkName:null,versionTag:null,versionName:"",environment:null,collectionLoading:!0,environmentLoading:!0},this.loadOwnVersions=this.loadOwnVersions.bind(this)}componentDidMount(){Object(c.when)((()=>this.props.controller.store.data.collection),(()=>this.loadMonitorInfo()))}async loadMonitorInfo(){this.setState({collectionLoading:!0,environmentLoading:!0}),await Object(v.getStore)("SyncStatusStore").onSyncAvailable(),await Promise.allSettled([this.loadCollectionInfo(),this.loadVersionInfo(),this.loadEnvironmentInfo()])}loadOwnVersions(t){return Object(w.fetchAllTags)(t).then((t=>t))}componentWillUnmount(){clearTimeout(this.clearIdCopySuccessTimeout),t.invoke(this.state,"collectionInfo.unsubscribe"),t.invoke(this.state,"environment.unsubscribe")}showPrvtUserTooltip(){this.setState({showPrvtUserTooltip:!0})}hidePrvtUserTooltip(){this.setState({showPrvtUserTooltip:!1})}fetchUserName(e,o){let n=o.reduce(((t,e)=>(t[e.id]=e,t)),{});return t.get(n,e,{}).name}canViewCreatorInfo(){return this.monitorPermissionStore.can("viewCreatorInfo",this.props.contextData.id)}copyMonitorId(t){this.state.idCopySuccess||(y.default.copy(t),this.setState({idCopySuccess:!0},(()=>{this.clearIdCopySuccessTimeout=setTimeout((()=>this.setState({idCopySuccess:!1})),3e3)})))}fetchCopyIcon(t){return t?a.a.createElement(s.Icon,{name:"icon-state-success-stroke",className:"monitor-info-context-view__entity__content__toggle__success"}):a.a.createElement(s.Icon,{name:"icon-action-copy-stroke",className:"monitor-info-context-view__entity__content__toggle__copy"})}render(){const{isOffline:e}=this.props.controller.monitorActivityDetailsStore;this.monitorInfo=t.get(this.props,"contextData",{});const o=m()(this.monitorInfo.createdAt).format("DD MMM YYYY, h:mm A");return a.a.createElement("div",{className:"monitor-info-context-view-wrapper"},a.a.createElement(h.ContextBarViewHeader,{title:this.props.title,onClose:this.props.onClose}),e&&"number"==typeof this.props.contextData.createdBy?a.a.createElement(u.default,null):a.a.createElement("div",{className:"monitor-info-context-view"},a.a.createElement("div",{className:"monitor-info-context-view__entity"},a.a.createElement("div",{className:"monitor-info-context-view__entity__label"},"ID"),a.a.createElement("div",{className:"monitor-info-context-view__entity__content"},a.a.createElement("div",{className:"monitor-info-context-view__entity__content__id"},this.monitorInfo.id),a.a.createElement(_.Button,{className:"monitor-info-context-view__entity__content__toggle",tooltip:this.state.idCopySuccess?"Copied":"Copy Monitor ID",type:"icon",onClick:()=>this.copyMonitorId(this.monitorInfo.id)},this.fetchCopyIcon(this.state.idCopySuccess)))),a.a.createElement("div",{className:"monitor-info-context-view__entity"},a.a.createElement(i.Fragment,null,a.a.createElement("div",{className:"monitor-info-context-view__entity__label"},"Created by"),a.a.createElement("div",{disabled:e,className:e&&"monitor-info-userinfo-offline"},a.a.createElement(d.default,b({},this.monitorInfo.creatorInfo,{containerClass:"monitor-info-context-view__entity__content"}))))),a.a.createElement("div",{className:"monitor-info-context-view__entity"},a.a.createElement("div",{className:"monitor-info-context-view__entity__label"},"Created on"),a.a.createElement("div",{className:"monitor-info-context-view__entity__content"},o)),a.a.createElement("div",{className:"monitor-info-context-view__entity"},a.a.createElement("div",{className:"monitor-info-context-view__entity__label"},"Collection"),a.a.createElement("div",{className:"monitor-info-context-view__entity__content monitor-info-context-view__entity__content--collection"},this.state.collectionLoading&&a.a.createElement(s.Text,{color:"content-color-secondary",text:I.LOADING_STATE.generic}),this.monitorInfo.collection&&this.state.collectionInfo?a.a.createElement(a.a.Fragment,null,a.a.createElement(f.default,{to:e?"":{routeIdentifier:"collection.openWithWsSelect",routeParams:{cid:this.monitorInfo.collection}},className:"monitor-info-context-view__entity__content__collection"},e?a.a.createElement(_.Button,{type:"tertiary",className:"monitor-info-btn",disabled:e,tooltip:e&&I.TOOLTIP_TEXT.isOffline},a.a.createElement(O.default,{item:this.state.collectionInfo,hideForkLabelTooltip:!1})):a.a.createElement("div",{className:"monitor-info-text-link"},this.state.collectionInfo&&a.a.createElement(O.default,{type:"link",item:this.state.collectionInfo,hideForkLabelTooltip:!1}))),a.a.createElement("div",{className:"monitor-info-collection__collection-version-tag"},this.state.versionName)):a.a.createElement("span",{className:"monitor-info-context-view__entity__content__collection-empty"},!this.state.collectionLoading&&I.MONITOR_DETAILS_NO_COLLECTION))),a.a.createElement("div",{className:"monitor-info-context-view__entity"},a.a.createElement("div",{className:"monitor-info-context-view__entity__label"},"Environment"),a.a.createElement("div",{className:"monitor-info-context-view__entity__content monitor-info-context-view__entity__content--environment"},this.state.environmentLoading&&a.a.createElement(s.Text,{color:"content-color-secondary",text:I.LOADING_STATE.generic}),this.state.environment?a.a.createElement(f.default,{to:e?"":{routeIdentifier:"build.environment",routeParams:{eid:this.monitorInfo.environment}},className:"monitor-info-context-view__entity__content__environment"},e?a.a.createElement(_.Button,{type:"tertiary",className:"monitor-info-btn",disabled:e,tooltip:e&&I.TOOLTIP_TEXT.isOffline},t.get(this.state.environment,"name",null)):a.a.createElement("div",{className:"monitor-info-text-link"},this.state.environment&&a.a.createElement(O.default,{type:"link",item:this.state.environment,hideForkLabelTooltip:!1}))):a.a.createElement("span",{className:"monitor-info-context-view__entity__content__environment-empty"},!this.state.environmentLoading&&I.NO_ENVIRONMENT))),t.includes(["dev","beta","stage","canary","prod"],window.RELEASE_CHANNEL)&&a.a.createElement(E.IntegrationContextBarList,{entityId:this.monitorInfo.id,entityType:"monitor"})))}})||n}.call(this,o(2753))}}]);