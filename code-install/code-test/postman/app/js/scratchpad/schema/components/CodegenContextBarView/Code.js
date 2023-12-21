(window.webpackJsonp=window.webpackJsonp||[]).push([[79],{29785:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return E}));var n,r=a(2),o=a.n(r),s=a(2353),i=a(2778),l=a(29786),d=a(2765),c=a(6882),g=a(7124),p=a(7148),h=a(9),m=a(7307),u=a(9579),f=a(11190),y=a(7326),v=a(7121),w=a(2753),b=a.n(w),_=a(5929);let E=Object(s.observer)(n=class extends r.Component{constructor(e){super(e),this.handleToggleContract=e=>{const{languageSelection:t}=this.state;let a=t.length?t.split("-")[0]:"",n=t.length?t.split("-").slice(1).join("-"):"",r=b.a.get(this.props,"contextData.editor")?"editor":"release";this.setState({contractOnly:e},(()=>{this.state.contractOnly&&i.default.addEventV2({category:"server_code",action:"options",label:`${r}_${a}_${n}_contract_only`,value:1})}))},this.triggerGenerateCode=async()=>{const{languageSelection:e,contractOnly:t,isRelease:a}=this.state,{apiName:n,schemaId:r,tagId:s}=this.getSchemaProperties(this.props.contextData);let d=e.split("-")[0],c=e.split("-").slice(1).join("-"),g=b.a.get(this.props,"contextData.editor")?"editor":"release",p=Object(_.getStore)("CurrentUserStore").isLoggedIn;if(i.default.addEventV2({category:"server_code",action:"generate",label:`${g}_${d}_${c}`,value:1}),!p)return pm.mediator.trigger("showSignInModal",{type:"generateServerCode",origin:"server_code_generate_code_button",continueUrl:new URL(window.location.href)});this.setState({zipUrl:null,filename:null,generating:!0});try{const{url:e,filename:a}=await l.default.generate(n,r,d,c,t,s);this.downloadGeneratedCode(e,a)}catch(e){let t="Unable to generate server boilerplate. Try again later.";e.code&&"parseError"===e.code&&(t=o.a.createElement("span",null,"Unable to parse the OpenAPI specification. Review errors and warnings in your ",a?"schema definition.":o.a.createElement("span",{className:"codegen__error-link",onClick:this.navigateToDefineTab},"schema definition."))),this.setState({zipUrl:null,filename:null,generating:!1,showError:!0,errMsg:t}),pm.logger.error(`Codegen~triggerGenerateCode - Error while waiting on response from generating code for ${n} - ${r}: `,e)}},this.downloadGeneratedCode=(e,t)=>{e?fetch(e).then((e=>{e.arrayBuffer().then((e=>{Object(u.saveAndOpenFile)(t,new Uint8Array(e),"application/zip",((e,t)=>{e?(pm.logger.error("Codegen~downloadGeneratedCode - Failed to download generated code.",e),pm.toasts.error("Unable to download generated code"),this.setState({generating:!1})):(this.setState({generating:!1,showError:!1}),t===u.STATE.SUCCESS&&"browser"!==window.SDK_PLATFORM&&pm.toasts.success("The server boilerplate has been successfully downloaded",{title:"Code generated"}))}))}))})).catch((e=>{pm.logger.error("Codegen~downloadGeneratedCode - Failed to download generated code.",e),pm.toasts.error("Unable to download generated code"),this.setState({generating:!1})})):(this.setState({generating:!1,showError:!0,errMsg:"Something went wrong. Please try again."}),pm.logger.error("Codegen~downloadGeneratedCode - Invalid url given for download",e))},this.renderLanguageMenuItems=e=>{let{templates:t,languageSelection:a}=this.state,n="Select",r=[];if(b.a.isArray(t))for(let e of t)if(b.a.isArray(e.variants))for(let t of e.variants){let s=e.key+"-"+t.key;s===a&&(n=e.label+" - "+t.label),r.push(o.a.createElement(m.MenuItem,{key:s,refKey:s},o.a.createElement("div",{className:"codegen__dropdown-menu-item-label"},e.label," - ",t.label)))}return o.a.createElement(m.Dropdown,{className:"codegen__modal-dropdown",onSelect:this.handleDropdownActionSelect,keyMapHandlers:{quit:this.handleEscape}},o.a.createElement(m.DropdownButton,{type:"secondary",size:"small"},o.a.createElement(g.Button,{disabled:!e||0===r.length},o.a.createElement("div",{className:"codegen__selected-label"},n))),o.a.createElement(m.DropdownMenu,{"align-right":!0,className:"codegen__dropdown-menu"},r))},this.state={showError:!1,zipUrl:"",filename:"",errMsg:"",fetchingTemplates:!0,templates:null,apiType:null,isRelease:!1,contractOnly:!1,languageSelection:0,generating:!1,generateDisabled:!0},this.triggerGenerateCode=this.triggerGenerateCode.bind(this),this.downloadGeneratedCode=this.downloadGeneratedCode.bind(this),this.renderCodeSection=this.renderCodeSection.bind(this),this.handleDropdownActionSelect=this.handleDropdownActionSelect.bind(this),this.handleEscape=this.handleEscape.bind(this),this.handleToggleContract=this.handleToggleContract.bind(this),this.navigateToDefineTab=this.navigateToDefineTab.bind(this)}componentDidMount(){if((async()=>{try{const e=await l.default.getTemplates();this.setState({templates:e,fetchingTemplates:!1})}catch(e){this.setState({templates:null,showError:!0,fetchingTemplates:!1,errMsg:"Unable to get list of available languages and frameworks."}),pm.logger.error("Codegen~templates - Error while waiting on response from getting templates: ",e)}})(),b.a.get(this.props,"contextData.editor")){const e=this.getApiType();i.default.addEventV2({category:"server_code",action:"open",label:"editor_"+e,value:1})}else this.setState({isRelease:!0}),this.fetchSchemaType()}getSchemaProperties(e){return b.a.get(e.model,"activeRelease")?{apiId:b.a.get(e.model,"api.id"),apiName:b.a.get(e.model,"api.name"),versionId:b.a.get(e.model,"apiVersion.id"),schemaId:b.a.get(e.model,"activeRelease.entities.schemas.0.entityId"),tagId:b.a.get(e.model,"activeRelease.entities.schemas.0.tag")}:{apiId:b.a.get(e,"model.apiId"),apiName:b.a.get(e,"model.apiName"),versionId:b.a.get(e,"model.id"),schemaId:b.a.get(e,"model.schema.schemaId"),tagId:null}}async fetchSchemaType(){const{schemaId:e,tagId:t}=this.getSchemaProperties(this.props.contextData);try{const a=await c.default.getReleaseSchema(e,t,["type"]);this.setState({apiType:b.a.get(a,"type",null)}),i.default.addEventV2({category:"server_code",action:"open",label:"release_"+b.a.get(a,"type",null),value:1})}catch(e){pm.logger.error("Codegen~fetchSchemaType - Error while fetching schema type for Release: ",e),this.setState({apiType:"Unknown"})}}getApiType(){return b.a.get(this.props,"contextData.editor")?b.a.get(this.props,"contextData.editor.activeType"):this.state.apiType}navigateToDefineTab(){const{apiId:e,versionId:t}=this.getSchemaProperties(this.props.contextData);d.default.transitionTo("build.apiVersion",{apiId:e,versionId:t},{tab:"define"},{replace:!0})}handleDropdownActionSelect(e){this.setState({languageSelection:e,generateDisabled:!1,showError:!1})}handleEscape(){this.props.onEscape&&this.props.onEscape()}renderCodeSection(){const{generating:e,generateDisabled:t,contractOnly:a,isRelease:n,fetchingTemplates:r}=this.state,s=this.getApiType();if(!s||r)return o.a.createElement("div",{className:"codegen__loader"},o.a.createElement(v.default,null));const l="openapi3"===s,d=e?"Generating...":"Generate Code",c=!!n||b.a.get(this.props,"contextData.schemaValid"),m=!!n||!b.a.get(this.props,"contextData.editor.isDirty"),u=!!n||!!b.a.get(this.props,"contextData.editor.schema"),y=b.a.get(this.props,"contextData.model.apiPermissionStore").canGenerateCode,w=y?u?m?c?"":"Add a valid schema to generate code from it":"Save your changes before generating code.":"Add a schema to generate code from it":"You do not have permission to perform this action";return o.a.createElement("div",{className:"codegen__container"},!l&&o.a.createElement("div",{className:"codegen__banner"},o.a.createElement(h.Banner,null,"Server boilerplate generation is only supported for OpenAPI 3.0 format. ",s?`This API uses ${f.SCHEMA_FORMAT_MAP[s]}.`:"")),o.a.createElement("div",{className:l?"":"codegen__disabled"},o.a.createElement("div",{className:"codegen__description"},o.a.createElement("span",null,"Generate server boilerplate from your API schema. "),o.a.createElement(p.default,{to:"https://go.pstmn.io/docs-server-boilerplate-api",target:"_blank",onClick:()=>{i.default.addEventV2({category:"server_code",action:"learn_more",label:"docs",value:1})}},o.a.createElement("span",{className:"codegen__learn-more-link"},"Learn more"))),o.a.createElement("div",{className:"codegen__generate-text"},"Language and framework"),o.a.createElement("div",null,this.renderLanguageMenuItems(l)),o.a.createElement("div",{className:"codegen__options-container"},o.a.createElement(h.Checkbox,{isChecked:a,onChange:this.handleToggleContract,isDisabled:!l}),o.a.createElement("span",{className:"codegen__options-text"},"Only generate routes and interfaces. "),o.a.createElement(p.default,{to:"https://go.pstmn.io/docs-server-boilerplate-api-contract-only",target:"_blank",onClick:()=>{i.default.addEventV2({category:"server_code",action:"learn_more",label:"docs_contract_only",value:1})}},o.a.createElement("span",{className:"codegen__learn-more-link"},"Learn more"))),o.a.createElement("div",{className:"codegen__button-container"},o.a.createElement(g.Button,{className:"codegen__generate-button",disabled:e||t||!l||!m||!c||!u||!y,type:"secondary",tooltip:w,onClick:this.triggerGenerateCode}," ",d," ")),this.state.showError&&o.a.createElement("div",{className:"codegen__banner"},o.a.createElement(h.Banner,{status:"error",onDismiss:()=>this.setState({showError:!1})},this.state.errMsg))))}render(){return o.a.createElement(r.Fragment,null,o.a.createElement(y.ContextBarViewHeader,{title:o.a.createElement("span",null,"Code Generation ",o.a.createElement(h.Badge,{status:"info",text:"Beta"})),onClose:this.props.onClose}),this.renderCodeSection())}})||n},29786:function(e,t,a){"use strict";a.r(t),function(e){var n=a(6053),r=a(5929);async function o(e,t,a){return n.default.request("/ws/proxy",{method:"post",data:{service:"codegen",method:t,body:a,path:e}})}t.default={getTemplates:async function(){await Object(r.getStore)("SyncStatusStore").onSyncAvailable({timeout:8e3});const t=await o("/artifacts/server-code/options","get");return e.get(t,"body.templates")},generate:async function(t,a,n,r,s,i=""){const l={apiName:t,tagId:i,schemaId:a,language:n,variant:r,options:[{id:"contract",value:s}]};try{const t=await o("/artifacts/server-code","post",l),a=e.get(t,"body.data.downloadLink");return{url:a,filename:e.get(t,"body.data.filename")}}catch(e){if(e.error)throw e.error;throw e}}}}.call(this,a(2753))}}]);