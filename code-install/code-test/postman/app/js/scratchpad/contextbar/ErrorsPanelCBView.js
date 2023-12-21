(window.webpackJsonp=window.webpackJsonp||[]).push([[63],{24812:function(e,t,o){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),l=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),r=this&&this.__decorate||function(e,t,o,n){var l,r=arguments.length,a=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,n);else for(var c=e.length-1;c>=0;c--)(l=e[c])&&(a=(r<3?l(a):r>3?l(t,o,a):l(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a},a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return l(t,e),t},c=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=a(o(2)),u=o(1656),d=c(o(47)),s=o(2353),p=c(o(7145)),f=o(9),m=o(7326),h=o(10814),g=d.default.div`
  display: flex;
  flex-direction: column;
  padding: ${({theme:e})=>e["spacing-s"]} ${({theme:e})=>e["spacing-zero"]};
  gap: ${({theme:e})=>e["spacing-xs"]};
`,y=d.default(f.IconStateFailFillSmall)`
    padding-top: ${({theme:e})=>e["spacing-xs"]};
`,b=d.default(f.Button)`
   margin-left: auto;
   &:not(:hover) {
    background-color: transparent;
  }
`,v=d.default.div`
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
`,E=d.default.div`
    border-bottom: 1px solid ${({theme:e})=>e["border-color-default"]};
`,x=d.default.div`
    display: flex;
    flex-direction: column;
    padding: ${({theme:e})=>e["spacing-zero"]} ${({theme:e})=>e["spacing-s"]};
`,_=({nodeErrors:e,nodeName:t,onMouseOver:o,onMouseLeave:n})=>i.default.createElement(g,null,i.default.createElement(f.Flex,{gap:"spacing-xs"},i.default.createElement(f.Heading,{type:"h6",color:"content-color-primary",text:t}),i.default.createElement(h.ErrorStateIcon,null,e.length)),e.map((e=>i.default.createElement(v,{onMouseOver:o,onMouseLeave:n,key:e},i.default.createElement(y,{color:"content-color-error"}),i.default.createElement(f.Text,{type:"para",color:"content-color-primary"},e),i.default.createElement(b,{className:"copy-button",size:"small",icon:i.default.createElement(f.IconActionCopyStrokeSmall,null),onClick:()=>p.default.copy(e)})))));let O=class extends i.Component{constructor(){super(...arguments),this.hoveredRow=null}render(){const{model:e}=this.props.contextData;return i.default.createElement(i.default.Fragment,null,i.default.createElement(m.ContextBarViewHeader,{title:"Execution issues",onClose:this.props.onClose}),i.default.createElement(x,null,[...e.nodeError.keys()].map((t=>{const o=e.nodeError.get(t),n=e.getNode(t),l=n?e.componentsList[n.type].friendly:"";return n&&o&&o.length?i.default.createElement(i.default.Fragment,null,i.default.createElement(_,{nodeErrors:o,nodeName:l,onMouseOver:u.action((()=>{e.highlightNode=t})),onMouseLeave:u.action((()=>{e.highlightNode=null}))}),i.default.createElement(E,null)):null}))))}};r([u.observable],O.prototype,"hoveredRow",void 0),O=r([s.observer],O),t.default=O}}]);