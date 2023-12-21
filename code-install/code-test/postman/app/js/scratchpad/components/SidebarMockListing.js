(window.webpackJsonp=window.webpackJsonp||[]).push([[32],{24582:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return M}));var s,o=i(2),r=i.n(o),n=i(2353),a=i(10228),c=i(8276),l=i(1656),d=i(9),m=i(5929),h=i(24583),u=i(7124),g=i(11086),p=i(2765),S=i(24586),k=i(11281),b=i(11789),I=i(24588),E=i(7321),f=i(7302),R=i(7319),_=i(7320),y=i(7303),O=i(2754),C=i(6367),v=i(2773);let M=Object(n.observer)(s=class extends o.Component{constructor(t){super(t),this.store=Object(m.getStore)("RequesterSidebarStore"),this.listItemRefs={},this.handleCreate=this.handleCreate.bind(this),this.handleSearchChange=this.handleSearchChange.bind(this),this.handleRetry=this.handleRetry.bind(this),this.successHandler=this.successHandler.bind(this),this.handleRename=this.handleRename.bind(this),this.focusNext=this.focusNext.bind(this),this.focusPrev=this.focusPrev.bind(this),this.handleDeleteShortcut=this.handleDeleteShortcut.bind(this),this.handleRenameShortcut=this.handleRenameShortcut.bind(this),this.scrollToItemById=this.scrollToItemById.bind(this),this.resetFocusedItem=this.resetFocusedItem.bind(this),this.getListContainer=this.getListContainer.bind(this),this.getSidebarEmptyState=this.getSidebarEmptyState.bind(this),this.mockStore=e.get(this.props,"controller.mockListStore"),this.focusReactionDisposer=Object(l.reaction)((()=>this.mockStore.focusedItem||this.mockStore.activeItem),(e=>{e&&requestIdleCallback(this.scrollToItemById.bind(this,e),{timeout:5e3})}),{fireImmediately:!0})}componentWillUnmount(){this.focusReactionDisposer&&this.focusReactionDisposer()}resetFocusedItem(){this.mockStore.resetFocusedItem()}handleRetry(){this.mockStore.reload()}scrollToItemById(t){if(!t)return;const i=e.findIndex(e.get(this.mockStore,"filteredItems"),(e=>e.id===t));i<0||this.listRef&&this.listRef.scrollToItem(i)}successHandler(){this.mockStore.hydrate()}handleRename(e,t){this.mockStore.rename(e,{origin:t})}handleCreate(){g.default.transitionTo("build.mockCreate",{},{},{additionalContext:{origin:"sidebar"}})}handleSearchChange(e){this.mockStore.setSearchQuery(e)}componentDidMount(){pm.mediator.on("refreshSidebarMockListing",this.successHandler)}componentWillUnmount(){pm.mediator.off("refreshSidebarMockListing",this.successHandler)}createMock(){g.default.transitionTo("build.mockCreate",{},{},{additionalContext:{origin:"sidebar_empty_listing"}})}getFilteredMocks(){return this.mockStore.filteredItems}onClickRequestAccess(e,t){p.default.transitionTo(v.ACCESS_REQUEST_CREATE_BUILD_IDENTIFIER,null,{entityId:e,entityName:t,entityType:"mock",type:"grant_role"})}handleDeleteShortcut(){const t=e.get(this.mockStore,"permissions",{}),i=this.mockStore.filteredItems[this.mockStore.focusedItemIndex]||this.mockStore.filteredItems[this.mockStore.activeItemIndex],s=Object(_.hasPermission)(t,i.id,R.DELETE_MOCK);if(Object(m.getStore)("SyncStatusStore").isSocketConnected){if(!Object(m.getStore)("CurrentUserStore").isLoggedIn)return pm.mediator.trigger("showSignInModal",{type:"mock",subtitle:f.NOT_SIGNED_IN_ERROR,origin:"shortcut"});i&&s?pm.mediator.trigger("showDeleteMockModal",i,null,{origin:"shortcut"}):pm.toasts.error(f.PERMISSION_ERROR,{noIcon:!0,primaryAction:{label:"Request Access",onClick:()=>this.onClickRequestAccess(i.id,i.name)}})}else pm.toasts.error(f.OFFLINE_ERROR,{title:"You're Offline"})}handleRenameShortcut(){const t=e.get(this.mockStore,"permissions",{}),i=this.mockStore.filteredItems[this.mockStore.focusedItemIndex]||this.mockStore.filteredItems[this.mockStore.activeItemIndex],s=Object(_.hasPermission)(t,i.id,R.EDIT_MOCK);if(Object(m.getStore)("SyncStatusStore").isSocketConnected){if(!Object(m.getStore)("CurrentUserStore").isLoggedIn)return pm.mediator.trigger("showSignInModal",{type:"mock",subtitle:f.NOT_SIGNED_IN_ERROR,origin:"shortcut"});e.get(i,"active")?i&&s?e.invoke(this.listItemRefs[i.id],"handleEditName",{origin:"shortcut"}):pm.toasts.error(f.PERMISSION_ERROR,{noIcon:!0,primaryAction:{label:"Request Access",onClick:()=>this.onClickRequestAccess(i.id,i.name)}}):pm.toasts.error(f.INACTIVE_MOCK)}else pm.toasts.error(f.OFFLINE_ERROR,{title:"You're Offline"})}getKeyMapHandlers(){return{nextItem:pm.shortcuts.handle("nextItem",this.focusNext),prevItem:pm.shortcuts.handle("prevItem",this.focusPrev),delete:pm.shortcuts.handle("delete",this.handleDeleteShortcut),rename:pm.shortcuts.handle("rename",this.handleRenameShortcut)}}focusNext(e){e&&e.preventDefault(),this.mockStore.focusNext()}focusPrev(e){e&&e.preventDefault(),this.mockStore.focusPrev()}getListItem({index:t,style:i}){const s=this.getFilteredMocks()[t]||{},o=p.default.isActive("build.mock",{mockId:s.id})||p.default.isActive("build.mock",{mockId:s.id},{ctx:"info"})||p.default.isActive("build.mockEdit",{mockId:s.id}),n=e.get(this.mockStore,"permissions",{});return o?this.mockStore.setActiveItem(s.id):this.mockStore.activeItem===s.id&&this.mockStore.resetActiveItem(),r.a.createElement(E.default,{identifier:s.id},r.a.createElement("div",{style:i},r.a.createElement(h.default,{ref:e=>{this.listItemRefs[s.id]=e},key:s.id,mock:s,onRename:this.handleRename,isSelected:this.mockStore.focusedItem===s.id||o,permissions:n,onResetFocusedItem:this.resetFocusedItem})))}getTooltip(){const e=this.canAddMockToWorkspace();return Object(m.getStore)("SyncStatusStore").isSocketConnected?e?"Create mock server":f.PERMISSION_ERROR:f.OFFLINE_ERROR}canAddMockToWorkspace(){const t=Object(m.getStore)("ActiveWorkspacePermissionStore"),i=t&&t.permissions;return!Object(m.getStore)("CurrentUserStore").isLoggedIn||e.get(i,C.WORKSPACE_PERMISSIONS.ADD_MOCK_TO_WORKSPACE,!0)}getSidebarEmptyState(){const e=this.canAddMockToWorkspace(),t=Object(m.getStore)("SyncStatusStore").isSocketConnected;return r.a.createElement(I.default,{illustration:r.a.createElement(d.IllustrationNoMockServer,null),title:"You don’t have any mock servers.",message:"Mock servers let you simulate endpoints and their corresponding responses in a collection without actually setting up a back end.",action:{label:"Create Mock Server",handler:this.createMock,tooltip:this.getTooltip()},hasPermissions:t&&e})}getListContainer(){const e=this.mockStore.values,t=this.getFilteredMocks(),i=this.mockStore.searchQuery;if(this.mockStore.isHydrating)return r.a.createElement(b.default,null);if(0===e.length&&!i)return this.getSidebarEmptyState();if(0===t.length)return r.a.createElement(k.default,{searchQuery:i,illustration:r.a.createElement(d.IllustrationSearch,null)});{const e=e=>r.a.createElement(n.Observer,null,this.getListItem.bind(this,e));return r.a.createElement(a.default,null,(({height:i,width:s})=>r.a.createElement(c.FixedSizeList,{height:i,width:s,itemCount:t.length,ref:e=>{this.listRef=e},itemSize:28,overscanCount:10},e)))}}render(){const e=this.mockStore.errorFetchingMocks,t=this.mockStore.searchQuery,i=this.mockStore.isOffline,s=Object(m.getStore)("SyncStatusStore").isSocketConnected;return i?r.a.createElement(y.default,{origin:"sidebar"}):e?r.a.createElement("div",{className:"sidebar-mock-listing__error__wrapper"},r.a.createElement("div",{className:"sidebar-mock-listing__error"},r.a.createElement(d.IllustrationInternalServerError,null),r.a.createElement("div",{className:"sidebar-mock-listing__error__content"},r.a.createElement("div",{className:"sidebar-mock-listing__error__content__header"},"Something went wrong"),r.a.createElement("div",{className:"sidebar-mock-listing__error__content__sub-header"},"There was an unexpected error loading mock servers. Please try again.")),r.a.createElement(u.Button,{className:"btn-small sidebar-mock-listing__error__retry-button",type:"primary",onClick:this.handleRetry},"Try Again"))):r.a.createElement("div",{className:"sidebar-mock-listing__container"},r.a.createElement(S.default,{createNewConfig:{tooltip:this.getTooltip(),disabled:!this.canAddMockToWorkspace()||!s,onCreate:this.handleCreate,xPathIdentifier:"addMock"},onSearch:this.handleSearchChange,searchQuery:t}),r.a.createElement(O.default,{handlers:this.getKeyMapHandlers()},r.a.createElement("div",{className:"sidebar-mock-listing__container__list"},r.a.createElement(E.default,{identifier:"mock"},this.getListContainer()))))}})||s}.call(this,i(2753))},24583:function(e,t,i){"use strict";i.r(t),function(e){i.d(t,"default",(function(){return O}));var s,o=i(2),r=i.n(o),n=i(2825),a=i.n(n),c=i(9),l=i(2353),d=i(7145),m=i(5929),h=i(7124),u=i(7307),g=i(24584),p=i(7317),S=i(7302),k=i(7319),b=i(7320),I=i(7082),E=i(24585),f=i(7081),R=i(8908),_=i(2778),y=i(6729);let O=Object(l.observer)(s=class extends o.Component{constructor(e){super(e),this.containerRef=this.containerRef.bind(this),this.handleEditName=this.handleEditName.bind(this),this.handleCopyUrl=this.handleCopyUrl.bind(this),this.handleDelete=this.handleDelete.bind(this),this.getMenuItems=this.getMenuItems.bind(this),this.getRightAlignedContainer=this.getRightAlignedContainer.bind(this),this.getActions=this.getActions.bind(this),this.getStatusIndicators=this.getStatusIndicators.bind(this),this.handleDropdownActionSelect=this.handleDropdownActionSelect.bind(this),this.handleRenameSubmit=this.handleRenameSubmit.bind(this),this.handleManageRoles=this.handleManageRoles.bind(this)}handleManageRoles(){_.default.addEventV2({category:"mock",action:"initiate_manage_roles",label:"sidebar",entityId:e.get(this.props,"mock.id")}),Object(I.manageRolesOnMock)(e.get(this.props,"mock.id"),{origin:"sidebar_mock_listing"})}handleDropdownActionSelect(t){if(!Object(m.getStore)("CurrentUserStore").isLoggedIn)return pm.mediator.trigger("showSignInModal",{type:"mock",subtitle:S.NOT_SIGNED_IN_ERROR,origin:"sidebar_mock_listing"});switch(t){case"delete":return void this.handleDelete();case"rename":return void this.handleEditName({origin:"sidebar"});case"manage-roles":return void this.handleManageRoles();case"move":return _.default.addEventV2({category:"mock",action:"initiate_move",label:"sidebar",entityId:e.get(this.props,"mock.id")}),void Object(f.moveMock)(e.get(this.props,"mock.id"),e.get(this.props,"mock.name"),{origin:"mock_sidebar"})}}containerRef(e){this.listItem=e}getMenuItemIconClasses(e){return a()({"dropdown-menu-item-icon":!0},"menu-icon--"+e)}getStatusIndicators(){const t=e.get(this.props,"mock.id"),i=this.props.permissions||{},s=Object(b.hasPermission)(i,t,k.DELETE_MOCK);return!(Object(b.hasPermission)(i,t,k.EDIT_MOCK)&&s)&&r.a.createElement(c.Icon,{name:"icon-state-locked-stroke",color:"content-color-tertiary",className:"mock-status-icon",size:"small",title:"Read only"})}handleDelete(){pm.mediator.trigger("showDeleteMockModal",this.props.mock,null,{origin:"sidebar"})}getMockUrl(){return e.get(this.props,"mock.url","")}handleCopyUrl(){d.default.copy(this.getMockUrl()),pm.toasts.success("Mock URL copied"),_.default.addEventV2({category:"mock",action:"copy_url",label:"sidebar",entityId:e.get(this.props,"mock.id")})}getActions(){const t=Object(m.getStore)("CurrentUserStore"),i=Object(y.canRequestAccess)(),s=e.get(this.props,"mock.id"),o=this.props.permissions||{},r=Object(m.getStore)("SyncStatusStore").isSocketConnected,n=r&&(!t.isLoggedIn||Object(b.hasPermission)(o,s,k.DELETE_MOCK)),a=r&&e.get(this.props,"mock.active")&&(!t.isLoggedIn||Object(b.hasPermission)(o,s,k.EDIT_MOCK)),c=r&&e.get(this.props,"mock.active")&&(!t.isLoggedIn||!!t.team)&&i,l=r&&Object(m.getStore)("FeatureFlagsStore").isEnabled("moveMocks")&&e.get(this.props,"mock.active")&&(!t.isLoggedIn||Object(b.hasPermission)(o,s,k.MOVE_MOCK));let d=[{type:"rename",label:"Rename",isEnabled:a,xpathLabel:"rename",shortcut:"rename"},{type:"manage-roles",label:"Manage Roles",isEnabled:c,xpathLabel:"manageRoles"}];return Object(m.getStore)("FeatureFlagsStore").isEnabled("moveMocks")&&d.push({type:"move",label:"Move",isEnabled:l,xpathLabel:"moveMock"}),d.push({type:"delete",label:"Delete",isEnabled:n,xpathLabel:"delete",shortcut:"delete"}),d}getDisabledText(t,i){if(t){const t=S.PERMISSION_ERROR,s=S.NO_TEAM;if(!e.get(this.props,"mock.active")){if("delete"!==i)return S.INACTIVE_MOCK;if(!(!Object(m.getStore)("CurrentUserStore").isLoggedIn||Object(b.hasPermission)(e.get(this.props,"mockStore.permissions",{}),e.get(this.props,"mock.id"),k.DELETE_MOCK)))return t}if(!Object(m.getStore)("SyncStatusStore").isSocketConnected)return S.OFFLINE_ERROR;if("manage-roles"===i){const i=this.props.permissions||{},o=e.get(this.props,"mock.id");return Object(b.hasPermission)(i,o,k.UPDATE_MOCK_ROLES)&&!Object(m.getStore)("CurrentUserStore").team?s:t}return t}}handleEditName(t={}){this.setState({origin:t.origin},(()=>{_.default.addEventV2({category:"mock",action:"initiate_rename",label:t.origin,entityId:e.get(this.props,"mock.id")})})),e.invoke(this.listItem,"editText")}handleRenameSubmit(t){if(e.get(this.props,"mock.name")===t)return;const i={id:e.get(this.props,"mock.id"),name:t};this.props.onRename(i,this.state.origin),_.default.addEventV2({category:"mock",action:"submit_rename",label:this.state.origin,entityId:e.get(this.props,"mock.id")})}getRouteConfig(){return{routeIdentifier:"build.mock",routeParams:{mockId:e.get(this.props,"mock.id")}}}getOptions(){return{additionalContext:{origin:"sidebar"}}}getMenuItems(){return e.chain(this.getActions()).map((t=>r.a.createElement(u.MenuItem,{key:t.type,refKey:t.type,disabled:!t.isEnabled},r.a.createElement(p.default,{disabledText:!t.isEnabled&&this.getDisabledText(!t.isEnabled,t.type),mockId:e.get(this.props,"mock.id"),mockName:e.get(this.props,"mock.name",""),disabled:!t.isEnabled},r.a.createElement("span",{className:"mock-action-item"},r.a.createElement("div",{className:"dropdown-menu-item-label"},t.label),t.shortcut&&r.a.createElement("div",{className:"dropdown-menu-item-shortcut"},Object(R.getShortcutByName)(t.shortcut))))))).value()}getRightAlignedContainer(t,i){a()({"sidebar-mock-list-item__actions":!0,hovered:t});return t||i?r.a.createElement(r.a.Fragment,null,!e.get(this.props,"mock.active")&&r.a.createElement(E.default,null),r.a.createElement(h.Button,{className:"sidebar-action-btn",tooltip:"Copy Mock URL",type:"icon",onClick:this.handleCopyUrl},r.a.createElement(c.Icon,{name:"icon-action-copy-stroke",className:"pm-icon pm-icon-normal"}))):e.get(this.props,"mock.active")?null:r.a.createElement("div",{className:"inactive-mock-indicator__sidebar_fixed"},r.a.createElement(E.default,null))}getActionsMenuItems(){const e=this.getMenuItems();return r.a.createElement(u.DropdownMenu,{className:"mocks-dropdown-menu","align-right":!0},e)}render(){return r.a.createElement(g.default,{ref:this.containerRef,text:e.get(this.props,"mock.name",""),isSelected:this.props.isSelected,onClick:this.props.onResetFocusedItem,onRename:this.handleRenameSubmit,rightMetaComponent:this.getRightAlignedContainer,moreActions:this.getActionsMenuItems(),statusIndicators:this.getStatusIndicators,onActionsDropdownSelect:this.handleDropdownActionSelect,routeConfig:this.getRouteConfig(),options:this.getOptions()})}})||s}.call(this,i(2753))}}]);