(window.webpackJsonp=window.webpackJsonp||[]).push([[67],{24827:function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return k}));var n=o(2),a=o.n(n),r=o(47),l=o(814),i=o.n(l),c=o(5929),s=o(7326),d=o(24828),u=o(6053);const m=r.default.div`
  overflow-y: auto;
`,f=12,p="createdAt",g="desc";function k(t){const[o,r]=Object(n.useState)([]),[l,k]=Object(n.useState)({}),[v,y]=Object(n.useState)(!0),[b,x]=Object(n.useState)(!1),[h,E]=Object(n.useState)(null),C=Object(c.getStore)("SyncStatusStore"),w=!Object(c.getStore)("SyncStatusStore").isSocketConnected,I={populateUsers:!0,pageSize:f,sortBy:p,sortType:g},S=()=>{y(!0),E(null),C.onSyncAvailable({timeout:5e3}).then((()=>u.default.request(`/${t.contextData.model}/${t.contextData.uid}/fork-list?${i.a.stringify(I)}`))).then((t=>{r(e.get(t,"body.data.forks")),k({publicForks:e.get(t,"body.data.publicForkCount"),privateForks:e.get(t,"body.data.privateForkCount"),hiddenForks:e.get(t,"body.data.hiddenForkCount"),totalForks:e.get(t,"body.data.totalForkCount")}),x(!(e.get(t,"body.data.forks")||[]).length),y(!1)})).catch((e=>{E(e),y(!1),pm.logger.error("Unable to fetch fork list",e)}))};return Object(n.useEffect)((()=>{S()}),[]),a.a.createElement(m,null,a.a.createElement(s.ContextBarViewHeader,{title:"Forks",onClose:t.onClose}),a.a.createElement(d.default,{loading:v,isOffline:w,isEmpty:b,error:h,forks:o,fetchForks:S,forkInfo:l,modelName:t.contextData.model,name:t.contextData.name,modelUID:t.contextData.uid}))}}.call(this,o(2753))},24828:function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return w}));var n=o(2),a=o.n(n),r=o(47),l=o(9),i=o(8628),c=o.n(i),s=o(10955),d=o(10847),u=o(8767),m=o(10960),f=o(24829),p=o(2765),g=o(2776),k=o(7148),v=o(7124),y=o(6907),b=o(10963);const x=r.default.div`
  display: inline-block;
`,h=Object(r.default)(d.CustomTooltip)`
  float: right;
  margin-top: var(--spacing-s);
  margin-right: var(--spacing-xxl);
`,E=r.default.div`
  font-size: var(--text-size-m);
  color: var(--content-color-primary);
  font-weight: var(--text-weight-medium);
  margin-bottom: var(--spacing-m);
`,C=r.default.span`
  color: var(--content-color-info);
  font-size: var(--text-size-m);
  margin-top: var(--spacing-l);
  cursor: pointer;
  padding-bottom: var(--spacing-xl);

  &:hover {
    text-decoration: underline
  }

  &.forks-external-link {
    color: var(--content-color-secondary);
    padding-bottom: 0px;

    :hover {
      text-decoration: none;
      color: var(--content-color-link);
    }
  }
`;Object(r.default)(l.Icon)`
  position: relative;
  top: 2px;
`;function w(t){const o={collection:"https://go.pstmn.io/docs-collection-forking",environment:"https://go.pstmn.io/docs-environment-forking"},r=a.a.createElement(C,{className:"forks-external-link",onClick:()=>Object(g.openExternalLink)(o[t.modelName],"_blank")},a.a.createElement(l.Text,{type:"link-default"},"forks")),i=a.a.createElement(l.Text,{type:"para"},"They aren't visible because they're in workspaces you don't have access to. Learn more about ",r,"."),d=a.a.createElement(l.Text,{type:"para"},"All forks created from this ",t.modelName," will appear here. Learn more about ",r,"."),w=a.a.createElement(v.Button,{type:"primary",size:"small",onClick:t.fetchForks},"Retry"),I=y.default.pluralize({count:e.get(t,"forkInfo.totalForks"),singular:"fork",plural:"forks"});if(t.loading)return a.a.createElement(s.default,null);if(t.isOffline)return a.a.createElement(f.ContextBarEmptyStateContainer,null,a.a.createElement(m.default,{showAction:!0,illustration:a.a.createElement(l.IllustrationCheckInternetConnection,null),title:"Check your connection",message:"Get online to view your list of forks.",action:w}));if(t.error)return a.a.createElement(f.ContextBarEmptyStateContainer,null,a.a.createElement(m.default,{illustration:t.isForbidden?a.a.createElement(l.IllustrationNoPermission,null):a.a.createElement(l.IllustrationInternalServerError,null),title:"Unable to load list of forks",message:t.isForbidden?`You cannot view the list of forks for this ${t.modelName}.`:e.get(t,"error.error.message")||"Try refetching forks"}));if(t.isEmpty){const o=Boolean(e.get(t,"forkInfo.hiddenForks"));return a.a.createElement(f.ContextBarEmptyStateContainer,null,a.a.createElement(l.BlankState,{className:"context-bar-empty-state--full-width",title:o?`${e.get(t,"forkInfo.totalForks")} ${I} of ${e.get(t,"name")}`:"No forks created yet",description:o?i:d},a.a.createElement(l.IllustrationNoFork,null)))}return a.a.createElement(n.Fragment,null,a.a.createElement(f.ContextBarDescription,null,e.get(t,"forkInfo.totalForks")," ",I," of ",e.get(t,"name"),".",e.get(t,"forkInfo.hiddenForks")>0?` ${e.get(t,"forkInfo.hiddenForks")} of those aren't in this list because they're in workspaces you don't have access to.`:""),a.a.createElement(f.ContextBarContainer,null,a.a.createElement(E,null,"Recently created:"),(t.forks||[]).map((o=>a.a.createElement("div",{key:o.modelId},a.a.createElement(x,null,a.a.createElement(k.default,{to:o.modelId?`${pm.artemisUrl}/${t.modelName}/${o.modelId}`:"",disabled:!o.modelId},a.a.createElement(f.ContextBarListItem,null,a.a.createElement(b.default,{text:o.forkName}))),a.a.createElement(f.ContextBarSubtext,null,`Created on: ${c()(o.createdAt).format("DD MMM, YYYY")}`)),a.a.createElement(h,{align:"bottom",body:e.get(o,"createdBy.name")},a.a.createElement(u.default,{size:"medium",userId:e.get(o,"createdBy.id"),customPic:e.get(o,"createdBy.profilePicUrl")}))))),a.a.createElement(C,{onClick:()=>p.default.transitionTo("build.forks",{model:t.modelName,id:e.get(t,"modelUID")})},e.get(t,"forkInfo.totalForks")>(t.forks||[]).length?"View all forks":"View details")))}}.call(this,o(2753))},24829:function(e,t,o){"use strict";o.r(t),o.d(t,"ContextBarDescription",(function(){return a})),o.d(t,"ContextBarListItem",(function(){return r})),o.d(t,"ContextBarSubtext",(function(){return l})),o.d(t,"ContextBarContainer",(function(){return i})),o.d(t,"ContextBarLoading",(function(){return c})),o.d(t,"ContextBarEmptyStateContainer",(function(){return s}));var n=o(47);const a=n.default.span`
  font-size: var(--text-size-m);
  color: var(--content-color-secondary);
  font-weight: var(--text-weight-regular);
  margin-left: var(--spacing-s);
  display: flex;
`,r=n.default.span`
  color: var(--content-color-primary);
  font-size: var(--text-size-m);

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`,l=n.default.p`
  margin-top: 0;
  margin-bottom: 0;
  color: var(--content-color-tertiary);
  font-size: var(--text-size-s);
`,i=n.default.div`
  margin-left: var(--spacing-s);
  margin-top: var(--spacing-l);
  padding-bottom: var(--spacing-xl);

  div {
    margin-bottom: var(--spacing-s);
  }
`,c=n.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
`,s=n.default.div`
  position: absolute;
  top: 30%;
  left: 15%;
  min-width: 300px;

  p {
    font-size: var(--text-size-m);
    color: var(--content-color-secondary);
    margin: 0;
  }

  .context-bar-empty-state--full-width {
    width: 100%;
  }
`}}]);