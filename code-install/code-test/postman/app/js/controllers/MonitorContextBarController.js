(window.webpackJsonp=window.webpackJsonp||[]).push([[69],{"./monitors/controllers/MonitorContextBarController.js":function(t,i,o){"use strict";o.r(i),o.d(i,"default",(function(){return n}));var e=o("./monitors/stores/domain/MonitorActivitiesStore.js"),r=o("./monitors/services/UrlService.js");class n{didCreate(){const t=r.default.getMonitorIdFromActiveRoute();this.monitorActivityStore=new e.default,this.monitorActivityStore.setActiveMonitorId(t)}didActivate(){const t=r.default.getMonitorIdFromActiveRoute();this.monitorActivityStore.isOffline||this.monitorActivityStore.getActivitiesByMonitor({monitorId:t,page:1},!0),this.monitorActivityStore.setActiveMonitorId(t)}willDestroy(){this.monitorActivityStore&&this.monitorActivityStore.offlineObserver&&this.monitorActivityStore.offlineObserver()}}}}]);