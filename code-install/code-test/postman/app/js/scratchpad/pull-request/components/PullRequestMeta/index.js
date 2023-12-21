(window.webpackJsonp=window.webpackJsonp||[]).push([[64],{24813:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return f}));var r=a(2),n=a.n(r),l=a(2753),s=a.n(l),c=a(47),i=a(9),o=a(24814),u=a(7326),d=a(6796);const p={merged:"Merged",declined:"Declined"},m=c.default.div`
  /** increasing specificity */
  .pull-request-meta__header.pull-request-meta__header {
    padding-bottom: ${({theme:e})=>e["spacing-l"]};
  }
`;class f extends r.Component{constructor(e){super(e)}get isActivePR(){return[d.PR_STATES.OPEN,d.PR_STATES.APPROVED].includes(s.a.get(this.props.contextData,"pullRequest.status"))}render(){return n.a.createElement(m,null,n.a.createElement(u.ContextBarViewHeader,{title:"Pull request details",onClose:this.props.onClose,className:"pull-request-meta__header"}),n.a.createElement("div",{className:"pull-request-meta"},!this.isActivePR&&n.a.createElement(o.Info,{title:`${p[s.a.get(this.props.contextData,"pullRequest.status")]} by`},n.a.createElement(o.User,{user:s.a.get(this.props.contextData,"pullRequest.updatedBy")})),n.a.createElement(o.Info,{title:"Created by"},n.a.createElement(o.User,{user:s.a.get(this.props.contextData,"pullRequest.createdBy")})),n.a.createElement(o.Info,{title:"Created on"},n.a.createElement(o.Date,{date:s.a.get(this.props.contextData,"pullRequest.createdAt"),format:"DD MMM YYYY"})),this.isActivePR&&n.a.createElement(o.Info,{title:"Last updated"},n.a.createElement(o.Date,{date:s.a.get(this.props.contextData,"pullRequest.updatedAt"),relative:!0})),n.a.createElement(o.Info,{title:"Reviewers"},s.a.get(this.props.contextData,"pullRequest.reviewers.length",0)?n.a.createElement("ul",{className:"pull-request-reviewers-list"},s()(this.props.contextData).get("pullRequest.reviewers",[]).map((e=>n.a.createElement(o.User,{key:e.id,user:e,renderRight:()=>e.status===d.PR_STATES.APPROVED&&n.a.createElement(i.Badge,{text:"APPROVED",status:"success"})})))):n.a.createElement(i.Text,{type:"body-medium",color:"content-color-primary"},"No reviewers"))))}}},24814:function(e,t,a){"use strict";a.r(t),a.d(t,"Info",(function(){return p})),a.d(t,"Date",(function(){return m})),a.d(t,"User",(function(){return E}));var r=a(2),n=a.n(r),l=a(9),s=a(8628),c=a.n(s),i=a(47),o=a(8767),u=a(10847);const d=i.default.div`
  & + & {
    margin-top: ${({theme:e})=>e["spacing-xl"]};
  }

  .pr-meta-info__title {
    margin-bottom: ${({theme:e})=>e["spacing-s"]};
  }

  .pr-meta-info__content {
    display: flex;
  }
`;function p(e){const{title:t,children:a}=e;return n.a.createElement(d,null,n.a.createElement(l.Heading,{type:"h6",text:t,color:"content-color-secondary",className:"pr-meta-info__title"}),n.a.createElement(l.Flex,null,a))}function m(e){const{date:t,format:a,relative:r}=e;let s;return r?s=c()(t).fromNow():a&&(s=c()(t).format(a)),n.a.createElement(l.Text,{type:"body-medium",color:"content-color-primary"},s)}const f=i.default.li`
  display: flex;
  width: 100%;

  .space-filler {
    flex: auto;
  }
`;function E(e){const{user:t,renderRight:a}=e;return n.a.createElement(f,null,n.a.createElement(o.default,{size:"medium",userId:t.id,customPic:t.profilePicUrl}),n.a.createElement(u.Username,{className:"pull-request-user__name",currentUserId:t.id,id:t.id,user:t}),n.a.createElement("span",{className:"space-filler"}),a&&a())}}}]);