(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{19378:function(e,t,s){"use strict";s.r(t),s.d(t,"default",(function(){return o}));var a=s(2),r=s.n(a),i=s(1662),n=s(19379);class o extends a.Component{constructor(e){super()}render(){const e=Object(i.getStore)("ArtemisBlanketStore"),t=e.identifier,s=n.default[t];if(s)return r.a.createElement(s,e.state)}}},19379:function(e,t,s){"use strict";s.r(t);var a=s(19380),r=s(19381),i=s(19382),n=s(19383);const o={unjoinedWorkspace:a.default,workspaceNotFound:r.default,entityShare:i.default,error:n.default};t.default=o},19380:function(e,t,s){"use strict";s.r(t),function(e){s.d(t,"default",(function(){return h}));var a=s(2),r=s.n(a),i=s(1656),n=s(2373),o=s(5795),c=s(1908),p=s(1662),l=s(1661),d=s(1906);class h extends a.Component{constructor(e){super(e),this.state={isJoining:!1},this.handleBrowseWorkspace=this.handleBrowseWorkspace.bind(this),this.handleWorkspaceJoin=this.handleWorkspaceJoin.bind(this)}handleBrowseWorkspace(){Object(o.openWorkspace)(this.props.workspaceId)}handleWorkspaceJoin(){if(!this.props.workspaceId)return;let t=Object(l.createEvent)("join","workspace",{model:"workspace",workspace:{id:this.props.workspaceId}});this.setState({isJoining:!0}),Object(c.default)(t).then((()=>{this.workspaceStoreReaction=Object(i.reaction)((()=>Object(p.getStore)("WorkspaceStore").find(this.props.workspaceId)),(t=>{if(e.isEmpty(t))return this.setState({isJoining:!1}),this.workspaceStoreReaction&&this.workspaceStoreReaction();this.setState({isJoining:!1},(()=>{d.default.switchWorkspace(t.id).then((()=>(Object(p.getStore)("ArtemisBlanketStore").clearState(),this.workspaceStoreReaction&&this.workspaceStoreReaction())))}))}),{fireImmediately:!0})})).catch((e=>{this.setState({isJoining:!1})}))}render(){return r.a.createElement("div",{className:"artemis-workspace-join"},r.a.createElement("div",{className:"artemis-workspace-join__background"}),r.a.createElement("div",{className:"artemis-workspace-join__title"},"Join this workspace"),r.a.createElement("div",{className:"artemis-workspace-join__description"},"To work with any of the items in this workspace, first join the workspace."),r.a.createElement(n.Button,{className:"artemis-workspace-join__join-btn",type:"primary",onClick:this.handleWorkspaceJoin,disabled:this.state.isJoining},"Join Workspace"),r.a.createElement(n.Button,{className:"artemis-workspace-join__browse-btn",type:"text",onClick:this.handleBrowseWorkspace},"Browse Workspace"))}}}.call(this,s(574))},19381:function(e,t,s){"use strict";s.r(t),function(e){s.d(t,"default",(function(){return c}));var a=s(2),r=s.n(a),i=s(2373),n=s(5795),o=s(1662);class c extends a.Component{constructor(e){super(e),this.handleViewWorkspaces=this.handleViewWorkspaces.bind(this)}handleViewWorkspaces(){let t=e.get(Object(o.getStore)("CurrentUserStore"),"organizations.[0]")?"team":"personal";Object(n.openWorkspaces)(t)}render(){return r.a.createElement("div",{className:"artemis-workspace-not-found"},r.a.createElement("div",{className:"artemis-workspace-not-found__background"}),r.a.createElement("div",{className:"artemis-workspace-not-found__title"},"Workspace not found"),r.a.createElement("div",{className:"artemis-workspace-not-found__description"},"We can't find this workspace, make sure this isn't a private/personal workspace or it hasn't been deleted."),r.a.createElement(i.Button,{className:"artemis-workspace-not-found__view-workspaces-btn",type:"primary",onClick:this.handleViewWorkspaces},"View All Workspaces"))}}}.call(this,s(574))},19382:function(e,t,s){"use strict";s.r(t),function(e){s.d(t,"default",(function(){return E}));var a,r,i=s(2),n=s.n(i),o=s(1656),c=s(2353),p=s(2373),l=s(2844),d=s(1662),h=s(5863),m=s(3148),k=s(2357),w=s.n(k),u=s(1661),y=s(1908),f=s(5184),_=s(1859);let E=Object(c.observer)((r=class extends i.Component{constructor(e){super(e),this.state={selectedWorkspace:null,isJoining:!1,isSharing:!1,joiningWorkspaceId:""},this.workspaceStore=Object(d.getStore)("WorkspaceStore"),this.handleWorkspaceJoin=this.handleWorkspaceJoin.bind(this),this.handleWorkspaceSelect=this.handleWorkspaceSelect.bind(this),this.handleShareEntity=this.handleShareEntity.bind(this),this.handleViewEntity=this.handleViewEntity.bind(this),this.postJoinWorkspace=this.postJoinWorkspace.bind(this)}postJoinWorkspace(t){let s=e.find(Object(d.getStore)("ArtemisBlanketStore").state.workspaces,["id",t]);e.set(s,"state.isMember",!0)}handleWorkspaceJoin(e){if(!e)return;let t=Object(u.createEvent)("join","workspace",{model:"workspace",workspace:{id:e}});this.setState({isJoining:!0,joiningWorkspaceId:e}),Object(y.default)(t).then((()=>{this.setState({isJoining:!1,joiningWorkspaceId:""},(()=>this.postJoinWorkspace(e)))})).catch((e=>{this.setState({isJoining:!1,joiningWorkspaceId:""})}))}handleWorkspaceSelect(t){this.setState({selectedWorkspace:e.find(this.props.workspaces,{id:t})})}handleShareEntity(){this.setState({isSharing:!0});let t=Object(d.getStore)("ActiveWorkspaceStore").id,s=[{entityType:this.props.entityType,entityId:this.props.entityId,workspaceId:t}];return _.default.modifyDependencies(s,null,null,{fromId:e.get(Object(d.getStore)("ActiveWorkspaceStore"),"id")}).then((()=>Promise.resolve().then((()=>e.isFunction(this.props.postShareHandler)?this.props.postShareHandler(this.props.entityId,t):this.props.viewEntityHandler(this.props.entityId,t))).then((()=>this.setState({isSharing:!1}))).catch((e=>this.setState({isSharing:!1}))))).catch((e=>this.setState({isSharing:!1})))}handleViewEntity(){return e.isFunction(this.props.viewEntityHandler)&&this.props.viewEntityHandler(this.props.entityId,e.get(this.state.selectedWorkspace,"id"))}render(){const t=f.ENTITY_MAP[this.props.entityType],s=this.props.entityName,a=Object(d.getStore)("ActiveWorkspaceStore").name,r=this.props.isCanonicalURL;return this.props.workspaces&&r&&1===this.props.workspaces.length?(e.isFunction(this.props.viewEntityHandler)&&this.props.viewEntityHandler(this.props.entityId,e.get(this.props.workspaces,"[0].id")),null):n.a.createElement("div",{className:"artemis-workspace-share-entity"},n.a.createElement("div",{className:"artemis-workspace-share-entity__background"}),!this.props.isCanonicalURL&&n.a.createElement(n.a.Fragment,null,n.a.createElement("div",{className:"artemis-workspace-share-entity__title"},t," not in this workspace"),n.a.createElement("div",{className:"artemis-workspace-share-entity__description"},"The ",n.a.createElement("span",{className:"artemis-workspace-share-entity__description-entity-name"},s," "),t," is not present in the",n.a.createElement("span",{className:"artemis-workspace-share-entity__description-workspace-name"}," ",a)," workspace."),n.a.createElement(p.Button,{className:"artemis-workspace-share-entity__share-btn",type:"primary",onClick:this.handleShareEntity},this.state.isSharing?n.a.createElement(m.default,null):`Share ${t} to this workspace`)),!e.isEmpty(this.props.workspaces)&&n.a.createElement("div",{className:"artemis-workspace-share-entity__workspace-action"},n.a.createElement("div",{className:"artemis-workspace-share-entity__workspace-action-text"},"or ",n.a.createElement("br",null),"View ",t," in a ",r?"":"different ","workspace"),n.a.createElement("div",{className:"artemis-workspace-share-entity__workspace-action-actions"},n.a.createElement(l.Dropdown,{className:"artemis-workspace-share-entity__dropdown",onSelect:this.handleWorkspaceSelect},n.a.createElement(l.DropdownButton,{className:"artemis-workspace-share-entity__dropdown-btn",type:"secondary",size:"small"},n.a.createElement(p.Button,null,e.get(this.state.selectedWorkspace,"name","Select workspace"))),n.a.createElement(l.DropdownMenu,{fluid:!0,className:"artemis-workspace-share-entity__dropdown-menu"},e.map(this.props.workspaces,(t=>{let s=!e.get(t,"state.isMember",!1);return n.a.createElement(l.MenuItem,{className:"artemis-workspace-share-entity__workspace-item",key:t.id,refKey:t.id,disabled:s},n.a.createElement("div",{className:w()("artemis-workspace-share-entity__workspace-list",{unjoined:s})},n.a.createElement("div",{className:w()("artemis-workspace-share-entity__workspace",{unjoined:s})},n.a.createElement(h.default,{icon:"icon-entity-workspaces-stroke"}),n.a.createElement("div",{className:"artemis-workspace-share-entity__workspace-name"},t.name)),s&&(this.state.isJoining&&t.id===this.state.joiningWorkspaceId?n.a.createElement(m.default,null):n.a.createElement(p.Button,{className:"artemis-workspace-share-entity__join-btn",type:"text",onClick:()=>{this.handleWorkspaceJoin(t.id)}},"Join"))))})))),n.a.createElement(p.Button,{className:"artemis-workspace-share-entity__view-btn",type:"secondary",onClick:this.handleViewEntity},"View ",t))))}},S=r.prototype,b="postJoinWorkspace",W=[o.action],v=Object.getOwnPropertyDescriptor(r.prototype,"postJoinWorkspace"),g=r.prototype,j={},Object.keys(v).forEach((function(e){j[e]=v[e]})),j.enumerable=!!j.enumerable,j.configurable=!!j.configurable,("value"in j||j.initializer)&&(j.writable=!0),j=W.slice().reverse().reduce((function(e,t){return t(S,b,e)||e}),j),g&&void 0!==j.initializer&&(j.value=j.initializer?j.initializer.call(g):void 0,j.initializer=void 0),void 0===j.initializer&&(Object.defineProperty(S,b,j),j=null),a=r))||a;var S,b,W,v,g,j}.call(this,s(574))},19383:function(e,t,s){"use strict";s.r(t),s.d(t,"default",(function(){return p}));var a=s(2),r=s.n(a),i=s(2373),n=s(1863),o=s(1870);function c(){return n.default.transitionTo(o.ALL_WORKSPACES_IDENTIFIER)}function p(){return r.a.createElement("div",{className:"artemis-workspace-error-state"},r.a.createElement("div",{className:"artemis-workspace-error-state__background"}),r.a.createElement("div",{className:"artemis-workspace-error-state__title"},"Something Went Wrong"),r.a.createElement("div",{className:"artemis-workspace-error-state__description"},"Postman has encountered an error. If this problem persists, contact us at help@postman.com"),r.a.createElement(i.Button,{className:"artemis-workspace-error-state__switch-btn",type:"primary",onClick:c},"Go to Workspaces"))}}}]);