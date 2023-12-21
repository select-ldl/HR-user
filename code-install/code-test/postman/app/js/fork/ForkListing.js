(window.webpackJsonp=window.webpackJsonp||[]).push([[108],{"./version-control/common/context-bar-items.js":function(e,t,o){"use strict";o.r(t),o.d(t,"ContextBarDescription",(function(){return r})),o.d(t,"ContextBarListItem",(function(){return a})),o.d(t,"ContextBarSubtext",(function(){return s})),o.d(t,"ContextBarContainer",(function(){return l})),o.d(t,"ContextBarLoading",(function(){return i})),o.d(t,"ContextBarEmptyStateContainer",(function(){return c}));var n=o("../../node_modules/styled-components/dist/styled-components.browser.esm.js");const r=n.default.span`
  font-size: var(--text-size-m);
  color: var(--content-color-secondary);
  font-weight: var(--text-weight-regular);
  margin-left: var(--spacing-s);
  display: flex;
`,a=n.default.span`
  color: var(--content-color-primary);
  font-size: var(--text-size-m);

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`,s=n.default.p`
  margin-top: 0;
  margin-bottom: 0;
  color: var(--content-color-tertiary);
  font-size: var(--text-size-s);
`,l=n.default.div`
  margin-left: var(--spacing-s);
  margin-top: var(--spacing-l);
  padding-bottom: var(--spacing-xl);

  div {
    margin-bottom: var(--spacing-s);
  }
`,i=n.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
`,c=n.default.div`
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
`},"./version-control/fork/ForkListBody.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return C}));var n=o("../../node_modules/react/index.js"),r=o.n(n),a=o("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),s=o("../../node_modules/@postman/aether/esmLib/index.js"),l=o("./node_modules/moment-timezone/index.js"),i=o.n(l),c=o("./version-control/common/TabLoader.js"),d=o("./version-control/common/index.js"),m=o("./js/components/base/Avatar.js"),u=o("./version-control/common/TabEmptyState.js"),f=o("./version-control/common/context-bar-items.js"),p=o("./js/services/NavigationService.js"),g=o("./js/external-navigation/ExternalNavigationService.js"),k=o("./appsdk/components/link/Link.js"),v=o("./js/components/base/Buttons.js"),y=o("./js/utils/PluralizeHelper.js"),b=o("./version-control/common/ItemLink.js");const x=a.default.div`
  display: inline-block;
`,h=Object(a.default)(d.CustomTooltip)`
  float: right;
  margin-top: var(--spacing-s);
  margin-right: var(--spacing-xxl);
`,j=a.default.div`
  font-size: var(--text-size-m);
  color: var(--content-color-primary);
  font-weight: var(--text-weight-medium);
  margin-bottom: var(--spacing-m);
`,E=a.default.span`
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
`;Object(a.default)(s.Icon)`
  position: relative;
  top: 2px;
`;function C(t){const o={collection:"https://go.pstmn.io/docs-collection-forking",environment:"https://go.pstmn.io/docs-environment-forking"},a=r.a.createElement(E,{className:"forks-external-link",onClick:()=>Object(g.openExternalLink)(o[t.modelName],"_blank")},r.a.createElement(s.Text,{type:"link-default"},"分叉")),l=r.a.createElement(s.Text,{type:"para"},"它们是不可见的, 因为它们位于您无法访问的工作区中. 了解更多关于 ",a,"."),d=r.a.createElement(s.Text,{type:"para"},"从此",t.modelName,"创建的所有分叉都将显示在这里. 了解更多关于 ",a,"."),C=r.a.createElement(v.Button,{type:"primary",size:"small",onClick:t.fetchForks},"重试"),w=y.default.pluralize({count:e.get(t,"forkInfo.totalForks"),singular:"分叉",plural:"分叉"});if(t.loading)return r.a.createElement(c.default,null);if(t.isOffline)return r.a.createElement(f.ContextBarEmptyStateContainer,null,r.a.createElement(u.default,{showAction:!0,illustration:r.a.createElement(s.IllustrationCheckInternetConnection,null),title:"检查您的连接",message:"联网查看您的分叉列表.",action:C}));if(t.error)return r.a.createElement(f.ContextBarEmptyStateContainer,null,r.a.createElement(u.default,{illustration:t.isForbidden?r.a.createElement(s.IllustrationNoPermission,null):r.a.createElement(s.IllustrationInternalServerError,null),title:"无法加载分叉列表",message:t.isForbidden?`您无法查看此集合${t.modelName}的分叉列表.`:e.get(t,"error.error.message")||"尝试重新获取分叉"}));if(t.isEmpty){const o=Boolean(e.get(t,"forkInfo.hiddenForks"));return r.a.createElement(f.ContextBarEmptyStateContainer,null,r.a.createElement(s.BlankState,{className:"context-bar-empty-state--full-width",title:o?`${e.get(t,"forkInfo.totalForks")} ${w} of ${e.get(t,"name")}`:"尚未创建分叉",description:o?l:d},r.a.createElement(s.IllustrationNoFork,null)))}return r.a.createElement(n.Fragment,null,r.a.createElement(f.ContextBarDescription,null,e.get(t,"forkInfo.totalForks"),"个",w,"于",e.get(t,"name"),".",e.get(t,"forkInfo.hiddenForks")>0?` 其中的${e.get(t,"forkInfo.hiddenForks")}个不在此列表中, 因为它们位于您无权访问的工作空间中.`:""),r.a.createElement(f.ContextBarContainer,null,r.a.createElement(j,null,"最近创建的:"),(t.forks||[]).map((o=>r.a.createElement("div",{key:o.modelId},r.a.createElement(x,null,r.a.createElement(k.default,{to:o.modelId?`${pm.artemisUrl}/${t.modelName}/${o.modelId}`:"",disabled:!o.modelId},r.a.createElement(f.ContextBarListItem,null,r.a.createElement(b.default,{text:o.forkName}))),r.a.createElement(f.ContextBarSubtext,null,`创建于: ${i()(o.createdAt).format("DD MMM, YYYY")}`)),r.a.createElement(h,{align:"bottom",body:e.get(o,"createdBy.name")},r.a.createElement(m.default,{size:"medium",userId:e.get(o,"createdBy.id"),customPic:e.get(o,"createdBy.profilePicUrl")}))))),r.a.createElement(E,{onClick:()=>p.default.transitionTo("build.forks",{model:t.modelName,id:e.get(t,"modelUID")})},e.get(t,"forkInfo.totalForks")>(t.forks||[]).length?"查看所有分叉":"查看详情")))}}.call(this,o("./node_modules/lodash/lodash.js"))},"./version-control/fork/ForkListing.js":function(e,t,o){"use strict";o.r(t),function(e){o.d(t,"default",(function(){return k}));var n=o("../../node_modules/react/index.js"),r=o.n(n),a=o("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),s=o("./node_modules/querystring-browser/querystring.js"),l=o.n(s),i=o("./js/stores/get-store.js"),c=o("./appsdk/contextbar/ContextBarViewHeader.js"),d=o("./version-control/fork/ForkListBody.js"),m=o("./js/modules/services/RemoteSyncRequestService.js");const u=a.default.div`
  overflow-y: auto;
`,f=12,p="createdAt",g="desc";function k(t){const[o,a]=Object(n.useState)([]),[s,k]=Object(n.useState)({}),[v,y]=Object(n.useState)(!0),[b,x]=Object(n.useState)(!1),[h,j]=Object(n.useState)(null),E=Object(i.getStore)("SyncStatusStore"),C=!Object(i.getStore)("SyncStatusStore").isSocketConnected,w={populateUsers:!0,pageSize:f,sortBy:p,sortType:g},S=()=>{y(!0),j(null),E.onSyncAvailable({timeout:5e3}).then((()=>m.default.request(`/${t.contextData.model}/${t.contextData.uid}/fork-list?${l.a.stringify(w)}`))).then((t=>{a(e.get(t,"body.data.forks")),k({publicForks:e.get(t,"body.data.publicForkCount"),privateForks:e.get(t,"body.data.privateForkCount"),hiddenForks:e.get(t,"body.data.hiddenForkCount"),totalForks:e.get(t,"body.data.totalForkCount")}),x(!(e.get(t,"body.data.forks")||[]).length),y(!1)})).catch((e=>{j(e),y(!1),pm.logger.error("Unable to fetch fork list",e)}))};return Object(n.useEffect)((()=>{S()}),[]),r.a.createElement(u,null,r.a.createElement(c.ContextBarViewHeader,{title:"分叉",onClose:t.onClose}),r.a.createElement(d.default,{loading:v,isOffline:C,isEmpty:b,error:h,forks:o,fetchForks:S,forkInfo:s,modelName:t.contextData.model,name:t.contextData.name,modelUID:t.contextData.uid}))}}.call(this,o("./node_modules/lodash/lodash.js"))}}]);