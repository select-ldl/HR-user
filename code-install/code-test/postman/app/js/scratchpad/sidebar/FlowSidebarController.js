(window.webpackJsonp=window.webpackJsonp||[]).push([[60],{24807:function(e,t,o){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const r=i(o(6352)),s=i(o(24808));t.default=class{constructor(){this.reactiveStorage=pm.reactiveStorage}didCreate(){if(this.workspace=r.default.get().id,!this.workspace)return void console.error("FlowSidebarController~didCreate: Got undefined/null workspace id");const e=this.reactiveStorage.subscribe(this.workspace,"flows");this.model=new s.default(e)}beforeDestroy(){var e;null===(e=this.model)||void 0===e||e.dispose(),this.model=void 0,this.workspace&&this.reactiveStorage.dispose(this.workspace)}}},24808:function(e,t,o){"use strict";var i=this&&this.__decorate||function(e,t,o,i){var r,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var c=e.length-1;c>=0;c--)(r=e[c])&&(n=(s<3?r(n):s>3?r(t,o,n):r(t,o))||n);return s>3&&n&&Object.defineProperty(t,o,n),n},r=this&&this.__awaiter||function(e,t,o,i){return new(o||(o=Promise))((function(r,s){function n(e){try{a(i.next(e))}catch(e){s(e)}}function c(e){try{a(i.throw(e))}catch(e){s(e)}}function a(e){var t;e.done?r(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(n,c)}a((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const s=o(2753),n=o(1656),c=o(5929);class a{constructor(e){this.searchQuery="",this.list=e}get isOffline(){return!c.getStore("SyncStatusStore").isSocketConnected}get isLoading(){return!this.list.isReady}get isPublicWorkspace(){return"public"===c.getStore("ActiveWorkspaceStore").visibilityStatus}setSearchQuery(e){this.searchQuery=e}get items(){let{items:e}=this.list;return e=s.sortBy(e,(e=>e.state.name.toLowerCase())),this.searchQuery.trim()?s.filter(e,(({state:e})=>s.includes(s.toLower(null==e?void 0:e.name),s.toLower(this.searchQuery)))):e}handleAction(e,t){return r(this,void 0,void 0,(function*(){this.isOffline||"delete"===e&&pm.mediator.trigger("showDeleteFlowModal",(()=>r(this,void 0,void 0,(function*(){return this.list.remove(t)}))),(()=>pm.toasts.error("Failed to deleting flow")))}))}dispose(){this.list.dispose()}getDisabledText(){return"You can take this action once you’re back online."}}i([n.observable],a.prototype,"searchQuery",void 0),i([n.computed],a.prototype,"isOffline",null),i([n.computed],a.prototype,"isLoading",null),i([n.computed],a.prototype,"isPublicWorkspace",null),i([n.action],a.prototype,"setSearchQuery",null),i([n.computed],a.prototype,"items",null),t.default=a}}]);