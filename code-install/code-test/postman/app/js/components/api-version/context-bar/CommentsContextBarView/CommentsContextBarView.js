(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{"./api-dev/components/api-version/context-bar/CommentsContextBarView/CommentsContextBarView.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return x}));var n,s=o("../../node_modules/react/index.js"),a=o.n(s),r=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),i=o("./js/stores/get-store.js"),l=o("./js/utils/UserHelper.js"),m=o("./collaboration/services/ContextBarCommentService.js"),c=o("./collaboration/components/comments/InlineCommentDrawer.js"),d=(o("./js/models/services/DashboardService.js"),o("./js/components/base/Buttons.js")),h=o("./js/components/base/Dropdowns.js"),p=o("./js/components/base/Inputs.js"),C=o("../../node_modules/@postman/aether/esmLib/index.js"),S=o("./node_modules/classnames/index.js"),u=o.n(S),v=o("./js/modules/services/InlineCommentTransformerService.js"),b=o("./appsdk/contextbar/ContextBarViewHeader.js"),f=o("./api-dev/components/common/APIOffline/APIOffline.js"),g=o("./collaboration/services/PermissionService.js"),j=o("./collaboration/constants/comments.js"),w=o("./collaboration/services/CollaborationNavigationService.js"),E=o("./api-dev/constants/APISubViews.js");let x=Object(r.observer)(n=class extends s.Component{constructor(e){super(e),this.state={loading:!0,loadError:!1,hasError:!1,isOpenFilterSelected:!0,isResolvedFilterSelected:!1,isScrollable:!0},this.rightOverlayModalRef=null,this.parseError=this.parseError.bind(this),this.handleRetry=this.handleRetry.bind(this),this.handleResolvedFilter=this.handleResolvedFilter.bind(this),this.handleOpenFilter=this.handleOpenFilter.bind(this),this.setCommentDrawerRef=this.setCommentDrawerRef.bind(this),this.stopScroll=this.stopScroll.bind(this),this.handleClose=this.handleClose.bind(this),this.onInlineCommentThreadHeaderClick=this.onInlineCommentThreadHeaderClick.bind(this)}async componentDidMount(){this.setState({loading:!0,loadError:!1}),v.default.handleAnalytics("api","view","api"),m.default.getComments({model:this.props.contextData.commentModel,modelId:this.props.contextData.commentModelId}).then((()=>{requestIdleCallback((()=>{Object(i.getStore)("CommentStore").setLoaded(!0),this.setState({loading:!1,loadError:!1})}))})).catch((e=>{this.setState({loading:!1,loadError:!0})}));let e=this.props.contextData.commentModelId,{addComment:t,deleteComment:o,resolveComment:n}=await Object(g.fetchPermissions)(["addComment","deleteComment","resolveComment"],e,j.MODEL_TYPE.API);this.setState({addCommentPermission:t,deleteCommentPermission:o,resolveCommentPermission:n})}componentDidUpdate(){if(!this.state.isResolvedFilterSelected){const t=Object(i.getStore)("CommentStore"),o=t.find(t.activeCommentId),n=Object(i.getStore)("AnnotationStore").find(e.get(o,"annotationId"));e.get(n,"status.resolved")&&this.handleResolvedFilter()}}handleOpenFilter(){this.setState((e=>{if(!e.isOpenFilterSelected||e.isResolvedFilterSelected)return{isOpenFilterSelected:!e.isOpenFilterSelected}}))}handleResolvedFilter(){this.setState((e=>{if(e.isOpenFilterSelected||!e.isResolvedFilterSelected)return{isResolvedFilterSelected:!e.isResolvedFilterSelected}}))}parseError(e){return e.isFriendly?e.message:""}handleRetry(){return this.setState({loading:!0,loadError:!1}),m.default.getComments({model:this.props.contextData.commentModel,modelId:this.props.contextData.commentModelId}).then((()=>{this.setState({loading:!1,loadError:!1})})).catch((e=>{this.setState({loading:!1,loadError:!0})}))}setCommentDrawerRef(e){this.commentDrawerRef=e,this.commentDrawerRef&&this.forceUpdate()}stopScroll(e){this.setState({isScrollable:!e})}handleClose(){this.props.onClose&&this.props.onClose(),w.default.removeCommentQueryParam()}onInlineCommentThreadHeaderClick(){e.isFunction(this.props.contextData.handleTabChange)&&this.props.contextData.handleTabChange(E.DEFINE)}render(){let t,{commentModel:o,commentModelId:n,schemaId:s}=this.props.contextData||{};t=e.filter(Object(i.getStore)("CommentStore").values,(e=>e.model===o&&e.modelId===n));const r=e.filter(t,(e=>e.anchor&&e.anchor.startsWith(`${o}/${n}`)&&e.anchor!==`${o}/${n}`)),m=e.sortBy(e.filter(t,(e=>!e.anchor||e.anchor===`${o}/${n}/schema/${s}`)),"createdAt")||[],S=this.props.contextData.name,v=Object(i.getStore)("CurrentUserStore")||{},g=Object(i.getStore)("TeamUserStore"),j=e.reduce(g.values,((e,t)=>(e[t.id]={name:t.name,id:t.id,username:t.username,email:t.email,profilePicUrl:t.profilePicUrl,roles:t.roles},e)),{}),w=Object.values(j),E=!Object(i.getStore)("SyncStatusStore").isSocketConnected,x=Object(l.isUserAdmin)(v),D=e.reduce((m||[]).reverse(),((e,t)=>(e.includes(t.annotationId)||e.push(t.annotationId),e)),[]),I=Object(i.getStore)("CommentStore"),F=I.find(I.activeCommentId),O=I.setActiveCommentId;let R=e.reduce(m||[],((t,o)=>{let n=o&&o.anchor&&e.get(o.anchor.split("/"),"[3]"),s=(this.props.contextData.versions||[]).filter((t=>n===e.get(t,"schema[0]"))),a=e.get(s,"[0].id");return a&&(t[o.annotationId]={version:a}),t}),{});return E&&this.state.loading?a.a.createElement(a.a.Fragment,null,a.a.createElement(b.ContextBarViewHeader,{onClose:this.props.onClose,title:"评论"}),a.a.createElement(f.default,{origin:"context-bar"})):a.a.createElement("div",{className:u()({"comment-drawer-container":!0,"no-scroll":!this.state.isScrollable}),ref:this.setCommentDrawerRef},a.a.createElement(b.ContextBarViewHeader,{onClose:this.handleClose,title:"评论"},a.a.createElement("div",{className:"comment-drawer-container__actions"},a.a.createElement("div",{className:"comment-drawer-container__actions-filter"},a.a.createElement(h.Dropdown,null,a.a.createElement(h.DropdownButton,{dropdownStyle:"nocaret"},a.a.createElement(d.Button,{className:"comment-drawer-container__actions-filter-button",type:"tertiary",tooltip:"筛选评论",disabled:!r.length},a.a.createElement(C.Icon,{name:"icon-action-filter-stroke"}))),a.a.createElement(h.DropdownMenu,{className:"comment-drawer-container__actions-filter-menu"},a.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-header"},"筛选条件"),a.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-item"},a.a.createElement(p.Checkbox,{className:"comment-filter-dropdown-item-checkbox",checked:this.state.isOpenFilterSelected,onChange:this.handleOpenFilter}),a.a.createElement("span",{className:"comment-drawer-container__actions-filter--action-item-name"},"打开的评论")),a.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-item"},a.a.createElement(p.Checkbox,{className:"comment-filter-dropdown-item-checkbox",checked:this.state.isResolvedFilterSelected,onChange:this.handleResolvedFilter}),a.a.createElement("span",{className:"comment-drawer-container__actions-filter--action-item-name"},"已解决的评论"))))))),a.a.createElement("div",{className:"comment-drawer"},a.a.createElement(c.default,{editor:e.get(this.props.contextData,"editor"),comments:m,onInlineCommentThreadHeaderClick:this.onInlineCommentThreadHeaderClick,requestComments:[],annotationOrder:D,isResolvedFilterSelected:this.state.isResolvedFilterSelected,isOpenFilterSelected:this.state.isOpenFilterSelected,addCommentPermission:this.state.addCommentPermission,deleteCommentPermission:this.state.deleteCommentPermission,resolveCommentPermission:this.state.resolveCommentPermission,isAdmin:x,isOffline:E,loading:this.state.loading,loadError:this.state.loadError,hasError:this.state.hasError,teamUsers:w,teamUsersMap:j,onRetry:this.handleRetry,user:v,title:S,stopScroll:this.stopScroll,commentRef:this.commentDrawerRef,commentLinkDisabled:e.get(this.props.contextData,"commentLinkDisabled"),model:"api",modelId:e.get(this.props.contextData,"commentModelId"),supportsInlineComments:!0,commentLinkParams:R,activeComment:F,setActiveComment:O,origin:"contextBar",anchor:e.get(this.props.contextData,"anchor"),hideHeaderComments:!0})))}})||n}.call(this,o("./node_modules/lodash/lodash.js"))}}]);