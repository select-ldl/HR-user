(window.webpackJsonp=window.webpackJsonp||[]).push([[67],{"./monitors/components/common/MonitorList.js":function(e,t,o){"use strict";o.r(t),function(e){var s,n=o("../../node_modules/react/index.js"),i=o.n(n),r=o("./monitors/components/common/MonitorListItem.js"),a=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),d=o("./monitors/stores/domain/MonitorPermissionStore.js"),l=o("./js/components/base/XPaths/XPath.js"),m=o("./js/stores/get-store.js"),c=o("./js/components/base/keymaps/KeyMaps.js"),h=o("./monitors/stores/domain/MonitorWorkspaceStore.js");const p=new Map;let u=Object(a.observer)(s=class extends n.Component{constructor(t){super(t),this.monitorPermissionStore=new d.default,this.monitorWorkspaceStore=new h.default,this.listItemRefs={},this.focusNext=this.focusNext.bind(this),this.focusPrev=this.focusPrev.bind(this),this.deleteItem=this.deleteItem.bind(this),this.renameItem=this.renameItem.bind(this),this.openMonitorTabDebounced=e.debounce((e=>{this.props.openMonitorTab(e.id,e.name)}),300)}render(){let e=this.props.items.map(((e,t)=>{const o=e.id===this.props.activeMonitorId||void 0,s=this.monitorWorkspaceStore.isCollectionInWorkspace(e.collection),n=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("edit",e.id)&&s,a=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("delete",e.id),d=!this.monitorPermissionStore.isUserLoggedIn()||!!Object(m.getStore)("CurrentUserStore").team,c=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("edit",e.id);return p.set(e.id,{canRename:n,canDelete:a}),i.a.createElement(l.default,{identifier:e.id,key:t},i.a.createElement(r.default,{ref:t=>{this.listItemRefs[e.id]=t},data:e,key:t,selected:o,initiateMonitorDelete:this.props.initiateMonitorDelete,handleMonitorRename:this.props.handleMonitorRename,showLockIcon:c,canRename:n,canDelete:a,canManageRoles:d,isCollectionMoved:!s,isOffline:this.props.isOffline}))}));return i.a.createElement(c.default,{keyMap:pm.shortcuts.getShortcuts(),handlers:this.getKeyMapHandlers()},i.a.createElement("div",{className:"monitor-listing"},e))}getKeyMapHandlers(){return{nextItem:pm.shortcuts.handle("nextItem",this.focusNext),prevItem:pm.shortcuts.handle("prevItem",this.focusPrev),delete:pm.shortcuts.handle("delete",this.deleteItem),rename:pm.shortcuts.handle("rename",this.renameItem)}}focusNext(e){e&&e.preventDefault(),this.focusItem(1)}focusPrev(e){e&&e.preventDefault(),this.focusItem(-1)}focusItem(t){const{items:o,activeMonitorId:s}=this.props;if(!s)return;if(e.isEmpty(o))return;const n=o[(e.findIndex(o,(e=>e.id===s))+t)%o.length];this.props.handleMonitorFocus(n.id),this.openMonitorTabDebounced(n)}deleteItem(){const t=this.props.activeMonitorId;if(!p.get(t).canDelete)return;const o=this.props.items,s=e.find(o,(e=>e.id===t));this.props.initiateMonitorDelete(s.id,s.name)}renameItem(){const t=this.props.activeMonitorId;p.get(t).canRename&&e.invoke(this.listItemRefs,[t,"handleEditName"])}})||s;t.default=u}.call(this,o("./node_modules/lodash/lodash.js"))},"./monitors/components/common/MonitorListEmpty.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return d}));var s=o("../../node_modules/react/index.js"),n=o.n(s),i=o("../../node_modules/@postman/aether/esmLib/index.js"),r=o("./appsdk/sidebar/SidebarEmptyState/SidebarEmptyState.js"),a=o("./monitors/utils/messages/index.js");class d extends s.Component{constructor(e){super(e)}getTooltipText(e){return this.props.isOffline?a.TOOLTIP_TEXT.isOffline:e?a.PERMISSION_TEXT.WORKSPACE_VIEWER_DISABLED:void 0}render(){const e=this.props.canAddMonitor;return n.a.createElement(r.default,{illustration:n.a.createElement(i.IllustrationNoMonitor,null),title:a.EMPTY_STATE.noMonitorsSetup,message:a.EMPTY_STATE.monitorCollectionRun,action:{label:a.MONITOR_ACTION.create,handler:this.props.createNewMonitor,tooltip:this.getTooltipText(!e)},hasPermissions:!this.props.isOffline&&e})}}},"./monitors/components/common/MonitorListItem.js":function(e,t,o){"use strict";o.r(t),function(e){var s,n=o("../../node_modules/react/index.js"),i=o.n(n),r=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),a=o("./js/containers/apps/requester/sidebar/SidebarListItem.js"),d=o("./js/components/base/Dropdowns.js"),l=o("./monitors/components/common/MonitorStatusIndicator.js"),m=o("./js/modules/services/ManageRolesModalService.js"),c=o("./monitors/components/common/DisabledTooltipWrapper.js"),h=o("./monitors/stores/domain/MonitorPermissionStore.js"),p=o("./monitors/components/common/MonitorMetaIcons.js"),u=o("./monitors/services/UrlService.js"),M=o("./js/controllers/ShortcutsList.js"),b=o("./monitors/utils/messages/index.js");let f=Object(r.observer)(s=class extends n.Component{constructor(e){super(e),this.handleDropdownActionSelect=this.handleDropdownActionSelect.bind(this),this.handleEditName=this.handleEditName.bind(this),this.containerRef=this.containerRef.bind(this),this.handleRenameSubmit=this.handleRenameSubmit.bind(this),this.getRightMetaComponent=this.getRightMetaComponent.bind(this),this.getMonitorMetaIcons=this.getMonitorMetaIcons.bind(this),this.monitorPermissionStore=new h.default}getClassNames(){let t={"monitor-listing-list-item":!0,"monitor-listing-list-item-focussed":this.props.selected};return e.keys(e.pickBy(t,e.identity)).join(" ")}containerRef(e){this.listItem=e}getMonitorRouteConfig(){return{routeIdentifier:"build.monitor",routeParams:{monitorPath:u.default.getMonitorPath({monitorName:this.props.data.name,monitorId:this.props.data.id})}}}handleRenameSubmit(t){e.get(this.props,"data.name")!==t&&this.props.handleMonitorRename({monitorId:this.props.data.id,name:t})}handleEditName(){e.invoke(this.listItem,"editText")}showSignInModal(e){return pm.mediator.trigger("showSignInModal",{type:"generic",subtitle:b.SIGN_IN_MESSAGE.subTitle,origin:`monitors_sidebar_${e}_action`})}handleDropdownActionSelect(e){if(!this.monitorPermissionStore.isUserLoggedIn())return this.showSignInModal(e);switch(e){case"delete":return void this.props.initiateMonitorDelete(this.props.data.id,this.props.data.name);case"manage-roles":return void Object(m.manageRolesOnMonitor)(this.props.data.id);case"rename":return void this.handleEditName()}}getActions(){return[{type:"rename",label:"重命名",shortcut:"rename",isEnabled:this.props.canRename,xpathLabel:"rename"},{type:"manage-roles",label:"管理角色",isEnabled:this.props.canManageRoles,disabledMsg:b.SIGN_IN_MESSAGE.default,xpathLabel:"manageRoles"},{type:"delete",label:"删除",shortcut:"delete",isEnabled:this.props.canDelete,xpathLabel:"delete"}]}getMenuItems(){return e.chain(this.getActions()).map((e=>i.a.createElement(d.MenuItem,{key:e.type,refKey:e.type,disabled:!e.isEnabled||this.props.isOffline},i.a.createElement(c.default,{showTooltip:!e.isEnabled||this.props.isOffline,tooltipText:e.disabledMsg||this.props.isCollectionMoved&&b.PERMISSION_TEXT.COLLECTION_MOVED_MSG,isOffline:this.props.isOffline,monitorId:this.props.data.id,monitorName:this.props.data.name,wrapperPrefix:"monitor-sidebar"},i.a.createElement("span",{className:"monitor-action-item"},i.a.createElement("div",{className:"dropdown-menu-item-label"},e.label),e.shortcut&&i.a.createElement("div",{className:"dropdown-menu-item-shortcut"},Object(M.getShortcutByName)(e.shortcut))))))).value()}dropdownOptions(){const e=this.getMenuItems();return i.a.createElement(d.DropdownMenu,{className:"monitors-dropdown-menu","align-right":!0},e)}getRightMetaComponent(e,t){return i.a.createElement(l.default,{isPaused:this.props.data.isPaused,isHealthy:this.props.data.isHealthy,className:e||t?"":"actions-hidden"})}getMonitorMetaIcons(){return i.a.createElement(p.default,{isEditable:this.props.showLockIcon})}render(){return i.a.createElement(a.default,{text:e.get(this.props,"data.name",""),ref:this.containerRef,isSelected:this.props.selected,onRename:this.handleRenameSubmit,moreActions:this.dropdownOptions(),onActionsDropdownSelect:this.handleDropdownActionSelect,rightMetaComponent:this.getRightMetaComponent,statusIndicators:this.getMonitorMetaIcons,routeConfig:this.getMonitorRouteConfig()})}})||s;t.default=f}.call(this,o("./node_modules/lodash/lodash.js"))},"./monitors/components/common/MonitorMetaIcons.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return r}));var s=o("../../node_modules/react/index.js"),n=o.n(s),i=o("../../node_modules/@postman/aether/esmLib/index.js");class r extends s.Component{constructor(e){super(e)}render(){return n.a.createElement(n.a.Fragment,null,!0===this.props.isPublic&&n.a.createElement(i.Icon,{name:"icon-state-published-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"共享在公共工作区"}),!this.props.isPublic&&!0===this.props.canTeamView&&n.a.createElement(i.Icon,{name:"icon-descriptive-team-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"与团队共享"}),!1===this.props.isEditable&&n.a.createElement(i.Icon,{name:"icon-state-locked-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"只读"}))}}},"./monitors/components/common/MonitorOfflineSidebar.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return d}));var s=o("../../node_modules/react/index.js"),n=o.n(s),i=o("../../node_modules/@postman/aether/esmLib/index.js"),r=o("./appsdk/sidebar/SidebarEmptyState/SidebarEmptyState.js"),a=o("./monitors/utils/messages/index.js");class d extends s.Component{constructor(e){super(e)}render(){return n.a.createElement("div",{className:"monitor-sidebar-offline-state"},n.a.createElement(r.default,{illustration:n.a.createElement(i.IllustrationCheckInternetConnection,null),title:a.OFFLINE_TEXT.text,message:a.OFFLINE_TEXT.subText}))}}},"./monitors/components/sidebar/MonitorSidebarError.js":function(e,t,o){"use strict";o.r(t);var s=o("../../node_modules/react/index.js"),n=o.n(s),i=o("./js/components/base/Buttons.js"),r=o("../../node_modules/@postman/aether/esmLib/index.js"),a=o("./monitors/utils/messages/index.js");class d extends n.a.Component{render(){return n.a.createElement("div",{className:"monitor-sidebar-error-view"},n.a.createElement("div",{className:"monitor-sidebar-error-view__illustration"},n.a.createElement(r.IllustrationUnableToLoad,null)),n.a.createElement("div",{className:"monitor-sidebar-error-view__title"},n.a.createElement(r.Heading,{type:"h4",color:"content-color-secondary",text:a.MONITOR_ACTION_ERROR.load})),n.a.createElement("div",null,n.a.createElement(i.Button,{className:"btn-small monitor-sidebar-error-view__button",type:"secondary",onClick:this.props.handleRefresh},a.TRY_AGAIN)))}}t.default=d},"./monitors/components/sidebar/MonitorSidebarMenu.js":function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return l}));var s,n=o("../../node_modules/react/index.js"),i=o.n(n),r=o("./js/containers/apps/requester/sidebar/SidebarListActions.js"),a=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),d=o("./monitors/utils/messages/index.js");let l=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.handleSearch=this.handleSearch.bind(this)}getTooltipText(e,t){return e?d.PERMISSION_TEXT.WORKSPACE_VIEWER_DISABLED:t?d.TOOLTIP_TEXT.isOffline:d.CREATE_NEW_MONITOR}handleSearch(e){this.props.store.setSearchQuery(e)}render(){return i.a.createElement("div",null,i.a.createElement(r.default,{createNewConfig:{tooltip:this.getTooltipText(!this.props.canAddMonitor,this.props.isOffline),disabled:!this.props.canAddMonitor||this.props.isOffline,onCreate:this.props.createNewMonitor,xPathIdentifier:"addMonitor"},onSearch:this.handleSearch,searchQuery:this.props.store.searchQuery}))}})||s},"./monitors/containers/MonitorSidebarContainer.js":function(e,t,o){"use strict";o.r(t);var s,n=o("../../node_modules/react/index.js"),i=o.n(n),r=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),a=o("../../node_modules/@postman/aether/esmLib/index.js"),d=o("./monitors/components/common/MonitorList.js"),l=o("./monitors/components/sidebar/MonitorSidebarMenu.js"),m=o("./js/stores/get-store.js"),c=o("./monitors/components/common/MonitorListEmpty.js"),h=o("./appsdk/sidebar/SidebarNoResultsFound/SidebarNoResultsFound.js"),p=o("./appsdk/sidebar/SidebarLoadingState/SidebarLoadingState.js"),u=o("./monitors/components/sidebar/MonitorSidebarError.js"),M=o("./js/components/base/XPaths/XPath.js"),b=o("./monitors/components/common/MonitorOfflineSidebar.js"),f=o("./appsdk/workbench/TabService.js"),g=o("./monitors/constants.js"),I=o("./monitors/services/UrlService.js");let S=Object(r.observer)(s=class extends n.Component{constructor(e){super(e),this.store=e.controller.store,this.activeWorkspaceStore=Object(m.getStore)("ActiveWorkspaceStore"),this.openCreateMonitorTab=this.openCreateMonitorTab.bind(this),this.openMonitorTab=this.openMonitorTab.bind(this),this.initiateMonitorDelete=this.initiateMonitorDelete.bind(this),this.handleMonitorDelete=this.handleMonitorDelete.bind(this),this.handleMonitorRename=this.handleMonitorRename.bind(this),this.handleMonitorFocus=this.handleMonitorFocus.bind(this),this.refreshMonitorList=this.refreshMonitorList.bind(this)}openMonitorTab(e,t){this.props.controller.openMonitorTab(e,t)}showSignInModal(){return pm.mediator.trigger("showSignInModal",{type:"generic",subtitle:"您需要一个账户才能继续探索 Postman.",origin:"monitors_sidebar_create_button"})}openCreateMonitorTab(){if(!Object(m.getStore)("CurrentUserStore").isLoggedIn)return this.showSignInModal();this.props.controller.openCreateMonitorTab()}initiateMonitorDelete(e,t){pm.mediator.trigger("showDeleteMonitorModal",{id:e,name:t},(()=>{this.handleMonitorDelete(e,t)}),{origin:"sidebar"})}handleMonitorDelete(e,t){pm.toasts.success("监视器已删除.");const o=I.default.getMonitorPath({monitorId:e,monitorName:t});f.default.closeByRoute(g.MONITOR_WORKBENCH_URL,{monitorPath:o}),f.default.closeByRoute(g.MONITOR_EDIT_URL,{monitorPath:o})}handleMonitorRename({monitorId:e,name:t}){this.props.controller.updateMonitorName({monitorId:e,name:t})}handleMonitorFocus(e){this.store.setActiveMonitorId(e)}refreshMonitorList(){this.store.refreshSidebarList()}getRenderedComponent(){const e=Object(m.getStore)("ActiveWorkspacePermissionStore").permissions,t=!Object(m.getStore)("CurrentUserStore").isLoggedIn||e&&e.ADD_MONITOR_TO_WORKSPACE;let o;return!this.store.isOffline||this.store.values.length||this.store.loaded?(o=this.store.error?i.a.createElement(u.default,{handleRefresh:this.refreshMonitorList}):this.store.loaded&&!this.store.loading||this.store.values.length?this.store.values.length||this.store.searchQuery?this.store.filteredItems.length?i.a.createElement(M.default,{identifier:"monitor"},i.a.createElement(d.default,{items:this.store.filteredItems,activeMonitorId:this.store.activeMonitorId,canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,openMonitorTab:this.openMonitorTab,initiateMonitorDelete:this.initiateMonitorDelete,handleMonitorRename:this.handleMonitorRename,handleMonitorFocus:this.handleMonitorFocus,isOffline:this.store.isOffline})):i.a.createElement(h.default,{searchQuery:this.store.searchQuery,illustration:i.a.createElement(a.IllustrationNoMonitor,null)}):i.a.createElement(c.default,{canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,isOffline:this.store.isOffline}):i.a.createElement(p.default,null),i.a.createElement("div",null,i.a.createElement(l.default,{canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,store:this.store,isOffline:this.store.isOffline}),o)):i.a.createElement(b.default,null)}render(){return i.a.createElement("div",{className:"monitor-sidebar-tab-content"},this.getRenderedComponent())}})||s;t.default=S}}]);