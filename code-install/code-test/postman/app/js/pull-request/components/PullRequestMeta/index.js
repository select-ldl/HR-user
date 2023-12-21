(window.webpackJsonp=window.webpackJsonp||[]).push([[110],{"./version-control/pull-request/components/PullRequestMeta/index.js":function(e,t,s){"use strict";s.r(t),s.d(t,"default",(function(){return f}));var n=s("../../node_modules/react/index.js"),a=s.n(n),r=s("./node_modules/lodash/lodash.js"),o=s.n(r),l=s("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),i=s("../../node_modules/@postman/aether/esmLib/index.js"),c=s("./version-control/pull-request/components/PullRequestMeta/infoComponents.js"),u=s("./appsdk/contextbar/ContextBarViewHeader.js"),d=s("./version-control/constants.js");const m={merged:"已合并",declined:"已拒绝"},p=l.default.div`
  /** increasing specificity */
  .pull-request-meta__header.pull-request-meta__header {
    padding-bottom: ${({theme:e})=>e["spacing-l"]};
  }
`;class f extends n.Component{constructor(e){super(e)}get isActivePR(){return[d.PR_STATES.OPEN,d.PR_STATES.APPROVED].includes(o.a.get(this.props.contextData,"pullRequest.status"))}render(){return a.a.createElement(p,null,a.a.createElement(u.ContextBarViewHeader,{title:"拉取请求详情",onClose:this.props.onClose,className:"pull-request-meta__header"}),a.a.createElement("div",{className:"pull-request-meta"},!this.isActivePR&&a.a.createElement(c.Info,{title:`${m[o.a.get(this.props.contextData,"pullRequest.status")]} by`},a.a.createElement(c.User,{user:o.a.get(this.props.contextData,"pullRequest.updatedBy")})),a.a.createElement(c.Info,{title:"创建者"},a.a.createElement(c.User,{user:o.a.get(this.props.contextData,"pullRequest.createdBy")})),a.a.createElement(c.Info,{title:"创建于"},a.a.createElement(c.Date,{date:o.a.get(this.props.contextData,"pullRequest.createdAt"),format:"DD MMM YYYY"})),this.isActivePR&&a.a.createElement(c.Info,{title:"最后更新"},a.a.createElement(c.Date,{date:o.a.get(this.props.contextData,"pullRequest.updatedAt"),relative:!0})),a.a.createElement(c.Info,{title:"评审员"},o.a.get(this.props.contextData,"pullRequest.reviewers.length",0)?a.a.createElement("ul",{className:"pull-request-reviewers-list"},o()(this.props.contextData).get("pullRequest.reviewers",[]).map((e=>a.a.createElement(c.User,{key:e.id,user:e,renderRight:()=>e.status===d.PR_STATES.APPROVED&&a.a.createElement(i.Badge,{text:"已批准",status:"success"})})))):a.a.createElement(i.Text,{type:"body-medium",color:"content-color-primary"},"没有评审员"))))}}},"./version-control/pull-request/components/PullRequestMeta/infoComponents.js":function(e,t,s){"use strict";s.r(t),s.d(t,"Info",(function(){return m})),s.d(t,"Date",(function(){return p})),s.d(t,"User",(function(){return E}));var n=s("../../node_modules/react/index.js"),a=s.n(n),r=s("../../node_modules/@postman/aether/esmLib/index.js"),o=s("./node_modules/moment-timezone/index.js"),l=s.n(o),i=s("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),c=s("./js/components/base/Avatar.js"),u=s("./version-control/common/index.js");const d=i.default.div`
  & + & {
    margin-top: ${({theme:e})=>e["spacing-xl"]};
  }

  .pr-meta-info__title {
    margin-bottom: ${({theme:e})=>e["spacing-s"]};
  }

  .pr-meta-info__content {
    display: flex;
  }
`;function m(e){const{title:t,children:s}=e;return a.a.createElement(d,null,a.a.createElement(r.Heading,{type:"h6",text:t,color:"content-color-secondary",className:"pr-meta-info__title"}),a.a.createElement(r.Flex,null,s))}function p(e){const{date:t,format:s,relative:n}=e;let o;return n?o=l()(t).fromNow():s&&(o=l()(t).format(s)),a.a.createElement(r.Text,{type:"body-medium",color:"content-color-primary"},o)}const f=i.default.li`
  display: flex;
  width: 100%;

  .space-filler {
    flex: auto;
  }
`;function E(e){const{user:t,renderRight:s}=e;return a.a.createElement(f,null,a.a.createElement(c.default,{size:"medium",userId:t.id,customPic:t.profilePicUrl}),a.a.createElement(u.Username,{className:"pull-request-user__name",currentUserId:t.id,id:t.id,user:t}),a.a.createElement("span",{className:"space-filler"}),s&&s())}}}]);