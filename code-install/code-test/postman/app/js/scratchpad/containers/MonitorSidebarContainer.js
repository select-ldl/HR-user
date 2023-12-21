(window.webpackJsonp=window.webpackJsonp||[]).push([[35],{24599:function(e,t,o){"use strict";o.r(t);var i,n=o(2),s=o.n(n),r=o(2353),a=o(9),l=o(24600),d=o(24604),c=o(5929),h=o(24605),m=o(11281),p=o(11789),u=o(24606),f=o(7321),M=o(24607),b=o(7103),g=o(8325),I=o(8621);let E=Object(r.observer)(i=class extends n.Component{constructor(e){super(e),this.store=e.controller.store,this.activeWorkspaceStore=Object(c.getStore)("ActiveWorkspaceStore"),this.openCreateMonitorTab=this.openCreateMonitorTab.bind(this),this.openMonitorTab=this.openMonitorTab.bind(this),this.initiateMonitorDelete=this.initiateMonitorDelete.bind(this),this.handleMonitorDelete=this.handleMonitorDelete.bind(this),this.handleMonitorRename=this.handleMonitorRename.bind(this),this.handleMonitorFocus=this.handleMonitorFocus.bind(this),this.refreshMonitorList=this.refreshMonitorList.bind(this)}openMonitorTab(e,t){this.props.controller.openMonitorTab(e,t)}showSignInModal(){return pm.mediator.trigger("showSignInModal",{type:"generic",subtitle:"You need an account to continue exploring Postman.",origin:"monitors_sidebar_create_button"})}openCreateMonitorTab(){if(!Object(c.getStore)("CurrentUserStore").isLoggedIn)return this.showSignInModal();this.props.controller.openCreateMonitorTab()}initiateMonitorDelete(e,t){pm.mediator.trigger("showDeleteMonitorModal",{id:e,name:t},(()=>{this.handleMonitorDelete(e,t)}),{origin:"sidebar"})}handleMonitorDelete(e,t){pm.toasts.success("Monitor deleted.");const o=I.default.getMonitorPath({monitorId:e,monitorName:t});b.default.closeByRoute(g.MONITOR_WORKBENCH_URL,{monitorPath:o}),b.default.closeByRoute(g.MONITOR_EDIT_URL,{monitorPath:o})}handleMonitorRename({monitorId:e,name:t}){this.props.controller.updateMonitorName({monitorId:e,name:t})}handleMonitorFocus(e){this.store.setActiveMonitorId(e)}refreshMonitorList(){this.store.refreshSidebarList()}getRenderedComponent(){const e=Object(c.getStore)("ActiveWorkspacePermissionStore").permissions,t=!Object(c.getStore)("CurrentUserStore").isLoggedIn||e&&e.ADD_MONITOR_TO_WORKSPACE;let o;return!this.store.isOffline||this.store.values.length||this.store.loaded?(o=this.store.error?s.a.createElement(u.default,{handleRefresh:this.refreshMonitorList}):this.store.loaded&&!this.store.loading||this.store.values.length?this.store.values.length||this.store.searchQuery?this.store.filteredItems.length?s.a.createElement(f.default,{identifier:"monitor"},s.a.createElement(l.default,{items:this.store.filteredItems,activeMonitorId:this.store.activeMonitorId,canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,openMonitorTab:this.openMonitorTab,initiateMonitorDelete:this.initiateMonitorDelete,handleMonitorRename:this.handleMonitorRename,handleMonitorFocus:this.handleMonitorFocus,isOffline:this.store.isOffline})):s.a.createElement(m.default,{searchQuery:this.store.searchQuery,illustration:s.a.createElement(a.IllustrationNoMonitor,null)}):s.a.createElement(h.default,{canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,isOffline:this.store.isOffline}):s.a.createElement(p.default,null),s.a.createElement("div",null,s.a.createElement(d.default,{canAddMonitor:t,createNewMonitor:this.openCreateMonitorTab,store:this.store,isOffline:this.store.isOffline}),o)):s.a.createElement(M.default,null)}render(){return s.a.createElement("div",{className:"monitor-sidebar-tab-content"},this.getRenderedComponent())}})||i;t.default=E},24600:function(e,t,o){"use strict";o.r(t),function(e){var i,n=o(2),s=o.n(n),r=o(24601),a=o(2353),l=o(8314),d=o(7321),c=o(5929),h=o(2754),m=o(8620);const p=new Map;let u=Object(a.observer)(i=class extends n.Component{constructor(t){super(t),this.monitorPermissionStore=new l.default,this.monitorWorkspaceStore=new m.default,this.listItemRefs={},this.focusNext=this.focusNext.bind(this),this.focusPrev=this.focusPrev.bind(this),this.deleteItem=this.deleteItem.bind(this),this.renameItem=this.renameItem.bind(this),this.openMonitorTabDebounced=e.debounce((e=>{this.props.openMonitorTab(e.id,e.name)}),300)}render(){let e=this.props.items.map(((e,t)=>{const o=e.id===this.props.activeMonitorId||void 0,i=this.monitorWorkspaceStore.isCollectionInWorkspace(e.collection),n=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("edit",e.id)&&i,a=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("delete",e.id),l=!this.monitorPermissionStore.isUserLoggedIn()||!!Object(c.getStore)("CurrentUserStore").team,h=!this.monitorPermissionStore.isUserLoggedIn()||this.monitorPermissionStore.can("edit",e.id);return p.set(e.id,{canRename:n,canDelete:a}),s.a.createElement(d.default,{identifier:e.id,key:t},s.a.createElement(r.default,{ref:t=>{this.listItemRefs[e.id]=t},data:e,key:t,selected:o,initiateMonitorDelete:this.props.initiateMonitorDelete,handleMonitorRename:this.props.handleMonitorRename,showLockIcon:h,canRename:n,canDelete:a,canManageRoles:l,isCollectionMoved:!i,isOffline:this.props.isOffline}))}));return s.a.createElement(h.default,{keyMap:pm.shortcuts.getShortcuts(),handlers:this.getKeyMapHandlers()},s.a.createElement("div",{className:"monitor-listing"},e))}getKeyMapHandlers(){return{nextItem:pm.shortcuts.handle("nextItem",this.focusNext),prevItem:pm.shortcuts.handle("prevItem",this.focusPrev),delete:pm.shortcuts.handle("delete",this.deleteItem),rename:pm.shortcuts.handle("rename",this.renameItem)}}focusNext(e){e&&e.preventDefault(),this.focusItem(1)}focusPrev(e){e&&e.preventDefault(),this.focusItem(-1)}focusItem(t){const{items:o,activeMonitorId:i}=this.props;if(!i)return;if(e.isEmpty(o))return;const n=o[(e.findIndex(o,(e=>e.id===i))+t)%o.length];this.props.handleMonitorFocus(n.id),this.openMonitorTabDebounced(n)}deleteItem(){const t=this.props.activeMonitorId;if(!p.get(t).canDelete)return;const o=this.props.items,i=e.find(o,(e=>e.id===t));this.props.initiateMonitorDelete(i.id,i.name)}renameItem(){const t=this.props.activeMonitorId;p.get(t).canRename&&e.invoke(this.listItemRefs,[t,"handleEditName"])}})||i;t.default=u}.call(this,o(2753))},24601:function(e,t,o){"use strict";o.r(t),function(e){var i,n=o(2),s=o.n(n),r=o(2353),a=o(24584),l=o(7307),d=o(24602),c=o(7082),h=o(8312),m=o(8314),p=o(24603),u=o(8621),f=o(8908),M=o(8317);let b=Object(r.observer)(i=class extends n.Component{constructor(e){super(e),this.handleDropdownActionSelect=this.handleDropdownActionSelect.bind(this),this.handleEditName=this.handleEditName.bind(this),this.containerRef=this.containerRef.bind(this),this.handleRenameSubmit=this.handleRenameSubmit.bind(this),this.getRightMetaComponent=this.getRightMetaComponent.bind(this),this.getMonitorMetaIcons=this.getMonitorMetaIcons.bind(this),this.monitorPermissionStore=new m.default}getClassNames(){let t={"monitor-listing-list-item":!0,"monitor-listing-list-item-focussed":this.props.selected};return e.keys(e.pickBy(t,e.identity)).join(" ")}containerRef(e){this.listItem=e}getMonitorRouteConfig(){return{routeIdentifier:"build.monitor",routeParams:{monitorPath:u.default.getMonitorPath({monitorName:this.props.data.name,monitorId:this.props.data.id})}}}handleRenameSubmit(t){e.get(this.props,"data.name")!==t&&this.props.handleMonitorRename({monitorId:this.props.data.id,name:t})}handleEditName(){e.invoke(this.listItem,"editText")}showSignInModal(e){return pm.mediator.trigger("showSignInModal",{type:"generic",subtitle:M.SIGN_IN_MESSAGE.subTitle,origin:`monitors_sidebar_${e}_action`})}handleDropdownActionSelect(e){if(!this.monitorPermissionStore.isUserLoggedIn())return this.showSignInModal(e);switch(e){case"delete":return void this.props.initiateMonitorDelete(this.props.data.id,this.props.data.name);case"manage-roles":return void Object(c.manageRolesOnMonitor)(this.props.data.id);case"rename":return void this.handleEditName()}}getActions(){return[{type:"rename",label:"Rename",shortcut:"rename",isEnabled:this.props.canRename,xpathLabel:"rename"},{type:"manage-roles",label:"Manage Roles",isEnabled:this.props.canManageRoles,disabledMsg:M.SIGN_IN_MESSAGE.default,xpathLabel:"manageRoles"},{type:"delete",label:"Delete",shortcut:"delete",isEnabled:this.props.canDelete,xpathLabel:"delete"}]}getMenuItems(){return e.chain(this.getActions()).map((e=>s.a.createElement(l.MenuItem,{key:e.type,refKey:e.type,disabled:!e.isEnabled||this.props.isOffline},s.a.createElement(h.default,{showTooltip:!e.isEnabled||this.props.isOffline,tooltipText:e.disabledMsg||this.props.isCollectionMoved&&M.PERMISSION_TEXT.COLLECTION_MOVED_MSG,isOffline:this.props.isOffline,monitorId:this.props.data.id,monitorName:this.props.data.name,wrapperPrefix:"monitor-sidebar"},s.a.createElement("span",{className:"monitor-action-item"},s.a.createElement("div",{className:"dropdown-menu-item-label"},e.label),e.shortcut&&s.a.createElement("div",{className:"dropdown-menu-item-shortcut"},Object(f.getShortcutByName)(e.shortcut))))))).value()}dropdownOptions(){const e=this.getMenuItems();return s.a.createElement(l.DropdownMenu,{className:"monitors-dropdown-menu","align-right":!0},e)}getRightMetaComponent(e,t){return s.a.createElement(d.default,{isPaused:this.props.data.isPaused,isHealthy:this.props.data.isHealthy,className:e||t?"":"actions-hidden"})}getMonitorMetaIcons(){return s.a.createElement(p.default,{isEditable:this.props.showLockIcon})}render(){return s.a.createElement(a.default,{text:e.get(this.props,"data.name",""),ref:this.containerRef,isSelected:this.props.selected,onRename:this.handleRenameSubmit,moreActions:this.dropdownOptions(),onActionsDropdownSelect:this.handleDropdownActionSelect,rightMetaComponent:this.getRightMetaComponent,statusIndicators:this.getMonitorMetaIcons,routeConfig:this.getMonitorRouteConfig()})}})||i;t.default=b}.call(this,o(2753))},24603:function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return r}));var i=o(2),n=o.n(i),s=o(9);class r extends i.Component{constructor(e){super(e)}render(){return n.a.createElement(n.a.Fragment,null,!0===this.props.isPublic&&n.a.createElement(s.Icon,{name:"icon-state-published-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"Shared in a public workspace"}),!this.props.isPublic&&!0===this.props.canTeamView&&n.a.createElement(s.Icon,{name:"icon-descriptive-team-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"Shared with team"}),!1===this.props.isEditable&&n.a.createElement(s.Icon,{name:"icon-state-locked-stroke",color:"content-color-tertiary",className:"monitor-meta-icon",size:"small",title:"Read only"}))}}},24604:function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return d}));var i,n=o(2),s=o.n(n),r=o(24586),a=o(2353),l=o(8317);let d=Object(a.observer)(i=class extends n.Component{constructor(e){super(e),this.handleSearch=this.handleSearch.bind(this)}getTooltipText(e,t){return e?l.PERMISSION_TEXT.WORKSPACE_VIEWER_DISABLED:t?l.TOOLTIP_TEXT.isOffline:l.CREATE_NEW_MONITOR}handleSearch(e){this.props.store.setSearchQuery(e)}render(){return s.a.createElement("div",null,s.a.createElement(r.default,{createNewConfig:{tooltip:this.getTooltipText(!this.props.canAddMonitor,this.props.isOffline),disabled:!this.props.canAddMonitor||this.props.isOffline,onCreate:this.props.createNewMonitor,xPathIdentifier:"addMonitor"},onSearch:this.handleSearch,searchQuery:this.props.store.searchQuery}))}})||i},24605:function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return l}));var i=o(2),n=o.n(i),s=o(9),r=o(24588),a=o(8317);class l extends i.Component{constructor(e){super(e)}getTooltipText(e){return this.props.isOffline?a.TOOLTIP_TEXT.isOffline:e?a.PERMISSION_TEXT.WORKSPACE_VIEWER_DISABLED:void 0}render(){const e=this.props.canAddMonitor;return n.a.createElement(r.default,{illustration:n.a.createElement(s.IllustrationNoMonitor,null),title:a.EMPTY_STATE.noMonitorsSetup,message:a.EMPTY_STATE.monitorCollectionRun,action:{label:a.MONITOR_ACTION.create,handler:this.props.createNewMonitor,tooltip:this.getTooltipText(!e)},hasPermissions:!this.props.isOffline&&e})}}},24606:function(e,t,o){"use strict";o.r(t);var i=o(2),n=o.n(i),s=o(7124),r=o(9),a=o(8317);class l extends n.a.Component{render(){return n.a.createElement("div",{className:"monitor-sidebar-error-view"},n.a.createElement("div",{className:"monitor-sidebar-error-view__illustration"},n.a.createElement(r.IllustrationUnableToLoad,null)),n.a.createElement("div",{className:"monitor-sidebar-error-view__title"},n.a.createElement(r.Heading,{type:"h4",color:"content-color-secondary",text:a.MONITOR_ACTION_ERROR.load})),n.a.createElement("div",null,n.a.createElement(s.Button,{className:"btn-small monitor-sidebar-error-view__button",type:"secondary",onClick:this.props.handleRefresh},a.TRY_AGAIN)))}}t.default=l},24607:function(e,t,o){"use strict";o.r(t),o.d(t,"default",(function(){return l}));var i=o(2),n=o.n(i),s=o(9),r=o(24588),a=o(8317);class l extends i.Component{constructor(e){super(e)}render(){return n.a.createElement("div",{className:"monitor-sidebar-offline-state"},n.a.createElement(r.default,{illustration:n.a.createElement(s.IllustrationCheckInternetConnection,null),title:a.OFFLINE_TEXT.text,message:a.OFFLINE_TEXT.subText}))}}}}]);