(window.webpackJsonp=window.webpackJsonp||[]).push([[68],{29757:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return m}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(5),l=i(2754),d=i(29758),h=i(29759),c=i(7321),p=i(5929),u=(i(11310),i(11230));i(7103),i(10446),i(11347);let m=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.apiListStore,this.apiSidebarStore,this.focus=this.focus.bind(this),this.focusNext=this.focusNext.bind(this),this.focusPrev=this.focusPrev.bind(this),this.selectItem=this.selectItem.bind(this),this.renameItem=this.renameItem.bind(this),this.handleDeleteShortcut=this.handleDeleteShortcut.bind(this),this.toggleDeleteModal=this.toggleDeleteModal.bind(this),this.onVersionCreate=this.onVersionCreate.bind(this),this.onVersionEdit=this.onVersionEdit.bind(this)}focus(){let e=Object(o.findDOMNode)(this.refs.sidebar);e&&e.focus()}isLoggedIn(){return Object(p.getStore)("CurrentUserStore").isLoggedIn}getKeyMapHandlers(){return{nextItem:pm.shortcuts.handle("nextItem",this.focusNext),prevItem:pm.shortcuts.handle("prevItem",this.focusPrev),select:pm.shortcuts.handle("select",this.selectItem),delete:pm.shortcuts.handle("delete",this.handleDeleteShortcut),rename:pm.shortcuts.handle("rename",this.renameItem)}}focusNext(e){e&&e.preventDefault(),this.apiSidebarStore.focusNext()}focusPrev(e){e&&e.preventDefault(),this.apiSidebarStore.focusPrev()}selectItem(){this.apiSidebarStore.openEditor(this.apiSidebarStore.activeItem)}renameItem(){let e=this.apiSidebarStore.activeItem;if(!this.isLoggedIn())return pm.mediator.trigger("showSignInModal",{type:"rename_API",origin:"API_sidebar",continueUrl:new URL(window.location.href)});e&&this.refs.list.refs[e].handleEditName()}handleDeleteShortcut(){if(!Object(p.getStore)("CurrentUserStore").isLoggedIn)return pm.mediator.trigger("showSignInModal",{type:"delete_API",origin:"API_sidebar",continueUrl:new URL(window.location.href)});let t=this.apiSidebarStore.activeItem,i=t&&e.find(this.apiSidebarStore.sortedAPIs,(e=>e.id===t)).name;t&&i&&this.toggleDeleteModal(t,i)}toggleDeleteModal(t){switch(e.get(t,"type")){case"api":return void pm.mediator.trigger("showAPIDeleteModal",t.id);case"apiVersion":return void pm.mediator.trigger("showAPIVersionDeleteModal",t)}}onVersionEdit(e){pm.mediator.trigger("showAPIVersionEditModal",e)}onVersionCreate(e){pm.mediator.trigger("showCreateAPIVersionModal",{apiId:e})}render(){this.apiSidebarStore=Object(p.getStore)("APISidebarStore"),this.apiListStore=Object(p.getStore)("APIListStore");const e=Object(p.getStore)("SyncStatusStore").isConsistentlyOffline;let t=this.apiSidebarStore.searchQuery;return e&&!this.apiListStore.isLoaded?r.a.createElement(u.default,{origin:"sidebar"}):r.a.createElement(l.default,{handlers:this.getKeyMapHandlers()},r.a.createElement("div",{className:"api-sidebar",ref:"sidebar"},r.a.createElement(d.default,{ref:"menu",apiListStore:this.apiListStore}),r.a.createElement(c.default,{identifier:"api"},r.a.createElement(h.default,{ref:"list",apiListStore:this.apiListStore,apiSidebarStore:this.apiSidebarStore,searchQuery:t,toggleDeleteModal:this.toggleDeleteModal,onVersionCreate:this.onVersionCreate,onVersionEdit:this.onVersionEdit}))))}})||s}.call(this,i(2753))},29758:function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return m}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(5929),l=(i(2825),i(7124),i(2778)),d=(i(9),i(24586)),h=i(11229),c=i(11310),p=i(2765),u=i(11228);let m=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.state={refreshDisabled:!1,isCreateAPIModalOpen:!1},this.getAddIconText=this.getAddIconText.bind(this),this.openCreateAPIModal=this.openCreateAPIModal.bind(this),this.handleSearchChange=this.handleSearchChange.bind(this),this.store=Object(o.getStore)("APISidebarStore")}openCreateAPIModal(){if(!Object(o.getStore)("CurrentUserStore").isLoggedIn)return pm.mediator.trigger("showSignInModal",{type:"createAPI",origin:"API_sidebar",continueUrl:new URL(window.location.href),subtitle:"You need an account to continue exploring Postman."});l.default.addEventV2({category:"api",action:"start_create_flow",label:"sidebar",value:1}),p.default.transitionTo("build.api.new")}getAddIconText(e,t){return e?u.IS_OFFLINE_TOOLTIP_MSG:t?"Create new API":h.API_PERMISSION_ERROR}componentWillUnmount(){clearTimeout(this.enableRefreshTimeout)}handleSearchChange(e){this.store.setSearchQuery(e)}render(){const e=Object(o.getStore)("SyncStatusStore").isSocketConnected,t=e&&!this.props.apiListStore.isCreating,i=(t&&!this.state.refreshDisabled&&this.props.apiListStore.isHydrating,Object(o.getStore)("ActiveWorkspaceStore").id),s=c.default.hasPermission(this.props.apiListStore.permissions,"create","workspace",i);return r.a.createElement(d.default,{createNewConfig:{tooltip:this.getAddIconText(!e,s),disabled:!t||!s,onCreate:this.openCreateAPIModal,xPathIdentifier:"addAPI"},onSearch:this.handleSearchChange,searchQuery:this.store.searchQuery})}})||s},29759:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return m}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(7081),l=i(7082),d=i(7321),h=i(29760),c=i(29762),p=i(11789),u=i(2765);let m=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.handleSelect=this.handleSelect.bind(this),this.handleRename=this.handleRename.bind(this),this.handleExpandToggle=this.handleExpandToggle.bind(this)}handleExpandToggle(t,i){t.id,t.type;const s=e.isUndefined(i)?!t.areChildEntitiesVisible:i;t.update({areChildEntitiesVisible:s}),e.forEach(t.childEntities.values,(e=>{e.update({isVisible:s})}))}handleSelect(e){const t=e.id,i=e.type;if(t)switch(i){case"api":return this.props.apiSidebarStore.openEditor(t),void this.handleExpandToggle(e,!0);case"apiVersion":return void u.default.transitionTo("build.apiVersion",{apiId:`${e.parentEntityId}`,versionId:`${t}`})}}handleRename(t,i,s){let n;switch(t.type){case"api":return n=t.id,void this.props.apiListStore.rename(n,s).catch((()=>{e.invoke(this.refs,`${n}.listItem.inlineInput.setState`,{value:i})}));case"apiVersion":{n=t.parentEntityId;const r=this.props.apiListStore.find(n),a=t.id;return void e.get(r,"childEntities").renameAPIVersion(n,a,s).catch((()=>e.invoke(this.refs,`${a}.listItem.inlineInput.setState`,{value:i})))}}}renderAPIEntitiesGroup(t,i){if(t.isVisible)return r.a.createElement(r.a.Fragment,{key:t.id},r.a.createElement(d.default,{identifier:t.id,key:t.id},r.a.createElement(h.default,{ref:t.id,key:t.id,id:t.id,name:t.name,type:t.type,visibility:t.visibility,editable:t.isEditable,isPublic:t.isPublic,shared:Boolean(t.team),selected:i.activeItem===t.id,entity:t,onSelect:this.handleSelect,onExpandToggle:this.handleExpandToggle,onRename:this.handleRename,onDelete:this.props.toggleDeleteModal,onShare:o.shareAPI,onMove:o.moveAPI,onManageRole:l.manageRolesOnAPI,onRemoveFromWorkspace:this.props.toggleRemoveFromWSModal,onVersionCreate:this.props.onVersionCreate,onVersionEdit:this.props.onVersionEdit})),e.map(t.childEntities.values,(e=>this.renderAPIEntitiesGroup(e,i))))}render(){const t=this.props.apiSidebarStore,i=t.sortedAPIs;return e.get(this.props,"apiListStore.isStoreHydrating")?r.a.createElement("div",{className:"api-sidebar-list is-empty"},r.a.createElement(p.default,null)):e.isEmpty(i)?r.a.createElement("div",{className:"api-sidebar-list is-empty"},r.a.createElement(c.default,{query:this.props.searchQuery,apiListStore:this.props.apiListStore})):r.a.createElement("div",{className:"api-sidebar-list"},e.map(i,(e=>this.renderAPIEntitiesGroup(e,t))))}})||s}.call(this,i(2753))},29760:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return M}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(5),l=i(11346),d=i(6795),h=i(6906),c=i(24584),p=i(5929),u=i(7307),m=i(11363),g=i(2765),b=i(11227),S=i(11310),E=i(8908),I=i(11229),f=(i(11228),i(7124)),P=i(9),A=i(29761),y=i(7121),C=i(6903),v=i(2825),O=i.n(v);const _={api:0,apiVersion:1},L={api:"versions"};let M=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.state={isEntityGroupOpen:!1},this.handleEditName=this.handleEditName.bind(this),this.handleRenameSubmit=this.handleRenameSubmit.bind(this),this.handleDropdownActionSelect=this.handleDropdownActionSelect.bind(this),this.openAPIInNewTab=this.openAPIInNewTab.bind(this),this.getStatusIndicators=this.getStatusIndicators.bind(this),this.containerRef=this.containerRef.bind(this),this.handleClick=this.handleClick.bind(this),this.handleOpenChildGroup=this.handleOpenChildGroup.bind(this),this.renderEmptyList=this.renderEmptyList.bind(this),this.getLeftMetaIconClasses=this.getLeftMetaIconClasses.bind(this)}componentDidMount(){this.setState({isEntityGroupOpen:e.get(this.props,"entity.areChildEntitiesVisible")}),this.unsubscribeHandler=d.default.subscribe(h.SAMPLE_API_IMPORT,(t=>{const i=e.get(t,"data.id");this.openAPIInNewTab(i)}))}componentWillUnmount(){this.unsubscribeHandler&&this.unsubscribeHandler()}getLeftMetaIconClasses(){const t="apiVersion"===e.get(this.props,"type"),i=e.get(this.props.entity,"relationsStore.isLoading"),s=e.get(this.props.entity,"relationsStore.collectionListModel"),n=!i&&!e.isEmpty(e.get(s,"items")),r=e.get(this.props.entity,"workbenchModel.featureBranch.collectionListModel"),a=!t||r||i||n;return O()({"is-left-meta-visible":a,"is-left-meta-not-visible":!a})}openAPIInNewTab(e){g.default.transitionTo("build.api",{apiId:e},{},{additionalContext:{isNew:!0}})}componentDidUpdate(e){if(!e.selected&&this.props.selected){let e=Object(o.findDOMNode)(this.listItem);e&&e.scrollIntoViewIfNeeded&&e.scrollIntoViewIfNeeded()}}containerRef(e){this.listItem=e}handleClick(){this.setState({isEntityGroupOpen:!0}),this.props.onSelect&&this.props.onSelect(this.props.entity)}handleDropdownActionSelect(e){if(!this.shouldBlockAction(e))switch(e){case l.ACTION_TYPE_CREATE_VERSION:return void this.props.onVersionCreate(this.props.id);case l.ACTION_TYPE_SHARE:return void this.props.onShare(this.props.id);case l.ACTION_TYPE_MOVE:return void this.props.onMove(this.props.id,this.props.name);case l.ACTION_TYPE_MANAGE_ROLES:return void this.props.onManageRole(this.props.id);case l.ACTION_TYPE_DELETE:return void this.props.onDelete(this.props.entity);case l.ACTION_TYPE_RENAME:return void this.handleEditName();case"edit":return void this.props.onVersionEdit(this.props.entity)}}handleEditName(){e.invoke(this.listItem,"editText")}shouldBlockAction(e){return!Object(p.getStore)("CurrentUserStore").isLoggedIn&&(pm.mediator.trigger("showSignInModal",{type:`${e}_API`,origin:"API_sidebar",continueUrl:new URL(window.location.href)}),!0)}handleRenameSubmit(e){Object(p.getStore)("SyncStatusStore").isSocketConnected?this.props.onRename(this.props.entity,this.props.name,e):pm.toasts.error("Get online to perform this action")}getStatusIndicators(){const e="apiVersion"===this.props.type&&"private"===this.props.visibility;return r.a.createElement(m.default,{isPublic:this.props.isPublic,isShared:this.props.shared,isEditable:this.props.editable,isAPIVersionPrivate:e})}getActions(){let t=!Object(p.getStore)("SyncStatusStore").isSocketConnected;const i=Object(p.getStore)("APIListStore").permissions,s=!!Object(p.getStore)("CurrentUserStore").team,n=s&&!Object(C.isPublicUserForWorkspace)(),r=S.default.hasPermission(i,"rename","api",this.props.id),a=S.default.hasPermission(i,"delete","api",this.props.id),o=S.default.hasPermission(i,"share","api",this.props.id),d=S.default.hasPermission(i,"createAPIVersion","api",this.props.id);switch(e.get(this.props,"type")){case"api":return[{type:l.ACTION_TYPE_CREATE_VERSION,label:"Create version",isDisabled:t||!d,hasPermission:d},{type:l.ACTION_TYPE_SHARE,label:"Share",isDisabled:t||!o,hasPermission:o},{type:l.ACTION_TYPE_MOVE,label:"Move",isDisabled:t,hasPermission:!0},{type:l.ACTION_TYPE_MANAGE_ROLES,label:"Manage Roles",isDisabled:t||!n,disabledText:!t&&!s&&I.MANAGE_ROLES_DISABLED_TEXT,hasPermission:n},{type:l.ACTION_TYPE_RENAME,label:"Rename",isDisabled:t||!r,hasPermission:r,shortcut:"rename"},{type:l.ACTION_TYPE_DELETE,label:"Delete",isDisabled:t||!a,shortcut:"delete"}];case"apiVersion":const h=e.get(this.props.entity,"parentEntityId"),c=S.default.hasPermission(i,"renameAPIVersion","api",h),p=S.default.hasPermission(i,"editAPIVersion","api",h),u=S.default.hasPermission(i,"delete","api",h);return[{type:l.ACTION_TYPE_RENAME,label:"Rename",isDisabled:t||!c,hasPermission:c},{type:"edit",label:"Edit",isDisabled:t||!p,hasPermission:p},{type:l.ACTION_TYPE_DELETE,label:"Delete",isDisabled:t||!u,hasPermission:u}]}}getMenuItems(){return e.chain(this.getActions()).map((e=>r.a.createElement(u.MenuItem,{key:e.type,refKey:e.type,disabled:e.isDisabled,disabledText:Object(b.default)(e.isDisabled,!e.hasPermission,e.disabledText)},r.a.createElement("span",{className:"api-action-item"},r.a.createElement("div",{className:"dropdown-menu-item-label"},e.label),e.shortcut&&r.a.createElement("div",{className:"dropdown-menu-item-shortcut"},Object(E.getShortcutByName)(e.shortcut)))))).value()}getActionsMenuItems(){const e=this.getMenuItems();return r.a.createElement(u.DropdownMenu,{className:"api-dropdown-menu","align-right":!0},e)}handleOpenChildGroup(e){e.stopPropagation(),this.setState((e=>({isEntityGroupOpen:!e.isEntityGroupOpen}))),this.props.onExpandToggle(this.props.entity)}renderLeftArrow(t,i){return r.a.createElement("div",{className:"api-sidebar-list__item__left-section"},e.times(_[e.get(this.props,"type")],(()=>r.a.createElement("div",{className:"api-sidebar-list__item__left-section__indent"}))),r.a.createElement("div",{className:this.getLeftMetaIconClasses()},r.a.createElement(f.Button,{type:"icon",className:"api-sidebar-list__item__left-section__toggle-list",onClick:this.handleOpenChildGroup},r.a.createElement(P.Icon,{name:e.get(this.state,"isEntityGroupOpen")?"icon-direction-down":"icon-direction-right"}))))}renderEmptyList(){const t=this.props.entity,i=e.isEmpty(e.get(t,"childEntities.values",[])),s=e.get(L,`[${this.props.type}]`),n=`No ${s} to show`;if(!(!i||!e.get(this.state,"isEntityGroupOpen")||!s))return r.a.createElement("div",{className:"api-sidebar-list__item__empty-state"},n)}renderCollectionList(){const t=this.props.entity,i=e.get(t,"workbenchModel.featureBranch.collectionListModel"),s="apiVersion"!==e.get(this.props,"type"),n=!e.get(this.state,"isEntityGroupOpen"),a=e.get(t,"relationsStore.isLoading"),o=e.get(t,"relationsStore.collectionListModel"),l=!a&&e.isEmpty(e.get(o,"items"));return s||n||l?null:i?r.a.createElement(A.default,{model:e.get(t,"workbenchModel.featureBranch.collectionListModel")}):a?r.a.createElement("div",{className:"collection-list__loading-indicator"},r.a.createElement(y.default,null)):r.a.createElement(A.default,{model:e.get(t,"relationsStore.collectionListModel"),originSidebar:"API"})}render(){const t="apiVersion"===e.get(this.props,"type")?r.a.createElement(P.IconDescriptiveVersionsStroke,null):null;this.props.entity;return r.a.createElement(r.a.Fragment,null,r.a.createElement(c.default,{ref:this.containerRef,icon:t,text:this.props.name,isSelected:this.props.selected,onClick:this.handleClick,onRename:this.handleRenameSubmit,statusIndicators:this.getStatusIndicators,moreActions:this.getActionsMenuItems(),onActionsDropdownSelect:this.handleDropdownActionSelect,leftMetaComponent:this.renderLeftArrow.bind(this)}),this.renderCollectionList(),this.renderEmptyList())}})||s}.call(this,i(2753))},29761:function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return l}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(24645);let l=Object(a.observer)(s=class extends n.Component{render(){const{model:e,originSidebar:t}=this.props;return e?r.a.createElement(o.default,{isNested:!0,model:e,originSidebar:t}):null}})||s},29762:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return S}));var s,n=i(2),r=i.n(n),a=i(2353),o=i(9),l=(i(7124),i(5929)),d=i(7121),h=i(2778),c=i(8343),p=i(24588),u=i(11281),m=i(2765),g=i(11310),b=i(11227);let S=Object(a.observer)(s=class extends n.Component{constructor(e){super(e),this.state={isCreateAPIModalOpen:!1},this.handleOffline=this.handleOffline.bind(this),this.handleLoggedOut=this.handleLoggedOut.bind(this),this.getComponent=this.getComponent.bind(this),this.openCreateAPIModal=this.openCreateAPIModal.bind(this)}openCreateAPIModal(){h.default.addEventV2({category:"api",action:"start_create_flow",label:"sidebar",value:1}),m.default.transitionTo("build.api.new")}handleOffline(){this.props.apiListStore.reload()}handleLoggedOut(){c.default.initiateLogin()}getComponent(t,i,s,n){const a=!e.get(Object(l.getStore)("SyncStatusStore"),"isSocketConnected"),h=e.get(Object(l.getStore)("ActiveWorkspaceStore"),"id"),c=g.default.hasPermission(this.props.apiListStore.permissions,"create","workspace",h),u=!a&&!e.get(this.props,"apiListStore.isCreating")&&c;return r.a.createElement(p.default,{illustration:r.a.createElement(o.IllustrationNoAPI,null),title:t,message:i,action:{label:r.a.createElement("span",null,this.props.apiListStore.isCreating?r.a.createElement(d.default,null):s),handler:n,tooltip:Object(b.default)(!u,!c)},hasPermissions:u})}getContent(){let t=!Object(l.getStore)("CurrentUserStore").isLoggedIn,i=(Object(l.getStore)("SyncStatusStore").isSocketConnected,""),s="",n="";return t?(i="Sign in to create APIs",s="APIs define related collections and environments under a consistent schema.",n="Sign in to create APIs",this.getComponent(i,s,n,this.handleLoggedOut)):this.props.query&&e.isEmpty(this.props.apiListStore.sortedAPIs)?r.a.createElement(u.default,{searchQuery:this.props.query,illustration:r.a.createElement(o.IllustrationNoAPI,null)}):(i="No APIs yet",s="APIs define related collections and environments under a consistent schema.",n="Create an API",r.a.createElement(r.a.Fragment,null,this.getComponent(i,s,n,this.openCreateAPIModal)))}render(){return this.getContent()}})||s}.call(this,i(2753))}}]);