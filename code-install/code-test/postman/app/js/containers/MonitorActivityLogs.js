(window.webpackJsonp=window.webpackJsonp||[]).push([[66],{"./monitors/components/activity-logs/MonitorActivityFeed.js":function(e,t,i){"use strict";i.r(t),i.d(t,"LoadMore",(function(){return S})),i.d(t,"fetchTeamUsers",(function(){return b})),i.d(t,"default",(function(){return A}));var s=i("../../node_modules/react/index.js"),o=i.n(s),r=i("./node_modules/lodash/lodash.js"),n=i.n(r),a=i("../../node_modules/@postman/aether/esmLib/index.js"),l=i("./js/components/base/LoadingIndicator.js"),c=i("./monitors/components/activity-logs/MonitorActivityItem.js"),m=i("./monitors/components/activity-logs/NoMonitorActivity.js"),d=i("./js/stores/get-store.js"),p=i("./js/components/empty-states/SignInModal.js"),h=i("./js/modules/services/AuthHandlerService.js"),u=i("./monitors/components/common/MonitorContextBarError.js"),v=i("./monitors/utils/messages/index.js"),f=i("./onboarding/src/common/UTMService.js");function y(){return y=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var s in i)Object.prototype.hasOwnProperty.call(i,s)&&(e[s]=i[s])}return e},y.apply(this,arguments)}function g(e){const t=new Date(e),i=[v.MONTH_NAMES[t.getMonth()],`${t.getDate()},`,t.getFullYear()].join(" "),s=function(e){const t=new Date(e),i=new Date(t.toDateString()),s=new Date,o=new Date(s.toDateString()),r=Math.abs(i-o),n=Math.ceil(r/864e5);if(i<o)return-n;return n}(e);return 0===s?"今天":-1===s?"昨天":i}function S(e){let t;return e.show?(t=e.loading?o.a.createElement(l.default,{className:"loader-activity-logs"}):e.nextPage?o.a.createElement(a.Button,{type:"outline",onClick:e.onClick,isDisabled:e.isOffline,text:v.ACTIVITY_LOGS_LOAD_MORE,fullWidth:!0,tooltip:e.isOffline&&v.TOOLTIP_TEXT.isOffline}):v.ACTIVITY_LOGS_LIST_END,o.a.createElement("div",{className:"monitor-activity__load-more"},t)):null}function b(e){return Object.assign({},...Object.entries(y({},e)).map((([e,t])=>({[Number(t.id)]:t}))))}function A(e){const{activities:t,loading:i,nextPage:s,moreLoading:r,error:a}=e,y=function(e){if(n.a.isEmpty(e))return[];let t="",i=[];return e.forEach((e=>{let s=new Date(e.timestamp).toDateString(),o=g(e.timestamp);s!==t?(t=s,i.push({name:o,items:[e]})):i[i.length-1].items.push(e)})),i}(t);return Object(d.getStore)("CurrentUserStore").isLoggedIn?e.canViewActivityLogs?a?o.a.createElement(u.default,null):i&&!r||n.a.isEmpty(t)&&i?o.a.createElement(l.default,{className:"loader-activity-logs"}):n.a.isEmpty(t)&&!i?o.a.createElement(m.default,{isFilterApplied:e.isFilterApplied}):o.a.createElement("div",{className:"pm-activity-feed"},o.a.createElement("div",{className:"pm-activity-section-container"},n.a.map(y,(t=>{let i="",s=!1;return o.a.createElement("div",{className:"pm-activity-section",key:t.name},o.a.createElement("div",{className:"pm-monitor-activity-section__date"},t.name),n.a.map(t.items,(t=>(s=i!==t.actor.id,i=t.actor.id,o.a.createElement(c.default,{activity:t,key:t.id,showUserIcon:s,isOffline:e.isOffline})))))}))),o.a.createElement(S,{loading:i,nextPage:s,show:!n.a.isEmpty(t),onClick:e.handleLoadMore,isOffline:e.isOffline})):o.a.createElement("div",{className:"activity-logs-public-view"},o.a.createElement("div",{className:"empty-state-activity-logs"}),o.a.createElement("div",{className:"activity-logs-public-view__entity"},v.PERMISSION_TEXT.CONSOLE_DISABLED_MSG)):o.a.createElement("div",{className:"activity-logs-public-view"},o.a.createElement(p.default,{title:v.SIGN_IN_MESSAGE.title,subtitle:v.SIGN_IN_MESSAGE.subTitle,onSignIn:function(){h.default.initiateLogin({isSignup:!1})},onCreateAccount:function(){const e=Object(f.getAllParams)({utm_content:"monitor_activity_feed",utm_term:"sign_up"});h.default.initiateLogin({isSignup:!0,queryParams:e})}}))}},"./monitors/components/activity-logs/MonitorActivityFilter.js":function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return y}));var s,o=i("../../node_modules/react/index.js"),r=i.n(o),n=i("../../node_modules/mobx-react/dist/mobx-react.module.js"),a=i("./js/components/base/Avatar.js"),l=i("./js/components/base/Inputs.js"),c=i("./js/components/base/Dropdowns.js"),m=i("./js/components/base/FuzzySearchInput.js"),d=i("./js/components/base/LoadingIndicator.js"),p=i("./node_modules/classnames/index.js"),h=i.n(p),u=i("./js/components/base/Buttons.js"),v=i("../../node_modules/@postman/aether/esmLib/index.js"),f=i("./monitors/utils/messages/index.js");let y=Object(n.observer)(s=class extends o.Component{constructor(e){super(e),this.state={isFilterApplied:e.isFilterApplied,searchQuery:"",searchResults:[]},this.handleFuzzySearch=this.handleFuzzySearch.bind(this),this.getClasses=this.getClasses.bind(this)}handleFuzzySearch(e,t){this.setState({searchQuery:e,searchResults:t})}getClasses(){return h()({"select-dropdown-container":!0,applied:this.state.isFilterApplied,selected:!this.state.isFilterApplied&&this.state.isSelected})}render(){const t=e.map(e.cloneDeep(this.props.workspaceUsers),(e=>(e.name=e.name||e.username,e)));let i=this.state.searchQuery?this.state.searchResults:t;return r.a.createElement("div",{className:h()(this.props.className)},r.a.createElement(c.Dropdown,{className:this.getClasses()},r.a.createElement(c.DropdownButton,{dropdownStyle:"nocaret"},r.a.createElement(u.Button,{type:"tertiary",tooltip:this.props.tooltip,disabled:this.props.disabled},r.a.createElement(v.Icon,{name:"icon-action-filter-stroke"}))),r.a.createElement(c.DropdownMenu,null,this.props.disabled?"":r.a.createElement("div",{className:"select-dropdown"},r.a.createElement(m.default,{searchQuery:this.state.searchQuery,placeholder:"搜索用户",onChange:this.handleFuzzySearch,items:t,searchFields:["name","email"]}),r.a.createElement("div",{className:h()({"select-dropdown-list":!0,isLoading:this.props.loadingUsers})},this.props.loadingUsers?r.a.createElement(d.default,null):i&&i.length?e.map(i,(e=>r.a.createElement("div",{key:e.id,className:"select-dropdown-item",onClick:this.props.handleSelect.bind(this,e.id,i,!this.props.filtersApplied.members[e.id])},r.a.createElement(a.default,{size:"small",userId:e.id,customPic:e.profilePicUrl,linkProfile:!1}),r.a.createElement("span",{className:"select-dropdown-item-text",title:e.name},e.name),r.a.createElement(l.Checkbox,{onChange:this.props.handleSelect.bind(this,e.id,i),className:"select-dropdown-item-checkbox",checked:this.props.filtersApplied.members[e.id]})))):r.a.createElement("div",{className:"activity-user-filter-dropdown-no-user"},f.ACTIVITY_LOGS_NO_USERS))))))}})||s}.call(this,i("./node_modules/lodash/lodash.js"))},"./monitors/components/activity-logs/MonitorActivityItem.js":function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return h}));var s=i("../../node_modules/react/index.js"),o=i.n(s),r=i("./node_modules/classnames/index.js"),n=i.n(r),a=i("./node_modules/@postman/date-helper/index.js"),l=i.n(a),c=i("./monitors/utils/messages/index.js"),m=i("./js/components/base/Avatar.js"),d=i("./monitors/components/common/UserInfo.js");function p(){return p=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var s in i)Object.prototype.hasOwnProperty.call(i,s)&&(e[s]=i[s])}return e},p.apply(this,arguments)}function h(e){const{activity:t,showUserIcon:i}=e;let s;var r;return 0===l.a.getFormattedDate(t.timestamp)?s=l.a.getFormattedTime(t.timestamp):(r=t.timestamp,s=new Date(r).toLocaleString("en-US",{hour:"numeric",minute:"numeric",hour12:!0})),o.a.createElement("div",{className:n()({"pm-activity-list-item":!0,"show-user":i,"activity-logs-offline":e.isOffline})},i&&o.a.createElement("div",{className:"pm-monitor-activity-list-item__icon"},o.a.createElement(m.default,{type:"user",customPic:t.actor.profilePicUrl,userId:t.actor.id,size:"large"})),o.a.createElement("p",{className:"pm-activity-list-item__time"},s),o.a.createElement("div",{className:"pm-activity-list-item__text"},0!==t.actor.id&&o.a.createElement(d.default,p({},t.actor,{showAvatar:!1,allowAlias:!0})),0!==t.actor.id?Object(c.getUserVisibleAction)(t.action):Object(c.getUserVisibleSystemAction)(t.action,t.context)))}},"./monitors/components/activity-logs/NoMonitorActivity.js":function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return l}));var s=i("../../node_modules/react/index.js"),o=i.n(s),r=i("../../node_modules/@postman/aether/esmLib/index.js"),n=i("./monitors/components/common/EmptyState.js"),a=i("./monitors/utils/messages/index.js");function l(e){return o.a.createElement(n.default,{body:e.isFilterApplied?a.ACTIVITY_LOGS_EMPTY_STATE.withFiltersSubText:a.ACTIVITY_LOGS_EMPTY_STATE.subText,title:e.isFilterApplied?a.ACTIVITY_LOGS_EMPTY_STATE.withFiltersText:a.ACTIVITY_LOGS_EMPTY_STATE.text,illustration:o.a.createElement(r.IllustrationNoActivity,null),className:e.isFilterApplied?"activity-logs-empty-state-no-logs-with-filters":"activity-logs-empty-state-no-logs"})}},"./monitors/components/common/MonitorContextBarError.js":function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return c}));var s=i("../../node_modules/react/index.js"),o=i.n(s),r=i("./node_modules/prop-types/index.js"),n=i.n(r),a=i("../../node_modules/@postman/aether/esmLib/index.js"),l=i("./monitors/utils/messages/index.js");class c extends s.Component{constructor(e){super(e)}render(){return o.a.createElement("div",{className:"monitor-contextbar-error-view"},o.a.createElement("div",{className:"monitor-contextbar-error-view__illustration"},o.a.createElement(a.IllustrationUnableToLoad,null)),o.a.createElement("div",{className:"monitor-contextbar-error-view__title"},o.a.createElement(a.Heading,{type:"h4",color:"content-color-secondary",text:this.props.title})),o.a.createElement("div",null,o.a.createElement("div",{className:"monitor-contextbar-error-view__subtitle"},o.a.createElement(a.Text,{type:"body-medium",color:"content-color-secondary"},this.props.subtitle))))}}c.defaultProps={title:l.MONITOR_ACTION_ERROR.activityLoadFailure,subtitle:l.MONITOR_ACTION_ERROR.retry},c.propTypes={title:n.a.string,message:n.a.string}},"./monitors/containers/MonitorActivityLogs.js":function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return b}));var s,o=i("../../node_modules/react/index.js"),r=i.n(o),n=i("../../node_modules/mobx-react/dist/mobx-react.module.js"),a=i("./node_modules/classnames/index.js"),l=i.n(a),c=i("./appsdk/contextbar/ContextBarViewHeader.js"),m=i("./monitors/components/activity-logs/MonitorActivityFeed.js"),d=i("./monitors/components/common/MonitorOfflineContextBar.js"),p=i("./js/stores/get-store.js"),h=i("./monitors/stores/domain/MonitorPermissionStore.js"),u=i("./monitors/services/UrlService.js"),v=i("./js/components/base/Buttons.js"),f=i("../../node_modules/@postman/aether/esmLib/index.js"),y=i("./monitors/components/activity-logs/MonitorActivityFilter.js"),g=i("./monitors/utils/messages/index.js");function S(){return S=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var s in i)Object.prototype.hasOwnProperty.call(i,s)&&(e[s]=i[s])}return e},S.apply(this,arguments)}let b=Object(n.observer)(s=class extends o.Component{constructor(t){super(t),this.handleSearch=e.debounce((e=>{const t=u.default.getMonitorIdFromActiveRoute();this.setState({isFilterApplied:!0,filter:e}),this.props.controller.monitorActivityStore.getActivitiesByMonitor({monitorId:t,members:Object.keys(e.members),page:1},!0),this.props.controller.monitorActivityStore.setActiveMonitorId(t)}),600),this.state={isFilterApplied:!1,filter:{members:{}}},this.handleLoadMore=this.handleLoadMore.bind(this),this.canViewActivityLogs=this.canViewActivityLogs.bind(this),this.handleRefresh=this.handleRefresh.bind(this),this.handleSearch=this.handleSearch.bind(this),this.getRefreshTextClass=this.getRefreshTextClass.bind(this),this.getWorkspaceUsers=this.getWorkspaceUsers.bind(this),this.handleFilterSelect=this.handleFilterSelect.bind(this),this.monitorPermissionStore=new h.default}getRefreshTextClass(){return l()({"pm-activity-section__refresh__btn":!0,"is-loading":this.props.controller.monitorActivityStore.loading})}handleLoadMore(){this.props.controller.monitorActivityStore.getActivitiesByMonitor({monitorId:this.props.controller.monitorActivityStore.activeMonitorId,members:Object.keys(this.state.filter.members),page:this.props.controller.monitorActivityStore.nextPage},!1),this.props.controller.monitorActivityStore.setMoreLoading(!0)}canViewActivityLogs(){return this.monitorPermissionStore.can("viewActivityLogs",this.props.contextData.id)}handleRefresh(){const e=u.default.getMonitorIdFromActiveRoute();this.setState({isFilterApplied:!1,filter:{members:{}}}),this.props.controller.monitorActivityStore.getActivitiesByMonitor({monitorId:e,page:1},!0),this.props.controller.monitorActivityStore.setActiveMonitorId(e)}handleFilterSelect(t,i,s){let o={};o=s?S({},this.state.filter.members,{[t]:e.find(i,{id:t})}):e.omitBy(this.state.filter.members,{id:t}),this.setState({isFilterApplied:!0,filter:{members:o}},(()=>{this.handleSearch(this.state.filter)}))}getWorkspaceUsers(){const t=e.get(Object(p.getStore)("ActiveWorkspaceStore"),"members"),i={};return e.forEach(t,(t=>{let s=Object(p.getStore)("CurrentUserStore").teamMembers.get(t.id);e.isEmpty(s)||(i[t.id]=e.omit(S({},s),["role"]))})),i}render(){let t=this.getWorkspaceUsers();return r.a.createElement("div",{className:"contextCustomScroll"},r.a.createElement(c.ContextBarViewHeader,{title:this.props.title,onClose:this.props.onClose},r.a.createElement(v.Button,{onClick:this.handleRefresh,className:this.getRefreshTextClass(),tooltip:this.props.controller.monitorActivityStore.isOffline?g.TOOLTIP_TEXT.isOffline:g.TOOLTIP_TEXT.isOnline,disabled:this.props.controller.monitorActivityStore.isOffline||this.props.controller.monitorActivityStore.loading},r.a.createElement(f.Icon,{className:"pm-activity-section__refresh__btn__icon",name:"icon-action-refresh-stroke",color:"content-color-primary",size:"large"})),Object(p.getStore)("CurrentUserStore").isLoggedIn&&t&&r.a.createElement(y.default,{filtersApplied:this.state.filter,loadingUsers:Object(p.getStore)("CurrentUserStore").isHydrating||!e.size(t),handleRefresh:this.handleRefresh,handleSearch:this.handleSearch,isFilterApplied:this.state.isFilterApplied,workspaceUsers:t,handleSelect:this.handleFilterSelect,disabled:this.props.controller.monitorActivityStore.isOffline,tooltip:this.props.controller.monitorActivityStore.isOffline?g.TOOLTIP_TEXT.isOffline:g.ACTIVITY_LOGS_FILTER})),r.a.createElement("div",{className:"monitor-activity"},this.props.controller.monitorActivityStore.isOffline&&!this.props.controller.monitorActivityStore.values.length?r.a.createElement(d.default,null):r.a.createElement(m.default,{isFilterApplied:this.state.isFilterApplied,activities:this.props.controller.monitorActivityStore.values,teamUsers:Object(p.getStore)("TeamStore").allTeamMembers,nextPage:this.props.controller.monitorActivityStore.nextPage,loading:this.props.controller.monitorActivityStore.loading,error:this.props.controller.monitorActivityStore.error,loaded:this.props.controller.monitorActivityStore.loaded,loadingMore:this.props.controller.monitorActivityStore.loadingMore,handleLoadMore:this.handleLoadMore,listLoading:this.props.controller.monitorActivityStore.listLoading,moreLoading:this.props.controller.monitorActivityStore.moreLoading,canViewActivityLogs:this.canViewActivityLogs(),isOffline:this.props.controller.monitorActivityStore.isOffline})))}})||s}.call(this,i("./node_modules/lodash/lodash.js"))}}]);