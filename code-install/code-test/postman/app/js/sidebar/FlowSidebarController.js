(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{"./flow-runner/components/sidebar/FlowSidebarController.ts":function(e,t,o){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=r(o("./collaboration/workspace/controller/ActiveWorkspaceController.ts")),i=r(o("./flow-runner/components/sidebar/FlowSidebarModel.ts"));t.default=class{constructor(){this.reactiveStorage=pm.reactiveStorage}didCreate(){if(this.workspace=s.default.get().id,!this.workspace)return void console.error("FlowSidebarController~didCreate: Got undefined/null workspace id");const e=this.reactiveStorage.subscribe(this.workspace,"flows");this.model=new i.default(e)}beforeDestroy(){var e;null===(e=this.model)||void 0===e||e.dispose(),this.model=void 0,this.workspace&&this.reactiveStorage.dispose(this.workspace)}}},"./flow-runner/components/sidebar/FlowSidebarModel.ts":function(e,t,o){"use strict";var r=this&&this.__decorate||function(e,t,o,r){var s,i=arguments.length,n=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(n=(i<3?s(n):i>3?s(t,o,n):s(t,o))||n);return i>3&&n&&Object.defineProperty(t,o,n),n},s=this&&this.__awaiter||function(e,t,o,r){return new(o||(o=Promise))((function(s,i){function n(e){try{c(r.next(e))}catch(e){i(e)}}function l(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(n,l)}c((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const i=o("./node_modules/lodash/lodash.js"),n=o("../../node_modules/mobx/lib/mobx.module.js"),l=o("./js/stores/get-store.js");class c{constructor(e){this.searchQuery="",this.list=e}get isOffline(){return!l.getStore("SyncStatusStore").isSocketConnected}get isLoading(){return!this.list.isReady}get isPublicWorkspace(){return"public"===l.getStore("ActiveWorkspaceStore").visibilityStatus}setSearchQuery(e){this.searchQuery=e}get items(){let{items:e}=this.list;return e=i.sortBy(e,(e=>e.state.name.toLowerCase())),this.searchQuery.trim()?i.filter(e,(({state:e})=>i.includes(i.toLower(null==e?void 0:e.name),i.toLower(this.searchQuery)))):e}handleAction(e,t){return s(this,void 0,void 0,(function*(){this.isOffline||"delete"===e&&pm.mediator.trigger("showDeleteFlowModal",(()=>s(this,void 0,void 0,(function*(){return this.list.remove(t)}))),(()=>pm.toasts.error("删除流程失败")))}))}dispose(){this.list.dispose()}getDisabledText(){return"重新联网后即可执行此操作"}}r([n.observable],c.prototype,"searchQuery",void 0),r([n.computed],c.prototype,"isOffline",null),r([n.computed],c.prototype,"isLoading",null),r([n.computed],c.prototype,"isPublicWorkspace",null),r([n.action],c.prototype,"setSearchQuery",null),r([n.computed],c.prototype,"items",null),t.default=c}}]);