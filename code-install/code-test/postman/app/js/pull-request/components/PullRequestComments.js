(window.webpackJsonp=window.webpackJsonp||[]).push([[109],{"./version-control/pull-request/components/PullRequestComments.js":function(e,t,s){"use strict";s.r(t),function(e){s.d(t,"EmptyState",(function(){return S})),s.d(t,"default",(function(){return j}));var o,n=s("../../node_modules/react/index.js"),i=s.n(n),r=s("../../node_modules/@postman/aether/esmLib/index.js"),a=s("../../node_modules/mobx-react/dist/mobx-react.module.js"),m=s("../../node_modules/mobx/lib/mobx.module.js"),l=s("./node_modules/@postman/react-click-outside/dist/index.js"),c=s.n(l),d=(s("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),s("./js/models/services/DashboardService.js")),h=s("./version-control/pull-request/services/CommentsService.js"),p=s("./js/components/comments/CommentContainer.js"),u=s("./js/stores/get-store.js"),g=s("./appsdk/contextbar/ContextBarViewHeader.js"),y=s("./js/components/base/LoadingIndicator.js"),C=s("./js/components/base/Buttons.js"),b=s("./js/components/base/Text.js"),E=s("./js/utils/UserHelper.js");function f(){return f=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var o in s)Object.prototype.hasOwnProperty.call(s,o)&&(e[o]=s[o])}return e},f.apply(this,arguments)}function S(e){return i.a.createElement("div",{className:"pull-request-container__empty-state"},i.a.createElement("div",{className:"sidebar-empty-state__icon-container"},i.a.createElement(r.Icon,{className:"sidebar-empty-state__icon",size:"large",color:"content-color-tertiary",name:e.icon})),i.a.createElement("div",{className:"sidebar-empty-state__title"},i.a.createElement("h4",null,e.title)),i.a.createElement("div",{className:"sidebar-empty-state__body"},i.a.createElement(b.default,{type:"body-medium",value:e.message})))}let j=Object(a.observer)(o=c()(o=class extends n.Component{constructor(t){super(t),this.state={input:"",open:t.open,creating:!1,updating:[],deleting:[],loadError:null,deleteError:null,updateError:null,creatorDetails:null,loading:this.props.loadingComments,comments:{},hasError:!1,showEntityComments:!1,showPullRequestComments:e.get(this.props,"contextData.showComments"),modelId:e.get(this.props,"contextData.modelId")||this.props.modelId,model:e.get(this.props,"contextData.model")||this.props.model,anchor:this.props.anchor},this.handleFocus=this.handleFocus.bind(this),this.handleFetch=this.handleFetch.bind(this),this.handleUpdate=this.handleUpdate.bind(this),this.handleCreate=this.handleCreate.bind(this),this.handleRetry=this.handleRetry.bind(this),this.handleDelete=this.handleDelete.bind(this),this.setListRef=this.setListRef.bind(this),this.parseError=this.parseError.bind(this),this.parseTags=this.parseTags.bind(this),this.isOnline=this.isOnline.bind(this),this.initiate=this.initiate.bind(this),this.handleClickOutside=this.handleClickOutside.bind(this),this.handleHideComments=this.handleHideComments.bind(this),this.toggleEntityComments=this.toggleEntityComments.bind(this),this.processComments=this.processComments.bind(this)}componentDidMount(){this.props.entityComments?this.processComments(this.props.comments):this.initiate()}initiate(){this.fetchCommentDisposer=Object(m.reaction)((()=>Object(u.getStore)("SyncStatusStore").isSocketConnected),(e=>{e&&this.handleFetch()}),{fireImmediately:!0})}componentWillUnmount(){this.fetchCommentDisposer&&this.fetchCommentDisposer()}UNSAFE_componentWillReceiveProps(t){(!this.props.loading&&t.loading||this.props.loading&&!t.loading)&&this.setState({loading:t.loading}),(e.get(this.props,"comments.comments")||[]).length>0&&this.processComments(this.props.comments)}handleClickOutside(){this.handleHideComments()}toggleEntityComments(){this.setState((e=>({showEntityComments:!e.showEntityComments})))}handleHideComments(){this.state.showEntityComments&&this.setState({showEntityComments:!1})}scrollToEnd(){if(!this.listRef)return;const e=this.listRef.scrollHeight-this.listRef.clientHeight;this.listRef.scrollTop=e>0?e:0}handleFocus(){this.props.focusRightOverlay&&this.props.focusRightOverlay()}parseTags(t,s){return t?Object.keys(t).reduce(((o,n)=>(o[n]=f({},t[n]||{},{id:`${e.get(t,[n,"id"])}`,userDetails:e.get(s,e.get(t,[n,"id"]))}),o)),{}):null}parseError(e){return e?e.message:""}isOnline(){return Object(u.getStore)("SyncStatusStore").isSocketConnected}setListRef(e){this.listRef=e}handleUpdate(t){if(this.isOnline())return this.setState((s=>({updating:e.union(s.updating,[t.id])}))),h.default.updateComment(t.id,t.body,t.tags).then((s=>{this.setState((o=>({hasError:!1,updating:e.remove(o.updating,t.id),comments:f({},this.state.comments||{},{[e.get(s,"comment.id")]:f({},this.state.comments[e.get(s,"comment.id")],{body:e.get(s,"comment.body"),tags:this.parseTags(e.get(s,"comment.tags")),updatedAt:e.get(s,"comment.updatedAt")})})}))),this.handleFocus()})).catch((s=>{pm.toasts.error(this.parseError(s)||"更新评论时发生错误.",{title:"无法保存评论"}),this.setState((o=>({hasError:!0,updating:e.remove(o.updating,t.id),updatingError:this.parseError(s)}))),this.handleFocus()}));pm.toasts.error("您需要在线才能更新评论.")}handleCreate(t,s){this.isOnline()?(this.setState({creating:!0}),h.default.createComment(this.state.model,this.state.modelId,t,s,this.state.anchor||e.get(this.props,"contextData.anchor")).then((t=>{this.setState({hasError:!1,creating:!1,comments:f({},this.state.comments||{},{[e.get(t,"comment.id")]:{body:e.get(t,"comment.body"),tags:this.parseTags(e.get(t,"comment.tags")),id:e.get(t,"comment.id"),updatedAt:e.get(t,"comment.updatedAt"),createdAt:e.get(t,"comment.createdAt"),createdBy:e.get(t,"comment.createdBy"),creatorDetails:{friendly:Object(u.getStore)("CurrentUserStore").name||Object(u.getStore)("CurrentUserStore").username||Object(u.getStore)("CurrentUserStore").email,id:Object(u.getStore)("CurrentUserStore").id,profilePicUrl:Object(u.getStore)("CurrentUserStore").profile_pic_url}}})},this.scrollToEnd)})).catch((e=>{this.setState({creating:!1,hasError:!0}),pm.toasts.error(this.parseError(e)||"创建评论时发生错误.",{title:"无法保存评论"})}))):pm.toasts.error("您需要联网才能评论.")}handleDelete(t){if(this.isOnline())return this.setState((s=>({deleting:e.union(s.deleting,[t])}))),h.default.deleteComment(t).then((()=>{this.setState((s=>({deleting:e.remove(s.deleting,t),comments:e.omit(this.state.comments,[t])}))),this.handleFocus()})).catch((s=>{this.setState((o=>({deleting:e.remove(o.deleting,t),deletingError:this.parseError(s)}))),pm.toasts.error(this.parseError(s)||"删除评论时发生错误."),this.handleFocus()}));pm.toasts.error("您需要在线才能删除评论.")}processComments(t,s){const o=(t.comments||[]).filter((t=>t.anchor===this.state.anchor||e.get(this.props,"contextData.anchor")));this.setState(f({comments:o&&o.reduce(((e,s)=>(t.createdBy&&t.createdBy[s.createdBy]&&(e[s.id]=Object.assign(s,{tags:this.parseTags(s.tags,t.users),creatorDetails:f({},t.createdBy[s.createdBy],{friendly:t.createdBy[s.createdBy].friendly||t.createdBy[s.createdBy].username||t.createdBy[s.createdBy].email,id:`${t.createdBy[s.createdBy].id}`,profilePicUrl:t.createdBy[s.createdBy].profilePicUrl})})),e)),{}),updating:o,deleting:o},s),this.scrollToEnd),this.handleFocus()}handleFetch(){const{showEntityComments:t}=this.state;this.setState({loading:!0,loadError:null,showEntityComments:!1}),h.default.getComments(this.state.model,this.state.modelId,this.state.anchor||e.get(this.props,"contextData.anchor")).then((e=>{this.processComments(e,{loading:!1,showEntityComments:t})})).catch((e=>{this.setState({loading:!1,loadError:this.parseError(e),showEntityComments:t}),this.handleFocus()}))}handleRetry(){Object(u.getStore)("SyncStatusStore").isSocketConnected?this.handleFetch():pm.toasts.error("重新在线后即可执行此操作",{title:"你离线了"})}render(){const t=Object(u.getStore)("CurrentUserStore"),s=Object(u.getStore)("TeamUserStore"),o={name:t.name,isLoggedIn:t.isLoggedIn,userName:t.username_email,id:t.id,organizations:t.organizations,teamSyncEnabled:t.teamSyncEnabled,profilePicUrl:t.profile_pic_url},n=s.values||[],a=Object(E.isUserAdmin)(o),m=!Object(u.getStore)("SyncStatusStore").isSocketConnected,l=e.reduce(s.values,((e,t)=>(e[t.id]={name:t.name,id:t.id,username:t.username,email:t.email,profilePicUrl:t.profilePicUrl},e)),{});return this.state.showPullRequestComments&&m?i.a.createElement("div",{className:e.get(this.props,"contextData.className")||this.props.className},i.a.createElement(g.ContextBarViewHeader,{title:this.props.title,onClose:this.props.onClose}),i.a.createElement(S,{icon:"icon-state-offline-stroke",title:"检查您的连接",message:"在线以查看评论"})):i.a.createElement("div",{className:e.get(this.props,"contextData.className")||this.props.className},"pullRequest"===e.get(this.props,"contextData.type")?i.a.createElement(g.ContextBarViewHeader,{title:this.props.title,onClose:this.props.onClose}):i.a.createElement("div",{className:"pull-request-entity-comments__label",onClick:this.toggleEntityComments},i.a.createElement(r.Icon,{name:"icon-action-comments-stroke",color:"content-color-secondary",className:"pull-request-entity-comments__icon"}),this.state.loading?i.a.createElement(y.default,{className:"pull-request-entity-comments__loading"}):i.a.createElement(C.Button,{className:"pull-request-entity-comments__count",size:"small"},Object.keys(this.state.comments||{}).length)),(this.state.showEntityComments||this.state.showPullRequestComments)&&i.a.createElement(p.Comments,f({addCommentPermission:!0},e.pick(this.state,["updating","creating","deleting","loadError","deleteError","updateError"]),{className:e.get(this.props,"contextData.className")||this.props.commentClassName,data:e.sortBy(this.state.comments||[],"createdAt"),isAdmin:a,isOffline:m,loading:this.state.loading,setListRef:this.setListRef,teamUsers:n,teamUsersMap:l,user:o,onClose:this.props.onClose||this.handleHideComments,onCommentCreate:this.handleCreate,onCommentDelete:this.handleDelete,onCommentUpdate:this.handleUpdate,onRetry:this.handleRetry,onUserClick:e=>{Object(d.openTeamUserProfile)(e)},hasError:this.state.hasError})))}})||o)||o}.call(this,s("./node_modules/lodash/lodash.js"))}}]);