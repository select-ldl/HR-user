(window.webpackJsonp=window.webpackJsonp||[]).push([[47],{"./flow-runner/components/contextbar/ErrorsPanelCBView.tsx":function(e,t,o){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),l=this&&this.__decorate||function(e,t,o,n){var r,l=arguments.length,a=l<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,n);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(a=(l<3?r(a):l>3?r(t,o,a):r(t,o))||a);return l>3&&a&&Object.defineProperty(t,o,a),a},a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return r(t,e),t},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const c=a(o("../../node_modules/react/index.js")),d=o("../../node_modules/mobx/lib/mobx.module.js"),i=s(o("../../node_modules/styled-components/dist/styled-components.browser.esm.js")),u=o("../../node_modules/mobx-react/dist/mobx-react.module.js"),p=s(o("./js/utils/ClipboardHelper.js")),m=o("../../node_modules/@postman/aether/esmLib/index.js"),f=o("./appsdk/contextbar/ContextBarViewHeader.js"),h=o("./flow-runner/components/_base/Icons/icons.tsx"),b=i.default.div`
  display: flex;
  flex-direction: column;
  padding: ${({theme:e})=>e["spacing-s"]} ${({theme:e})=>e["spacing-zero"]};
  gap: ${({theme:e})=>e["spacing-xs"]};
`,g=i.default(m.IconStateFailFillSmall)`
    padding-top: ${({theme:e})=>e["spacing-xs"]};
`,y=i.default(m.Button)`
   margin-left: auto;
   &:not(:hover) {
    background-color: transparent;
  }
`,x=i.default.div`
    display: flex;
    gap: ${({theme:e})=>e["spacing-xs"]};
    padding: ${({theme:e})=>e["spacing-xs"]};

  &:hover {
    background-color: ${({theme:e})=>e["background-color-secondary"]};

    .copy-button{
      path {
        display: block;
      }
    }
  }

  .copy-button{
      path {
        display: none;
      }
    }
`,v=i.default.div`
    border-bottom: 1px solid ${({theme:e})=>e["border-color-default"]};
`,E=i.default.div`
    display: flex;
    flex-direction: column;
    padding: ${({theme:e})=>e["spacing-zero"]} ${({theme:e})=>e["spacing-s"]};
`,_=({nodeErrors:e,nodeName:t,onMouseOver:o,onMouseLeave:n})=>c.default.createElement(b,null,c.default.createElement(m.Flex,{gap:"spacing-xs"},c.default.createElement(m.Heading,{type:"h6",color:"content-color-primary",text:t}),c.default.createElement(h.ErrorStateIcon,null,e.length)),e.map((e=>c.default.createElement(x,{onMouseOver:o,onMouseLeave:n,key:e},c.default.createElement(g,{color:"content-color-error"}),c.default.createElement(m.Text,{type:"para",color:"content-color-primary"},e),c.default.createElement(y,{className:"copy-button",size:"small",icon:c.default.createElement(m.IconActionCopyStrokeSmall,null),onClick:()=>p.default.copy(e)})))));let j=class extends c.Component{constructor(){super(...arguments),this.hoveredRow=null}render(){const{model:e}=this.props.contextData;return c.default.createElement(c.default.Fragment,null,c.default.createElement(f.ContextBarViewHeader,{title:"Execution issues",onClose:this.props.onClose}),c.default.createElement(E,null,[...e.nodeError.keys()].map((t=>{const o=e.nodeError.get(t),n=e.getNode(t),r=n?e.componentsList[n.type].friendly:"";return n&&o&&o.length?c.default.createElement(c.default.Fragment,null,c.default.createElement(_,{nodeErrors:o,nodeName:r,onMouseOver:d.action((()=>{e.highlightNode=t})),onMouseLeave:d.action((()=>{e.highlightNode=null}))}),c.default.createElement(v,null)):null}))))}};l([d.observable],j.prototype,"hoveredRow",void 0),j=l([u.observer],j),t.default=j}}]);