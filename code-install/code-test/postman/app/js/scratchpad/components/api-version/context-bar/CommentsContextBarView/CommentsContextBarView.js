(window.webpackJsonp=window.webpackJsonp||[]).push([[72],{29767:function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return D}));var n,a=o(2),r=o.n(a),s=o(2353),i=o(5929),l=o(10160),m=o(10155),d=o(10153),c=(o(6912),o(7124)),h=o(7307),p=o(2752),C=o(9),S=o(2825),u=o.n(S),f=o(10156),v=o(7326),E=o(11230),b=o(10157),g=o(6059),w=o(6055),F=o(11308);let D=Object(s.observer)(n=class extends a.Component{constructor(e){super(e),this.state={loading:!0,loadError:!1,hasError:!1,isOpenFilterSelected:!0,isResolvedFilterSelected:!1,isScrollable:!0},this.rightOverlayModalRef=null,this.parseError=this.parseError.bind(this),this.handleRetry=this.handleRetry.bind(this),this.handleResolvedFilter=this.handleResolvedFilter.bind(this),this.handleOpenFilter=this.handleOpenFilter.bind(this),this.setCommentDrawerRef=this.setCommentDrawerRef.bind(this),this.stopScroll=this.stopScroll.bind(this),this.handleClose=this.handleClose.bind(this),this.onInlineCommentThreadHeaderClick=this.onInlineCommentThreadHeaderClick.bind(this)}async componentDidMount(){this.setState({loading:!0,loadError:!1}),f.default.handleAnalytics("api","view","api"),m.default.getComments({model:this.props.contextData.commentModel,modelId:this.props.contextData.commentModelId}).then((()=>{requestIdleCallback((()=>{Object(i.getStore)("CommentStore").setLoaded(!0),this.setState({loading:!1,loadError:!1})}))})).catch((e=>{this.setState({loading:!1,loadError:!0})}));let e=this.props.contextData.commentModelId,{addComment:t,deleteComment:o,resolveComment:n}=await Object(b.fetchPermissions)(["addComment","deleteComment","resolveComment"],e,g.MODEL_TYPE.API);this.setState({addCommentPermission:t,deleteCommentPermission:o,resolveCommentPermission:n})}componentDidUpdate(){if(!this.state.isResolvedFilterSelected){const t=Object(i.getStore)("CommentStore"),o=t.find(t.activeCommentId),n=Object(i.getStore)("AnnotationStore").find(e.get(o,"annotationId"));e.get(n,"status.resolved")&&this.handleResolvedFilter()}}handleOpenFilter(){this.setState((e=>{if(!e.isOpenFilterSelected||e.isResolvedFilterSelected)return{isOpenFilterSelected:!e.isOpenFilterSelected}}))}handleResolvedFilter(){this.setState((e=>{if(e.isOpenFilterSelected||!e.isResolvedFilterSelected)return{isResolvedFilterSelected:!e.isResolvedFilterSelected}}))}parseError(e){return e.isFriendly?e.message:""}handleRetry(){return this.setState({loading:!0,loadError:!1}),m.default.getComments({model:this.props.contextData.commentModel,modelId:this.props.contextData.commentModelId}).then((()=>{this.setState({loading:!1,loadError:!1})})).catch((e=>{this.setState({loading:!1,loadError:!0})}))}setCommentDrawerRef(e){this.commentDrawerRef=e,this.commentDrawerRef&&this.forceUpdate()}stopScroll(e){this.setState({isScrollable:!e})}handleClose(){this.props.onClose&&this.props.onClose(),w.default.removeCommentQueryParam()}onInlineCommentThreadHeaderClick(){e.isFunction(this.props.contextData.handleTabChange)&&this.props.contextData.handleTabChange(F.DEFINE)}render(){let t,{commentModel:o,commentModelId:n,schemaId:a}=this.props.contextData||{};t=e.filter(Object(i.getStore)("CommentStore").values,(e=>e.model===o&&e.modelId===n));const s=e.filter(t,(e=>e.anchor&&e.anchor.startsWith(`${o}/${n}`)&&e.anchor!==`${o}/${n}`)),m=e.sortBy(e.filter(t,(e=>!e.anchor||e.anchor===`${o}/${n}/schema/${a}`)),"createdAt")||[],S=this.props.contextData.name,f=Object(i.getStore)("CurrentUserStore")||{},b=Object(i.getStore)("TeamUserStore"),g=e.reduce(b.values,((e,t)=>(e[t.id]={name:t.name,id:t.id,username:t.username,email:t.email,profilePicUrl:t.profilePicUrl,roles:t.roles},e)),{}),w=Object.values(g),F=!Object(i.getStore)("SyncStatusStore").isSocketConnected,D=Object(l.isUserAdmin)(f),O=e.reduce((m||[]).reverse(),((e,t)=>(e.includes(t.annotationId)||e.push(t.annotationId),e)),[]),R=Object(i.getStore)("CommentStore"),I=R.find(R.activeCommentId),x=R.setActiveCommentId;let k=e.reduce(m||[],((t,o)=>{let n=o&&o.anchor&&e.get(o.anchor.split("/"),"[3]"),a=(this.props.contextData.versions||[]).filter((t=>n===e.get(t,"schema[0]"))),r=e.get(a,"[0].id");return r&&(t[o.annotationId]={version:r}),t}),{});return F&&this.state.loading?r.a.createElement(r.a.Fragment,null,r.a.createElement(v.ContextBarViewHeader,{onClose:this.props.onClose,title:"Comments"}),r.a.createElement(E.default,{origin:"context-bar"})):r.a.createElement("div",{className:u()({"comment-drawer-container":!0,"no-scroll":!this.state.isScrollable}),ref:this.setCommentDrawerRef},r.a.createElement(v.ContextBarViewHeader,{onClose:this.handleClose,title:"Comments"},r.a.createElement("div",{className:"comment-drawer-container__actions"},r.a.createElement("div",{className:"comment-drawer-container__actions-filter"},r.a.createElement(h.Dropdown,null,r.a.createElement(h.DropdownButton,{dropdownStyle:"nocaret"},r.a.createElement(c.Button,{className:"comment-drawer-container__actions-filter-button",type:"tertiary",tooltip:"Filter comments",disabled:!s.length},r.a.createElement(C.Icon,{name:"icon-action-filter-stroke"}))),r.a.createElement(h.DropdownMenu,{className:"comment-drawer-container__actions-filter-menu"},r.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-header"},"Filter by"),r.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-item"},r.a.createElement(p.Checkbox,{className:"comment-filter-dropdown-item-checkbox",checked:this.state.isOpenFilterSelected,onChange:this.handleOpenFilter}),r.a.createElement("span",{className:"comment-drawer-container__actions-filter--action-item-name"},"Open comments")),r.a.createElement("div",{className:"comment-drawer-container__actions-filter--action-item"},r.a.createElement(p.Checkbox,{className:"comment-filter-dropdown-item-checkbox",checked:this.state.isResolvedFilterSelected,onChange:this.handleResolvedFilter}),r.a.createElement("span",{className:"comment-drawer-container__actions-filter--action-item-name"},"Resolved comments"))))))),r.a.createElement("div",{className:"comment-drawer"},r.a.createElement(d.default,{editor:e.get(this.props.contextData,"editor"),comments:m,onInlineCommentThreadHeaderClick:this.onInlineCommentThreadHeaderClick,requestComments:[],annotationOrder:O,isResolvedFilterSelected:this.state.isResolvedFilterSelected,isOpenFilterSelected:this.state.isOpenFilterSelected,addCommentPermission:this.state.addCommentPermission,deleteCommentPermission:this.state.deleteCommentPermission,resolveCommentPermission:this.state.resolveCommentPermission,isAdmin:D,isOffline:F,loading:this.state.loading,loadError:this.state.loadError,hasError:this.state.hasError,teamUsers:w,teamUsersMap:g,onRetry:this.handleRetry,user:f,title:S,stopScroll:this.stopScroll,commentRef:this.commentDrawerRef,commentLinkDisabled:e.get(this.props.contextData,"commentLinkDisabled"),model:"api",modelId:e.get(this.props.contextData,"commentModelId"),supportsInlineComments:!0,commentLinkParams:k,activeComment:I,setActiveComment:x,origin:"contextBar",anchor:e.get(this.props.contextData,"anchor"),hideHeaderComments:!0})))}})||n}.call(this,o(2753))}}]);