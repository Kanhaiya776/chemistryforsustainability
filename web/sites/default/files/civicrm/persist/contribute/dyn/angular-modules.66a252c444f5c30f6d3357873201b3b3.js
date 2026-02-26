(function(angular, $, _) {
  angular.module('ng')
    .config(['$locationProvider', function($locationProvider) {
      $locationProvider.hashPrefix('');
    }]);


angular.module('afformStandalone', CRM.angular.modules)

    .controller('AfformStandalonePageCtrl', function($scope) {
      $scope.afformTitle = '';
    });

})(angular, CRM.$, CRM._);

/*
 angular-file-upload v2.6.1
 https://github.com/nervgh/angular-file-upload
*/

!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["angular-file-upload"]=t():e["angular-file-upload"]=t()}(this,function(){return function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}var r=o(1),i=n(r),s=o(2),a=n(s),u=o(3),l=n(u),p=o(4),c=n(p),f=o(5),d=n(f),h=o(6),y=n(h),m=o(7),v=n(m),_=o(8),g=n(_),b=o(9),F=n(b),O=o(10),C=n(O),T=o(11),I=n(T),w=o(12),A=n(w),U=o(13),x=n(U);angular.module(i.default.name,[]).value("fileUploaderOptions",a.default).factory("FileUploader",l.default).factory("FileLikeObject",c.default).factory("FileItem",d.default).factory("FileDirective",y.default).factory("FileSelect",v.default).factory("FileDrop",F.default).factory("FileOver",C.default).factory("Pipeline",g.default).directive("nvFileSelect",I.default).directive("nvFileDrop",A.default).directive("nvFileOver",x.default).run(["FileUploader","FileLikeObject","FileItem","FileDirective","FileSelect","FileDrop","FileOver","Pipeline",function(e,t,o,n,r,i,s,a){e.FileLikeObject=t,e.FileItem=o,e.FileDirective=n,e.FileSelect=r,e.FileDrop=i,e.FileOver=s,e.Pipeline=a}])},function(e,t){e.exports={name:"angularFileUpload"}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={url:"/",alias:"file",headers:{},queue:[],progress:0,autoUpload:!1,removeAfterUpload:!1,method:"POST",filters:[],formData:[],queueLimit:Number.MAX_VALUE,withCredentials:!1,disableMultipart:!1}},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t,o,n,i,a,u,g){var b=n.File,F=n.FormData,O=function(){function n(t){r(this,n);var o=p(e);c(this,o,t,{isUploading:!1,_nextIndex:0,_directives:{select:[],drop:[],over:[]}}),this.filters.unshift({name:"queueLimit",fn:this._queueLimitFilter}),this.filters.unshift({name:"folder",fn:this._folderFilter})}return n.prototype.addToQueue=function(e,t,o){var n=this,r=this.isArrayLikeObject(e)?Array.prototype.slice.call(e):[e],i=this._getFilters(o),l=this.queue.length,p=[],c=function e(){var o=r.shift();if(v(o))return f();var l=n.isFile(o)?o:new a(o),c=n._convertFiltersToPipes(i),d=new g(c),h=function(t){var o=t.pipe.originalFilter,r=s(t.args,2),i=r[0],a=r[1];n._onWhenAddingFileFailed(i,o,a),e()},y=function(t,o){var r=new u(n,t,o);p.push(r),n.queue.push(r),n._onAfterAddingFile(r),e()};d.onThrown=h,d.onSuccessful=y,d.exec(l,t)},f=function(){n.queue.length!==l&&(n._onAfterAddingAll(p),n.progress=n._getTotalProgress()),n._render(),n.autoUpload&&n.uploadAll()};c()},n.prototype.removeFromQueue=function(e){var t=this.getIndexOfItem(e),o=this.queue[t];o.isUploading&&o.cancel(),this.queue.splice(t,1),o._destroy(),this.progress=this._getTotalProgress()},n.prototype.clearQueue=function(){for(;this.queue.length;)this.queue[0].remove();this.progress=0},n.prototype.uploadItem=function(e){var t=this.getIndexOfItem(e),o=this.queue[t],n=this.isHTML5?"_xhrTransport":"_iframeTransport";o._prepareToUploading(),this.isUploading||(this._onBeforeUploadItem(o),o.isCancel||(o.isUploading=!0,this.isUploading=!0,this[n](o),this._render()))},n.prototype.cancelItem=function(e){var t=this,o=this.getIndexOfItem(e),n=this.queue[o],r=this.isHTML5?"_xhr":"_form";if(n)if(n.isCancel=!0,n.isUploading)n[r].abort();else{var s=[void 0,0,{}],a=function(){t._onCancelItem.apply(t,[n].concat(s)),t._onCompleteItem.apply(t,[n].concat(s))};i(a)}},n.prototype.uploadAll=function(){var e=this.getNotUploadedItems().filter(function(e){return!e.isUploading});e.length&&(f(e,function(e){return e._prepareToUploading()}),e[0].upload())},n.prototype.cancelAll=function(){var e=this.getNotUploadedItems();f(e,function(e){return e.cancel()})},n.prototype.isFile=function(e){return this.constructor.isFile(e)},n.prototype.isFileLikeObject=function(e){return this.constructor.isFileLikeObject(e)},n.prototype.isArrayLikeObject=function(e){return this.constructor.isArrayLikeObject(e)},n.prototype.getIndexOfItem=function(e){return h(e)?e:this.queue.indexOf(e)},n.prototype.getNotUploadedItems=function(){return this.queue.filter(function(e){return!e.isUploaded})},n.prototype.getReadyItems=function(){return this.queue.filter(function(e){return e.isReady&&!e.isUploading}).sort(function(e,t){return e.index-t.index})},n.prototype.destroy=function(){var e=this;f(this._directives,function(t){f(e._directives[t],function(e){e.destroy()})})},n.prototype.onAfterAddingAll=function(e){},n.prototype.onAfterAddingFile=function(e){},n.prototype.onWhenAddingFileFailed=function(e,t,o){},n.prototype.onBeforeUploadItem=function(e){},n.prototype.onProgressItem=function(e,t){},n.prototype.onProgressAll=function(e){},n.prototype.onSuccessItem=function(e,t,o,n){},n.prototype.onErrorItem=function(e,t,o,n){},n.prototype.onCancelItem=function(e,t,o,n){},n.prototype.onCompleteItem=function(e,t,o,n){},n.prototype.onTimeoutItem=function(e){},n.prototype.onCompleteAll=function(){},n.prototype._getTotalProgress=function(e){if(this.removeAfterUpload)return e||0;var t=this.getNotUploadedItems().length,o=t?this.queue.length-t:this.queue.length,n=100/this.queue.length,r=(e||0)*n/100;return Math.round(o*n+r)},n.prototype._getFilters=function(e){if(!e)return this.filters;if(m(e))return e;var t=e.match(/[^\s,]+/g);return this.filters.filter(function(e){return t.indexOf(e.name)!==-1})},n.prototype._convertFiltersToPipes=function(e){var t=this;return e.map(function(e){var o=l(t,e.fn);return o.isAsync=3===e.fn.length,o.originalFilter=e,o})},n.prototype._render=function(){t.$$phase||t.$apply()},n.prototype._folderFilter=function(e){return!(!e.size&&!e.type)},n.prototype._queueLimitFilter=function(){return this.queue.length<this.queueLimit},n.prototype._isSuccessCode=function(e){return e>=200&&e<300||304===e},n.prototype._transformResponse=function(e,t){var n=this._headersGetter(t);return f(o.defaults.transformResponse,function(t){e=t(e,n)}),e},n.prototype._parseHeaders=function(e){var t,o,n,r={};return e?(f(e.split("\n"),function(e){n=e.indexOf(":"),t=e.slice(0,n).trim().toLowerCase(),o=e.slice(n+1).trim(),t&&(r[t]=r[t]?r[t]+", "+o:o)}),r):r},n.prototype._headersGetter=function(e){return function(t){return t?e[t.toLowerCase()]||null:e}},n.prototype._xhrTransport=function(e){var t,o=this,n=e._xhr=new XMLHttpRequest;if(e.disableMultipart?t=e._file:(t=new F,f(e.formData,function(e){f(e,function(e,o){t.append(o,e)})}),t.append(e.alias,e._file,e.file.name)),"number"!=typeof e._file.size)throw new TypeError("The file specified is no longer valid");n.upload.onprogress=function(t){var n=Math.round(t.lengthComputable?100*t.loaded/t.total:0);o._onProgressItem(e,n)},n.onload=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t),i=o._isSuccessCode(n.status)?"Success":"Error",s="_on"+i+"Item";o[s](e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.onerror=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t);o._onErrorItem(e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.onabort=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t);o._onCancelItem(e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.ontimeout=function(t){var r=o._parseHeaders(n.getAllResponseHeaders()),i="Request Timeout.";o._onTimeoutItem(e),o._onCompleteItem(e,i,408,r)},n.open(e.method,e.url,!0),n.timeout=e.timeout||0,n.withCredentials=e.withCredentials,f(e.headers,function(e,t){n.setRequestHeader(t,e)}),n.send(t)},n.prototype._iframeTransport=function(e){var t=this,o=_('<form style="display: none;" />'),n=_('<iframe name="iframeTransport'+Date.now()+'">'),r=e._input,i=0,s=null,a=!1;e._form&&e._form.replaceWith(r),e._form=o,r.prop("name",e.alias),f(e.formData,function(e){f(e,function(e,t){var n=_('<input type="hidden" name="'+t+'" />');n.val(e),o.append(n)})}),o.prop({action:e.url,method:"POST",target:n.prop("name"),enctype:"multipart/form-data",encoding:"multipart/form-data"}),n.bind("load",function(){var o="",r=200;try{o=n[0].contentDocument.body.innerHTML}catch(e){r=500}if(s&&clearTimeout(s),s=null,a)return!1;var i={response:o,status:r,dummy:!0},u={},l=t._transformResponse(i.response,u);t._onSuccessItem(e,l,i.status,u),t._onCompleteItem(e,l,i.status,u)}),o.abort=function(){var i,s={status:0,dummy:!0},a={};n.unbind("load").prop("src","javascript:false;"),o.replaceWith(r),t._onCancelItem(e,i,s.status,a),t._onCompleteItem(e,i,s.status,a)},r.after(o),o.append(r).append(n),i=e.timeout||0,s=null,i&&(s=setTimeout(function(){a=!0,e.isCancel=!0,e.isUploading&&(n.unbind("load").prop("src","javascript:false;"),o.replaceWith(r));var i={},s="Request Timeout.";t._onTimeoutItem(e),t._onCompleteItem(e,s,408,i)},i)),o[0].submit()},n.prototype._onWhenAddingFileFailed=function(e,t,o){this.onWhenAddingFileFailed(e,t,o)},n.prototype._onAfterAddingFile=function(e){this.onAfterAddingFile(e)},n.prototype._onAfterAddingAll=function(e){this.onAfterAddingAll(e)},n.prototype._onBeforeUploadItem=function(e){e._onBeforeUpload(),this.onBeforeUploadItem(e)},n.prototype._onProgressItem=function(e,t){var o=this._getTotalProgress(t);this.progress=o,e._onProgress(t),this.onProgressItem(e,t),this.onProgressAll(o),this._render()},n.prototype._onSuccessItem=function(e,t,o,n){e._onSuccess(t,o,n),this.onSuccessItem(e,t,o,n)},n.prototype._onErrorItem=function(e,t,o,n){e._onError(t,o,n),this.onErrorItem(e,t,o,n)},n.prototype._onCancelItem=function(e,t,o,n){e._onCancel(t,o,n),this.onCancelItem(e,t,o,n)},n.prototype._onCompleteItem=function(e,t,o,n){e._onComplete(t,o,n),this.onCompleteItem(e,t,o,n);var r=this.getReadyItems()[0];return this.isUploading=!1,y(r)?void r.upload():(this.onCompleteAll(),this.progress=this._getTotalProgress(),void this._render())},n.prototype._onTimeoutItem=function(e){e._onTimeout(),this.onTimeoutItem(e)},n.isFile=function(e){return b&&e instanceof b},n.isFileLikeObject=function(e){return e instanceof a},n.isArrayLikeObject=function(e){return d(e)&&"length"in e},n.inherit=function(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.super_=t},n}();return O.prototype.isHTML5=!(!b||!F),O.isHTML5=O.prototype.isHTML5,O}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){var o=[],n=!0,r=!1,i=void 0;try{for(var s,a=e[Symbol.iterator]();!(n=(s=a.next()).done)&&(o.push(s.value),!t||o.length!==t);n=!0);}catch(e){r=!0,i=e}finally{try{!n&&a.return&&a.return()}finally{if(r)throw i}}return o}return function(t,o){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,o);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();t.default=i;var a=o(1),u=(n(a),angular),l=u.bind,p=u.copy,c=u.extend,f=u.forEach,d=u.isObject,h=u.isNumber,y=u.isDefined,m=u.isArray,v=u.isUndefined,_=u.element;i.$inject=["fileUploaderOptions","$rootScope","$http","$window","$timeout","FileLikeObject","FileItem","Pipeline"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(){return function(){function e(t){r(this,e);var o=l(t),n=o?t.value:t,i=p(n)?"FakePath":"Object",s="_createFrom"+i;this[s](n,t)}return e.prototype._createFromFakePath=function(e,t){this.lastModifiedDate=null,this.size=null,this.type="like/"+e.slice(e.lastIndexOf(".")+1).toLowerCase(),this.name=e.slice(e.lastIndexOf("/")+e.lastIndexOf("\\")+2),this.input=t},e.prototype._createFromObject=function(e){this.lastModifiedDate=u(e.lastModifiedDate),this.size=e.size,this.type=e.type,this.name=e.name,this.input=e.input},e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.copy,l=a.isElement,p=a.isString},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){return function(){function o(e,n,i){r(this,o);var s=!!n.input,a=s?p(n.input):null,c=s?null:n;l(this,{url:e.url,alias:e.alias,headers:u(e.headers),formData:u(e.formData),removeAfterUpload:e.removeAfterUpload,withCredentials:e.withCredentials,disableMultipart:e.disableMultipart,method:e.method,timeout:e.timeout},i,{uploader:e,file:new t(n),isReady:!1,isUploading:!1,isUploaded:!1,isSuccess:!1,isCancel:!1,isError:!1,progress:0,index:null,_file:c,_input:a}),a&&this._replaceNode(a)}return o.prototype.upload=function(){try{this.uploader.uploadItem(this)}catch(t){var e=t.name+":"+t.message;this.uploader._onCompleteItem(this,e,t.code,[]),this.uploader._onErrorItem(this,e,t.code,[])}},o.prototype.cancel=function(){this.uploader.cancelItem(this)},o.prototype.remove=function(){this.uploader.removeFromQueue(this)},o.prototype.onBeforeUpload=function(){},o.prototype.onProgress=function(e){},o.prototype.onSuccess=function(e,t,o){},o.prototype.onError=function(e,t,o){},o.prototype.onCancel=function(e,t,o){},o.prototype.onComplete=function(e,t,o){},o.prototype.onTimeout=function(){},o.prototype._onBeforeUpload=function(){this.isReady=!0,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!1,this.progress=0,this.onBeforeUpload()},o.prototype._onProgress=function(e){this.progress=e,this.onProgress(e)},o.prototype._onSuccess=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!0,this.isCancel=!1,this.isError=!1,this.progress=100,this.index=null,this.onSuccess(e,t,o)},o.prototype._onError=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onError(e,t,o)},o.prototype._onCancel=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!0,this.isError=!1,this.progress=0,this.index=null,this.onCancel(e,t,o)},o.prototype._onComplete=function(e,t,o){this.onComplete(e,t,o),this.removeAfterUpload&&this.remove()},o.prototype._onTimeout=function(){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onTimeout()},o.prototype._destroy=function(){this._input&&this._input.remove(),this._form&&this._form.remove(),delete this._form,delete this._input},o.prototype._prepareToUploading=function(){this.index=this.index||++this.uploader._nextIndex,this.isReady=!0},o.prototype._replaceNode=function(t){var o=e(t.clone())(t.scope());o.prop("value",null),t.css("display","none"),t.after(o)},o}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.copy,l=a.extend,p=a.element;a.isElement;i.$inject=["$compile","FileLikeObject"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(){var e=function(){function e(t){r(this,e),u(this,t),this.uploader._directives[this.prop].push(this),this._saveLinks(),this.bind()}return e.prototype.bind=function(){for(var e in this.events){var t=this.events[e];this.element.bind(e,this[t])}},e.prototype.unbind=function(){for(var e in this.events)this.element.unbind(e,this.events[e])},e.prototype.destroy=function(){var e=this.uploader._directives[this.prop].indexOf(this);this.uploader._directives[this.prop].splice(e,1),this.unbind()},e.prototype._saveLinks=function(){for(var e in this.events){var t=this.events[e];this[t]=this[t].bind(this)}},e}();return e.prototype.events={},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.extend},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return function(t){function o(e){r(this,o);var n=p(e,{events:{$destroy:"destroy",change:"onChange"},prop:"select"}),s=i(this,t.call(this,n));return s.uploader.isHTML5||s.element.removeAttr("multiple"),s.element.prop("value",null),s}return s(o,t),o.prototype.getOptions=function(){},o.prototype.getFilters=function(){},o.prototype.isEmptyAfterSelection=function(){return!!this.element.attr("multiple")},o.prototype.onChange=function(){var t=this.uploader.isHTML5?this.element[0].files:this.element[0],o=this.getOptions(),n=this.getFilters();this.uploader.isHTML5||this.destroy(),this.uploader.addToQueue(t,o,n),this.isEmptyAfterSelection()&&(this.element.prop("value",null),this.element.replaceWith(e(this.element.clone())(this.scope)))},o}(t)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend;a.$inject=["$compile","FileDirective"]},function(e,t){"use strict";function o(e){if(Array.isArray(e)){for(var t=0,o=Array(e.length);t<e.length;t++)o[t]=e[t];return o}return Array.from(e)}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e){return function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];n(this,t),this.pipes=e}return t.prototype.next=function(t){var n=this.pipes.shift();if(a(n))return void this.onSuccessful.apply(this,o(t));var r=new Error("The filter has not passed");if(r.pipe=n,r.args=t,n.isAsync){var i=e.defer(),u=s(this,this.next,t),l=s(this,this.onThrown,r);i.promise.then(u,l),n.apply(void 0,o(t).concat([i]))}else{var p=Boolean(n.apply(void 0,o(t)));p?this.next(t):this.onThrown(r)}},t.prototype.exec=function(){for(var e=arguments.length,t=Array(e),o=0;o<e;o++)t[o]=arguments[o];this.next(t)},t.prototype.onThrown=function(e){},t.prototype.onSuccessful=function(){},t}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=angular,s=i.bind,a=i.isUndefined;r.$inject=["$q"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){return function(e){function t(o){r(this,t);var n=p(o,{events:{$destroy:"destroy",drop:"onDrop",dragover:"onDragOver",dragleave:"onDragLeave"},prop:"drop"});return i(this,e.call(this,n))}return s(t,e),t.prototype.getOptions=function(){},t.prototype.getFilters=function(){},t.prototype.onDrop=function(e){var t=this._getTransfer(e);if(t){var o=this.getOptions(),n=this.getFilters();this._preventAndStop(e),c(this.uploader._directives.over,this._removeOverClass,this),this.uploader.addToQueue(t.files,o,n)}},t.prototype.onDragOver=function(e){var t=this._getTransfer(e);this._haveFiles(t.types)&&(t.dropEffect="copy",this._preventAndStop(e),c(this.uploader._directives.over,this._addOverClass,this))},t.prototype.onDragLeave=function(e){e.currentTarget!==this.element[0]&&(this._preventAndStop(e),c(this.uploader._directives.over,this._removeOverClass,this))},t.prototype._getTransfer=function(e){return e.dataTransfer?e.dataTransfer:e.originalEvent.dataTransfer},t.prototype._preventAndStop=function(e){e.preventDefault(),e.stopPropagation()},t.prototype._haveFiles=function(e){return!!e&&(e.indexOf?e.indexOf("Files")!==-1:!!e.contains&&e.contains("Files"))},t.prototype._addOverClass=function(e){e.addOverClass()},t.prototype._removeOverClass=function(e){e.removeOverClass()},t}(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend,c=l.forEach;a.$inject=["FileDirective"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){return function(e){function t(o){r(this,t);var n=p(o,{events:{$destroy:"destroy"},prop:"over",overClass:"nv-file-over"});return i(this,e.call(this,n))}return s(t,e),t.prototype.addOverClass=function(){this.element.addClass(this.getOverClass())},t.prototype.removeOverClass=function(){this.element.removeClass(this.getOverClass())},t.prototype.getOverClass=function(){return this.overClass},t}(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend;a.$inject=["FileDirective"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t,o){return{link:function(n,r,i){var s=n.$eval(i.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');var a=new o({uploader:s,element:r,scope:n});a.getOptions=e(i.options).bind(a,n),a.getFilters=function(){return i.filters}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["$parse","FileUploader","FileSelect"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t,o){return{link:function(n,r,i){var s=n.$eval(i.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');if(s.isHTML5){var a=new o({uploader:s,element:r});a.getOptions=e(i.options).bind(a,n),a.getFilters=function(){return i.filters}}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["$parse","FileUploader","FileDrop"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){return{link:function(o,n,r){var i=o.$eval(r.uploader);if(!(i instanceof e))throw new TypeError('"Uploader" must be an instance of FileUploader');var s=new t({uploader:i,element:n});s.getOverClass=function(){return r.overClass||s.overClass}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["FileUploader","FileOver"]}])});

(function(angular, $, _) {
  angular.module('api4', CRM.angRequires('api4'));

angular.module('api4').factory('crmApi4', function($q) {
    var crmApi4 = function(entity, action, params, index) {
      var deferred = $q.defer();
      var p;
      var backend = crmApi4.backend || CRM.api4;
      if (_.isObject(entity)) {
        /*jshint -W061 */
        p = backend(eval('('+angular.toJson(entity)+')'), action);
      } else {
        /*jshint -W061 */
        p = backend(entity, action, eval('('+angular.toJson(params)+')'), index);
      }
      p.then(
        function(result) {
          deferred.resolve(result);
        },
        function(error) {
          deferred.reject(error);
        }
      );
      return deferred.promise;
    };
    crmApi4.backend = null;
    crmApi4.val = function(value) {
      var d = $.Deferred();
      d.resolve(value);
      return d.promise();
    };
    return crmApi4;
  });

})(angular, CRM.$, CRM._);

(function(angular, CRM) {
  var crmApp = angular.module('crmApp', CRM.angular.modules);

  crmApp.config(['$routeProvider',
    function($routeProvider) {

      if (CRM.crmApp.defaultRoute) {
        $routeProvider.when('/', {
          template: '<div></div>',
          controller: function($location) {
            $location.path(CRM.crmApp.defaultRoute);
          }
        });
      }

      $routeProvider.otherwise({
        template: ts('Unknown path')
      });
    }
  ]);
})(angular, CRM);

(function (angular, $, _) {

  angular.module('crmAttachment', CRM.angRequires('crmAttachment'));
  angular.module('crmAttachment').factory('CrmAttachments', function (crmApi, crmStatus, FileUploader, $q) {
    function CrmAttachments(target) {
      var crmAttachments = this;
      this._target = target;
      this.files = [];
      this.trash = [];
      this.uploader = new FileUploader({
        url: CRM.url('civicrm/ajax/attachment'),
        onAfterAddingFile: function onAfterAddingFile(item) {
          item.crmData = {
            description: ''
          };
        },
        onSuccessItem: function onSuccessItem(item, response, status, headers) {
          crmAttachments.files.push(response.file.values[response.file.id]);
          crmAttachments.uploader.removeFromQueue(item);
        },
        onErrorItem: function onErrorItem(item, response, status, headers) {
          var msg = (response && response.file && response.file.error_message) ? response.file.error_message : ts('Unknown error');
          CRM.alert(item.file.name + ' - ' + msg, ts('Attachment failed'));
          crmAttachments.uploader.removeFromQueue(item);
        }
      });
    }

    angular.extend(CrmAttachments.prototype, {
      getTarget: function () {
        return (angular.isFunction(this._target) ? this._target() : this._target);
      },
      load: function load() {
        var target = this.getTarget();
        var Attachment = this;

        if (target.entity_id) {
          var params = {
            entity_table: target.entity_table,
            entity_id: target.entity_id
          };
          return crmApi('Attachment', 'get', params).then(function (apiResult) {
            Attachment.files = _.values(apiResult.values);
            return Attachment;
          });
        }
        else {
          var dfr = $q.defer();
          Attachment.files = [];
          dfr.resolve(Attachment);
          return dfr.promise;
        }
      },
      save: function save() {
        var crmAttachments = this;
        var target = this.getTarget();
        if (!target.entity_table || !target.entity_id) {
          throw "Cannot save attachments: unknown entity_table or entity_id";
        }

        var params = _.extend({}, target);
        params.values = crmAttachments.files;
        return crmApi('Attachment', 'replace', params)
          .then(function () {
            var dfr = $q.defer();

            var newItems = crmAttachments.uploader.getNotUploadedItems();
            if (newItems.length > 0) {
              _.each(newItems, function (item) {
                item.formData = [_.extend({crm_attachment_token: CRM.crmAttachment.token}, target, item.crmData)];
              });
              crmAttachments.uploader.onCompleteAll = function onCompleteAll() {
                delete crmAttachments.uploader.onCompleteAll;
                dfr.resolve(crmAttachments);
              };
              crmAttachments.uploader.uploadAll();
            }
            else {
              dfr.resolve(crmAttachments);
            }

            return dfr.promise;
          });
      },
      getAutosaveSignature: function getAutosaveSignature() {
        var sig = [];
        angular.forEach(this.files, function(item) {
          sig.push({f: item.name.replace(/[^a-zA0-Z0-9\.]/, '_'), d: item.description});
        });
        angular.forEach(this.uploader.queue, function(item) {
          sig.push({f: item.file.name.replace(/[^a-zA0-Z0-9\.]/, '_'), d: item.crmData.description});
        });
        angular.forEach(this.trash, function(item) {
          sig.push({f: item.name.replace(/[^a-zA0-Z0-9\.]/, '_'), d: item.description});
        });
        return _.sortBy(sig, 'name');
      },
      deleteFile: function deleteFile(file) {
        var crmAttachments = this;

        var idx = _.indexOf(this.files, file);
        if (idx != -1) {
          this.files.splice(idx, 1);
        }

        this.trash.push(file);

        if (file.id) {
          var p = crmApi('Attachment', 'delete', {id: file.id}).then(
            function () { // success
            },
            function (response) { // error; restore the file
              var msg = angular.isObject(response) ? response.error_message : '';
              CRM.alert(msg, ts('Deletion failed'));
              crmAttachments.files.push(file);

              var trashIdx = _.indexOf(crmAttachments.trash, file);
              if (trashIdx != -1) {
                crmAttachments.trash.splice(trashIdx, 1);
              }
            }
          );
          return crmStatus({start: ts('Deleting...'), success: ts('Deleted')}, p);
        }
      }
    });

    return CrmAttachments;
  });
  angular.module('crmAttachment').directive('crmAttachments', function ($parse, $timeout) {
    return {
      scope: {
        crmAttachments: '@'
      },
      template: '<div ng-if="ready" ng-include="inclUrl"></div>',
      link: function (scope, elm, attr) {
        var model = $parse(attr.crmAttachments);
        scope.att = model(scope.$parent);
        scope.ts = CRM.ts(null);
        scope.max_size = CRM.crmAttachment.maxFileSize;
        scope.inclUrl = '~/crmAttachment/attachments.html';
        scope.ready = true;
      }
    };
  });


angular.module('crmAutosave', CRM.angRequires('crmAutosave'));
  angular.module('crmAutosave').service('CrmAutosaveCtrl', function($interval, $timeout, $q) {
    function CrmAutosaveCtrl(options) {
      var intervals = angular.extend({poll: 250, save: 5000}, options.interval);
      var jobs = {poll: null, save: null}; // job handles used ot cancel/reschedule timeouts/intervals
      var lastSeenModel = null;
      var saving = false;
      function checkChanges() {
        if (saving) {
          return;
        }
        var currentModel = _.isFunction(options.model) ? options.model() : options.model;
        if (!angular.equals(currentModel, lastSeenModel)) {
          lastSeenModel = angular.copy(currentModel);
          if (jobs.save) {
            $timeout.cancel(jobs.save);
          }
          jobs.save = $timeout(doAutosave, intervals.save);
        }
      }

      function doAutosave() {
        jobs.save = null;
        if (saving) {
          return;
        }

        var form = _.isFunction(options.form) ? options.form() : options.form;

        if (options.saveIf) {
          if (!options.saveIf()) {
            return;
          }
        }
        else if (form && form.$invalid) {
          return;
        }

        saving = true;
        lastSeenModel = angular.copy(_.isFunction(options.model) ? options.model() : options.model);
        if (form) {
          form.$setPristine();
        }
        var res = options.save();
        if (res && res.then) {
          res.then(
            function() {
              saving = false;
            },
            function() {
              saving = false;
              if (form) {
                form.$setDirty();
              }
            }
          );
        }
        else {
          saving = false;
        }
      }

      var self = this;

      this.start = function() {
        if (!jobs.poll) {
          lastSeenModel = angular.copy(_.isFunction(options.model) ? options.model() : options.model);
          jobs.poll = $interval(checkChanges, intervals.poll);
        }
      };

      this.stop = function() {
        if (jobs.poll) {
          $interval.cancel(jobs.poll);
          jobs.poll = null;
        }
        if (jobs.save) {
          $timeout.cancel(jobs.save);
          jobs.save = null;
        }
      };

      this.suspend = function(p) {
        self.stop();
        return p.finally(self.start);
      };
    }

    return CrmAutosaveCtrl;
  });


angular.module('crmCiviimport', CRM.angRequires('crmCiviimport'));

  angular.module('crmCiviimport').component('crmImportUi', {
      templateUrl: '~/crmCiviimport/Import.html',
      controller: function($scope, crmApi4, crmStatus, crmUiHelp) {
        var ts = $scope.ts = CRM.ts('civiimport');
        var hs = $scope.hs = crmUiHelp({file: 'CRM/crmCiviimport/crmImportUi'});
        var ctrl = this;

        $scope.load = (function () {
          $scope.data = CRM.vars.crmImportUi;
          $scope.data.rows = CRM.vars.crmImportUi.rows;
          $scope.data.entityMetadata = CRM.vars.crmImportUi.entityMetadata;
          $scope.data.defaults = CRM.vars.crmImportUi.defaults;
          $scope.userJob = CRM.vars.crmImportUi.userJob;
          $scope.data.showColumnNames = $scope.userJob.metadata.submitted_values.skipColumnHeader;
          $scope.data.savedMapping = CRM.vars.crmImportUi.savedMapping;
          $scope.mappingSaving = {updateFieldMapping: 0, newFieldMapping: 0};
          $scope.data.dedupeRules = CRM.vars.crmImportUi.dedupeRules;
          $scope.data.contactTypes = CRM.vars.crmImportUi.contactTypes;
          $scope.data.columnHeaders = CRM.vars.crmImportUi.columnHeaders;
          $scope.data.entities = {};
          $scope.entitySelection = [];
          var entityConfiguration = $scope.userJob.metadata.entity_configuration;
          _.each($scope.data.entityMetadata, function (entityMetadata) {
            var selected = Boolean(entityConfiguration) ? entityConfiguration[entityMetadata.entity_name] : entityMetadata.selected;
            var isActionValid = entityMetadata.actions.filter((function (action) {
              if (action.id === selected.action) {
                return true;
              }
            }));
            if (isActionValid.length === 0) {
              selected.action = entityMetadata.selected.action;
            }

            entityMetadata.dedupe_rules = [];
            if (Boolean(entityMetadata.selected) && Boolean(selected.contact_type)) {
              entityMetadata.dedupe_rules = $scope.getDedupeRules(selected.contact_type);
            }

            $scope.entitySelection.push({
              id: entityMetadata.entity_name,
              text: entityMetadata.entity_title,
              actions: entityMetadata.actions,
              is_contact: Boolean(entityMetadata.is_contact),
              entity_data: entityMetadata.entity_data,
              dedupe_rules: entityMetadata.dedupe_rules,
            });
            $scope.addEntity(entityMetadata.entity_name, selected);
          });

          function buildImportMappings() {
            $scope.data.importMappings = [];
            var importMappings = $scope.userJob.metadata.import_mappings;
            _.each($scope.data.columnHeaders, function (header, index) {
              var fieldName = $scope.data.defaults['mapper[' + index + ']'][0];
              if (Boolean(fieldName)) {
                fieldName = fieldName.replace('__', '.');
              }
              var fieldDefault = null;

              if (Boolean(importMappings) && importMappings.hasOwnProperty(index)) {
                fieldName = importMappings[index].name;
                fieldDefault = importMappings[index].default_value;
              }
              $scope.data.importMappings.push({
                header: header,
                selectedField: fieldName,
                defaultValue: fieldDefault
              });
            });
          }

          buildImportMappings();

        });

        /**
         * Get fields available to map to.
         *
         * @type {function(): {results: $scope.data.entityMetadata}}
         */
        $scope.getFields = (function () {
          var fields = [];
          _.each($scope.data.entityMetadata, function (entity) {
            var selected = $scope.data.entities[entity.entity_name].selected;
            if (selected.action !== 'ignore') {
              availableEntity = _.clone(entity);
              availableEntity.children = filterEntityFields(entity.is_contact, entity.children, selected, entity.entity_name + '.');
              fields.push(availableEntity);
            }
          });
          return {results: fields};
        });

        /**
         * Filter the fields available for the entity based on form selections.
         *
         * Currently we only filter contact fields here, based on contact type, dedupe rule,
         * and action.
         *
         * @type {(function(*=, *=, *=, *=): (*))|*}
         */
        function filterEntityFields(isContact, fields, selection, entityFieldPrefix) {
          if (isContact) {
            return filterContactFields(fields, selection, entityFieldPrefix);
          }
          return fields;
        }

        /**
         * Filter contact fields, removing fields not appropriate for the entity or action.
         *
         * @type {function(*=, *): *}
         */
        function filterContactFields(fields, selection, entityFieldPrefix) {
          var contactType = selection.contact_type;
          var action = selection.action;
          var rules = $scope.data.dedupeRules;
          var dedupeRule = rules[selection.dedupe_rule];
          fields = fields.filter((function (field) {
            var fieldName = field.id.replace(entityFieldPrefix, '');
            if (action === 'select' && !Boolean(field.match_rule) &&
              (!Boolean(dedupeRule) || !Boolean(dedupeRule.fields[fieldName]))
            ) {
              return false;
            }
            if (Boolean(contactType)) {
              var supportedTypes = field.contact_type;
              return supportedTypes[contactType];
            }
            return true;

          }));
          return fields;
        }

        /**
         * Add the entity to the selected scope.
         */
        $scope.addEntity = function (selectedEntity, selected) {
          if ($scope.data.entities[selectedEntity] === undefined) {
            var entityData = $scope.getEntityMetadata(selectedEntity);
            entityData.selected = selected;
            if (entityData.id !== undefined) {
              $scope.data.entities[selectedEntity] = entityData;
            }
          }
        };

        /**
         * Get metadata for the given entity.
         *
         * @param selectedEntity
         * @returns {*[]}
         */
        $scope.getEntityMetadata = function (selectedEntity) {
          var entityData = {};
          _.each($scope.entitySelection, function (entityDetails) {
            if (entityDetails.id === selectedEntity) {

              entityData = entityDetails;
              return false;
            }
          });
          return entityData;
        };

        /**
         * Get a list of dedupe rules for the entity type.
         *
         * @param selectedEntity
         * @returns {{}}
         *   e.g {{name: 'IndividualSupervised', 'text' : 'Name and email', 'is_default' : true}}
         */
        $scope.getDedupeRules = function (selectedEntity) {
          var dedupeRules = [];
          _.each($scope.data.dedupeRules, function (rule) {
            if (rule.contact_type === selectedEntity) {
              dedupeRules.push({'id': rule.name, 'text': rule.title, 'is_default': rule.used === 'Unsupervised'});
            }
          });
          return dedupeRules;
        };

        /**
         * Get the entity for the given field.
         *
         * @type {$scope.getEntityForField}
         */
        $scope.getEntityForField = (function (fieldName) {
          var entityName = '';
          _.each($scope.data.entityMetadata, function (fields) {
            _.each(fields.children, function (field) {
              if (field.id === fieldName) {
                entityName = fields.entity_name;
                return false;
              }
            });
          });
          return entityName;
        });

        $scope.toggleMappingFields = (function (fieldName, extra) {
          if (fieldName === 'updateFieldMapping' && $scope.mappingSaving.updateFieldMapping === 0) {
            $scope.mappingSaving.newFieldMapping = 0;
          }
          if (fieldName === 'newFieldMapping' && $scope.mappingSaving.newFieldMapping === 0) {
            $scope.mappingSaving.updateFieldMapping = 0;
          }
        });

        /**
         * Add another row to the mapping.
         *
         * This row will use a default value and be the same for all rows imported.
         *
         * @type {$scope.addRow}
         */
        $scope.addRow = (function () {
          $scope.data.importMappings.push({'header' : '', 'selectedField' : undefined});
          $scope.userJob.metadata.DataSource.column_headers.push('');
        });

        $scope.alterRow = (function (index, row) {
          if (row.header === '' && row.selectedField === '') {
            $scope.data.importMappings.splice(index, 1);
            $scope.userJob.metadata.DataSource.column_headers.splice(index, 1);
          }
        });

        /**
         * Save the user job configuration on save.
         *
         * We add two arrays to the 'metadata' key. This is in the format returned from `Parser->getFieldMappings()`
         * and is combined with quick form data in that function. In addition to the values permitted by
         * the quickForm 'default_value' is supported.
         * - import mappings. e.g
         *   ['name' => 'financial_type_id', default_value' => 'Cash'],
         *   ['name' => 'soft_credit.contact.external_identifier', 'default_value' => '', 'entity_data' => ['soft_credit' => ['soft_credit_type_id => 7]],
         *   ...
         * - entity_configuration
         *
         * @type {$scope.save}
         */
        $scope.save = (function ($event) {
          $event.preventDefault();
          $scope.userJob.metadata.entity_configuration = {};
          $scope.userJob.metadata.import_mappings = [];
          _.each($scope.entitySelection, function (entity) {
            $scope.userJob.metadata.entity_configuration[entity.id] = entity.selected;
          });
          _.each($scope.data.importMappings, function (importRow, index) {
            selectedEntity = $scope.getEntityForField(importRow.selectedField);
            var entityConfig = {};
            if (selectedEntity === 'SoftCreditContact') {
              entityConfig = {'soft_credit': $scope.userJob.metadata.entity_configuration[selectedEntity]};
            }

            $scope.userJob.metadata.import_mappings.push({
              name: importRow.selectedField,
              default_value: importRow.defaultValue,
              column_number: index,
              entity_data: entityConfig
            });
          });
          crmApi4('UserJob', 'save', {records: [$scope.userJob]})
            .then(function(result) {
              document.getElementById("MapField").submit();
            },
            function(failure) {
              document.getElementById("MapField").submit();
            }
          );
        });

        $scope.load();
      }
    }
  );

  /**
   * This component is for the specific entity within the entity ng-repeat.
   */
  angular.module('crmCiviimport').controller('crmImportUiEntity', function($scope) {
    /**
     * Get the available dedupe rules.
     *
     * @type {function(*): []|*}
     */
    $scope.getDedupeRule = (function() {
      return {results: $scope.entity.dedupe_rules};
    });

    /**
     * Update the metadata module after a change.
     *
     * @type {$scope.updateContactType}
     */
    $scope.updateContactType = (function(entity) {
      entity.dedupe_rules = $scope.getDedupeRules(entity.selected.contact_type);
      entity.selected.dedupe_rule = entity.dedupe_rules[0].id;
    });
  });


  angular.module('crmDialog', CRM.angRequires('crmDialog'));
  angular.module('crmDialog').directive('crmDialogPopup', function(dialogService) {
    return {
      restrict: 'A',
      bindToController: {
        popupTpl: '@',
        popupName: '@crmDialogPopup',
        popupData: '<'
      },
      controller: function($scope, $element) {
        var ctrl = this;
        $element.on('click', function() {
          var options = CRM.utils.adjustDialogDefaults({
            autoOpen: false,
            title: _.trim($element.attr('title') || $element.text())
          });
          dialogService.open(ctrl.popupName, ctrl.popupTpl, ctrl.popupData || {}, options)
            .then(function(success) {
              $element.trigger('crmPopupFormSuccess');
            });
        });
      }
    };
  });
  angular.module('crmDialog').directive('crmDialog', function(dialogService) {
    return {
      restrict: 'A',
      controllerAs: '$dialog',
      controller: function($scope, $parse, $timeout) {
        var $dialog = this;
        $dialog.buttons = [];

        $dialog.close = function(result) {
          dialogService.close($dialog.name, result);
        };

        $dialog.cancel = function() {
          dialogService.cancel($dialog.name);
        };

        $dialog.loadButtons = function() {
          var buttons = [];
          angular.forEach($dialog.buttons, function (crmDialogButton) {
            var button = _.pick(crmDialogButton, ['icons', 'text', 'disabled']);
            button.click = function() {
              $scope.$apply(crmDialogButton.onClick);
            };
            buttons.push(button);
          });
          dialogService.setButtons($dialog.name, buttons);
        };

        $timeout(function() {
          $('.ui-dialog:last input:not([disabled]):not([type="submit"]):first').focus();
        });

      },
      link: function(scope, element, attrs, controller) {
        controller.name = attrs.crmDialog;
        scope[attrs.crmDialog] = controller;
      }
    };
  });
  angular.module('crmDialog').component('crmDialogButton', {
    bindings: {
      disabled: '<',
      icons: '<',
      text: '<',
      onClick: '&'
    },
    require: {
      crmDialog: '?^^crmDialog'
    },
    controller: function($scope) {
      var $ctrl = this;
      $ctrl.$onInit = function() {
        $ctrl.crmDialog.buttons.push(this);
        $scope.$watch('$ctrl.disabled', $ctrl.crmDialog.loadButtons);
        $scope.$watch('$ctrl.text', $ctrl.crmDialog.loadButtons);
        $scope.$watch('$ctrl.icons', $ctrl.crmDialog.loadButtons);
      };
    }
  });


angular.module('crmMailing', CRM.angRequires('crmMailing'));

  angular.module('crmMailing').config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/mailing', {
        template: '<div></div>',
        controller: 'ListMailingsCtrl'
      });

      if (!CRM || !CRM.crmMailing) {
        return;
      }

      $routeProvider.when('/mailing/new', {
        template: '<p>' + ts('Initializing...') + '</p>',
        controller: 'CreateMailingCtrl',
        resolve: {
          selectedMail: function(crmMailingMgr) {
            var m = crmMailingMgr.create({
              template_type: CRM.crmMailing.templateTypes[0].name
            });
            return crmMailingMgr.save(m);
          }
        }
      });

      $routeProvider.when('/mailing/new/:templateType', {
        template: '<p>' + ts('Initializing...') + '</p>',
        controller: 'CreateMailingCtrl',
        resolve: {
          selectedMail: function($route, crmMailingMgr) {
            var m = crmMailingMgr.create({
              template_type: $route.current.params.templateType
            });
            return crmMailingMgr.save(m);
          }
        }
      });

      $routeProvider.when('/mailing/:id', {
        templateUrl: '~/crmMailing/EditMailingCtrl/base.html',
        controller: 'EditMailingCtrl',
        resolve: {
          selectedMail: function($route, crmMailingMgr) {
            return crmMailingMgr.get($route.current.params.id);
          },
          mailingFields: function(crmMetadata) {
            return crmMetadata.getFields('Mailing');
          },
          attachments: function($route, CrmAttachments) {
            var attachments = new CrmAttachments(function () {
              return {entity_table: 'civicrm_mailing', entity_id: $route.current.params.id};
            });
            return attachments.load();
          }
        }
      });
    }
  ]);


angular.module('crmMailing').directive('crmMailingBlockApprove', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockApprove', '~/crmMailing/BlockApprove.html');
  });

angular.module('crmMailing').directive('crmMailingBlockHeaderFooter', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockHeaderFooter', '~/crmMailing/BlockHeaderFooter.html');
  });

angular.module('crmMailing').directive('crmMailingBlockMailing', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockMailing', '~/crmMailing/BlockMailing.html');
  });

angular.module('crmMailing').directive('crmMailingBlockPreview', function(crmUiHelp) {
    return {
      templateUrl: '~/crmMailing/BlockPreview.html',
      link: function(scope, elm, attr) {
        scope.$watch(attr.crmMailing, function(newValue) {
          scope.mailing = newValue;
        });
        scope.crmMailingConst = CRM.crmMailing;
        scope.ts = CRM.ts('civi_mail');
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
        scope.testContact = {email: CRM.crmMailing.defaultTestEmail};
        scope.testGroup = {gid: null};

        scope.doPreview = function(mode) {
          scope.$eval(attr.onPreview, {
            preview: {mode: mode}
          });
        };
        scope.doSend = function doSend(recipient) {
          recipient = JSON.parse(JSON.stringify(recipient).replace(/\,\s/g, ','));
          scope.$eval(attr.onSend, {
            preview: {recipient: recipient}
          });
        };

        scope.previewTestGroup = function(e) {
          var $dialog = $(this);
          $dialog.html('<div class="crm-loading-element"></div>').parent().find('button[data-op=yes]').prop('disabled', true);
          CRM.api3({
            contact: ['contact', 'get', {group: scope.testGroup.gid, options: {limit: 0}, return: 'display_name,email'}],
            group: ['group', 'getsingle', {id: scope.testGroup.gid, return: 'title'}]
          }).done(function(data) {
            $dialog.dialog('option', 'title', ts('Send to %1', {1: data.group.title}));
            var count = 0,
            markup = '<ol>';
            _.each(data.contact.values, function(row) {
              if (row.email) {
                count++;
                markup += '<li>' + row.display_name + ' - ' + row.email + '</li>';
              }
            });
            markup += '</ol>';
            markup = '<h4>' + ts('A test message will be sent to %1 people:', {1: count}) + '</h4>' + markup;
            if (!count) {
              markup = '<div class="messages status"><i class="crm-i fa-exclamation-triangle" aria-hidden="true"></i> ' +
              (data.contact.count ? ts('None of the contacts in this group have an email address.') : ts('Group is empty.')) +
              '</div>';
            }
            $dialog
              .html(markup)
              .trigger('crmLoad')
              .parent().find('button[data-op=yes]').prop('disabled', !count);
          });
        };
      }
    };
  });


angular.module('crmMailing').directive('crmMailingBlockPublication', function (crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockPublication', '~/crmMailing/BlockPublication.html');
  });

angular.module('crmMailing').directive('crmMailingBlockRecipients', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockRecipients', '~/crmMailing/BlockRecipients.html');
  });

angular.module('crmMailing').directive('crmMailingBlockRecipientsMultiline', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockRecipientsMultiline', '~/crmMailing/BlockRecipientsMultiline.html');
  });

angular.module('crmMailing').directive('crmMailingBlockResponses', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockResponses', '~/crmMailing/BlockResponses.html');
  });

angular.module('crmMailing').directive('crmMailingBlockReview', function (crmMailingPreviewMgr) {
    return {
      scope: {
        crmMailing: '@',
        crmMailingAttachments: '@'
      },
      templateUrl: '~/crmMailing/BlockReview.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
        });
        scope.$parent.$watch(attr.crmMailingAttachments, function(newValue){
          scope.attachments = newValue;
        });
        scope.crmMailingConst = CRM.crmMailing;
        scope.ts = CRM.ts('civi_mail');
        scope.previewMailing = function previewMailing(mailing, mode) {
          return crmMailingPreviewMgr.preview(mailing, mode);
        };
      }
    };
  });


angular.module('crmMailing').directive('crmMailingBlockSchedule', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockSchedule', '~/crmMailing/BlockSchedule.html');
  });

angular.module('crmMailing').directive('crmMailingBlockSummary', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockSummary', '~/crmMailing/BlockSummary.html');
  });

angular.module('crmMailing').directive('crmMailingBlockTemplates', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockTemplates', '~/crmMailing/BlockTemplates.html');
  });

angular.module('crmMailing').directive('crmMailingBlockTracking', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBlockTracking', '~/crmMailing/BlockTracking.html');
  });

angular.module('crmMailing').directive('crmMailingBodyHtml', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBodyHtml', '~/crmMailing/BodyHtml.html');
  });

angular.module('crmMailing').directive('crmMailingBodyText', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMailingBodyText', '~/crmMailing/BodyText.html');
  });

angular.module('crmMailing').controller('CreateMailingCtrl', function EditMailingCtrl($scope, selectedMail, $location) {
    $location.path("/mailing/" + selectedMail.id);
    $location.replace();
  });


angular.module('crmMailing').controller('EditMailingCtrl', function EditMailingCtrl($scope, selectedMail, $location, crmMailingMgr, crmStatus, attachments, crmMailingPreviewMgr, crmBlocker, CrmAutosaveCtrl, $timeout, crmUiHelp, mailingFields) {
    var APPROVAL_STATUSES = {'Approved': 1, 'Rejected': 2, 'None': 3};

    $scope.mailing = selectedMail;
    $scope.attachments = attachments;
    $scope.crmMailingConst = CRM.crmMailing;
    $scope.checkPerm = CRM.checkPerm;
    $scope.mailingFields = mailingFields;

    var ts = $scope.ts = CRM.ts('civi_mail');
    $scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
    var block = $scope.block = crmBlocker();
    var myAutosave = null;

    var templateTypes = _.where(CRM.crmMailing.templateTypes, {name: selectedMail.template_type});
    if (!templateTypes[0]) throw 'Unrecognized template type: ' + selectedMail.template_type;
    $scope.mailingEditorUrl = templateTypes[0].editorUrl;

    $scope.isSubmitted = function isSubmitted() {
      return _.size($scope.mailing.jobs) > 0;
    };
    $scope.approve = function approve(status, options) {
      $scope.mailing.approval_status_id = APPROVAL_STATUSES[status];
      return myAutosave.suspend($scope.submit(options));
    };
    $scope.previewMailing = function previewMailing(mailing, mode) {
      return crmMailingPreviewMgr.preview(mailing, mode);
    };
    $scope.sendTest = function sendTest(mailing, attachments, recipient) {
      var savePromise = crmMailingMgr.save(mailing)
        .then(function() {
          return attachments.save();
        });
      return block(crmStatus({start: ts('Saving...'), success: ''}, savePromise)
        .then(function() {
          crmMailingPreviewMgr.sendTest(mailing, recipient);
        }));
    };
    $scope.submit = function submit(options) {
      options = options || {};
      if (block.check()) {
        return;
      }

      var promise = crmMailingMgr.save($scope.mailing)
          .then(function() {
            return $scope.attachments.save();
          })
          .then(function() {
            return crmMailingMgr.submit($scope.mailing);
          })
          .then(function() {
            if (!options.stay) {
              $scope.leave('scheduled');
            }
          })
        ;
      return block(crmStatus({start: ts('Submitting...'), success: ts('Submitted')}, promise));
    };
    $scope.save = function save() {
      return block(crmStatus(null,
        crmMailingMgr
          .save($scope.mailing)
          .then(function() {
            return $scope.attachments.save();
          })
      ));
    };
    $scope.delete = function cancel() {
      return block(crmStatus({start: ts('Deleting...'), success: ts('Deleted')},
        crmMailingMgr.delete($scope.mailing)
          .then(function() {
            $scope.leave('unscheduled');
          })
      ));
    };
    $scope.leave = function leave(listingScreen) {
      switch (listingScreen) {
        case 'archive':
          window.location = CRM.url('civicrm/mailing/browse/archived', {
            reset: 1
          });
          break;
        case 'scheduled':
          window.location = CRM.url('civicrm/mailing/browse/scheduled', {
            reset: 1,
            scheduled: 'true'
          });
          break;
        case 'unscheduled':
        /* falls through */
        default:
          window.location = CRM.url('civicrm/mailing/browse/unscheduled', {
            reset: 1,
            scheduled: 'false'
          });
      }
    };

    myAutosave = new CrmAutosaveCtrl({
      save: $scope.save,
      saveIf: function() {
        return true;
      },
      model: function() {
        var mailing = angular.copy($scope.mailing);
        mailing.modified_date = undefined;
        return [mailing, $scope.attachments.getAutosaveSignature()];
      },
      form: function() {
        return $scope.crmMailing;
      }
    });
    $timeout(myAutosave.start);
    $scope.$on('$destroy', myAutosave.stop);
  });


angular.module('crmMailing').controller('EditRecipCtrl', function EditRecipCtrl($scope, dialogService, crmApi, crmMailingMgr, $q, crmMetadata, crmStatus, crmMailingCache) {
    var RECIPIENTS_DEBOUNCE_MS = 100;
    var SETTING_DEBOUNCE_MS = 5000;
    var RECIPIENTS_PREVIEW_LIMIT = 50;

    var ts = $scope.ts = CRM.ts('civi_mail');

    $scope.recipients = null;
    $scope.outdated = null;
    $scope.permitRecipientRebuild = null;

    $scope.getRecipientsEstimate = function() {
      var ts = $scope.ts;
      if ($scope.recipients === null) {
        return ts('Estimating...');
      }
      if ($scope.recipients === 0) {
        return ts('Estimate recipient count');
      }
      return ts('Refresh recipient count');
    };

    $scope.getRecipientCount = function() {
      var ts = $scope.ts;
      if ($scope.recipients === 0) {
        return ts('No Recipients');
      }
      else if ($scope.recipients > 0) {
        return ts('~%1 recipients', {1 : $scope.recipients});
      }
      else if ($scope.outdated) {
        return ts('(unknown)');
      }
      else {
        return $scope.permitRecipientRebuild ? ts('(unknown)') : ts('Estimating...');
      }
    };
    var refreshRecipients = _.debounce(function() {
      $scope.$apply(function() {
        if (!$scope.mailing) {
          return;
        }
        crmMailingMgr.previewRecipientCount($scope.mailing, crmMailingCache, !$scope.permitRecipientRebuild).then(function(recipients) {
          $scope.outdated = ($scope.permitRecipientRebuild && _.difference($scope.mailing.recipients, crmMailingCache.get('mailing-' + $scope.mailing.id + '-recipient-params')) !== 0);
          $scope.recipients = recipients;
        });
      });
    }, RECIPIENTS_DEBOUNCE_MS);
    $scope.$watchCollection("mailing.dedupe_email", refreshRecipients);
    $scope.$watchCollection("mailing.location_type_id", refreshRecipients);
    $scope.$watchCollection("mailing.email_selection_method", refreshRecipients);
    $scope.$watchCollection("mailing.recipients.groups.include", refreshRecipients);
    $scope.$watchCollection("mailing.recipients.groups.exclude", refreshRecipients);
    $scope.$watchCollection("mailing.recipients.mailings.include", refreshRecipients);
    $scope.$watchCollection("mailing.recipients.mailings.exclude", refreshRecipients);
    var refreshSetting = _.debounce(function() {
      $scope.$apply(function() {
        $scope.permitRecipientRebuild = !$scope.$parent.crmMailingConst.autoRecipientRebuild;
      });
    }, SETTING_DEBOUNCE_MS);
    $scope.$watchCollection("permitRecipientRebuild", refreshSetting);

    $scope.previewRecipients = function previewRecipients() {
      var model = {
        count: $scope.recipients,
        sample: crmMailingCache.get('mailing-' + $scope.mailing.id + '-recipient-list'),
        sampleLimit: RECIPIENTS_PREVIEW_LIMIT
      };
      var options = CRM.utils.adjustDialogDefaults({
        width: '40%',
        autoOpen: false,
        title: ts('Preview (%1)', {1: $scope.getRecipientCount()})
      });
      if ($scope.recipients !== 0 && !$scope.outdated) {
        if (!_.isEmpty(model.sample)) {
          dialogService.open('recipDialog', '~/crmMailing/PreviewRecipCtrl.html', model, options);
        }
        else {
          return crmStatus({start: ts('Previewing...'), success: ''}, crmMailingMgr.previewRecipients($scope.mailing, RECIPIENTS_PREVIEW_LIMIT).then(function(recipients) {
            model.sample = recipients;
            dialogService.open('recipDialog', '~/crmMailing/PreviewRecipCtrl.html', model, options);
          }));
        }
      }
    };

    $scope.rebuildRecipients = function rebuildRecipients() {
      $scope.recipients = null;
      return crmMailingMgr.previewRecipientCount($scope.mailing, crmMailingCache, true).then(function(recipients) {
        $scope.outdated = (recipients === 0) ? true : false;
        $scope.recipients = recipients;
      });
    };
    $scope.editOptions = function editOptions(mailing) {
      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        width: '40%',
        height: 'auto',
        title: ts('Edit Options')
      });
      $q.when(crmMetadata.getFields('Mailing')).then(function(fields) {
        var model = {
          fields: fields,
          mailing: mailing
        };
        dialogService.open('previewComponentDialog', '~/crmMailing/EditRecipOptionsDialogCtrl.html', model, options);
      });
    };
  });


angular.module('crmMailing').controller('EditRecipOptionsDialogCtrl', function EditRecipOptionsDialogCtrl($scope, crmUiHelp) {
    $scope.ts = CRM.ts('civi_mail');
    $scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
  });


angular.module('crmMailing').controller('EditUnsubGroupCtrl', function EditUnsubGroupCtrl($scope, crmMailingLoader) {
    var mandatoryIds = [];

    $scope.isUnsubGroupRequired = function isUnsubGroupRequired(mailing) {
      crmMailingLoader.getGroupNames(mailing);

      if (!_.isEmpty(CRM.crmMailing.groupNames)) {
        _.each(CRM.crmMailing.groupNames, function(grp) {
          if (grp.is_hidden == "1") {
            mandatoryIds.push(parseInt(grp.id));
          }
        });
        return _.intersection(mandatoryIds, mailing.recipients.groups.include).length > 0;
      }
    };
  });


angular.module('crmMailing').controller('EmailAddrCtrl', function EmailAddrCtrl($scope, crmFromAddresses, crmUiAlert) {
    var ts = CRM.ts('civi_mail');

    function changeAlert(winnerField, loserField) {
      crmUiAlert({
        title: ts('Conflict'),
        text: ts('The "%1" option conflicts with the "%2" option. The "%2" option has been disabled.', {
          1: winnerField,
          2: loserField
        })
      });
    }

    $scope.crmFromAddresses = crmFromAddresses;
    $scope.checkReplyToChange = function checkReplyToChange(mailing) {
      if (!_.isEmpty(mailing.replyto_email) && mailing.override_verp == '0') {
        mailing.override_verp = '1';
        changeAlert(ts('Reply-To'), ts('Track Replies'));
      }
    };
    $scope.checkVerpChange = function checkVerpChange(mailing) {
      if (!_.isEmpty(mailing.replyto_email) && mailing.override_verp == '0') {
        mailing.replyto_email = '';
        changeAlert(ts('Track Replies'), ts('Reply-To'));
      }
    };
  });


var lastEmailTokenAlert = null;
  angular.module('crmMailing').controller('EmailBodyCtrl', function EmailBodyCtrl($scope, crmMailingMgr, crmUiAlert, $timeout) {
    var ts = CRM.ts('civi_mail');
    $scope.hasAllTokens = function hasAllTokens(mailing, field) {
      return _.isEmpty(crmMailingMgr.findMissingTokens(mailing, field));
    };
    $scope.checkTokens = function checkTokens(mailing, field, insertEvent) {
      if (lastEmailTokenAlert) {
        lastEmailTokenAlert.close();
      }
      var missing, insertable;
      if (field == '*') {
        insertable = false;
        missing = angular.extend({},
          crmMailingMgr.findMissingTokens(mailing, 'body_html'),
          crmMailingMgr.findMissingTokens(mailing, 'body_text')
        );
      }
      else {
        insertable = !_.isEmpty(insertEvent);
        missing = crmMailingMgr.findMissingTokens(mailing, field);
      }
      if (!_.isEmpty(missing)) {
        lastEmailTokenAlert = crmUiAlert({
          type: 'error',
          title: ts('Required tokens'),
          templateUrl: '~/crmMailing/EmailBodyCtrl/tokenAlert.html',
          scope: angular.extend($scope.$new(), {
            insertable: insertable,
            insertToken: function(token) {
              $timeout(function() {
                $scope.$broadcast(insertEvent, '{' + token + '}');
                $timeout(function() {
                  checkTokens(mailing, field, insertEvent);
                });
              });
            },
            missing: missing
          })
        });
      }
    };
  });


angular.module('crmMailing').directive('crmMailingFromAddress', function(crmFromAddresses) {
    return {
      link: function(scope, element, attrs) {
        var placeholder = attrs.crmMailingFromAddress;
        var mailing = null;
        scope.$watch(attrs.crmMailing, function(newValue) {
          mailing = newValue;
          scope[placeholder] = {
            label: crmFromAddresses.getByAuthorEmail(mailing.from_name, mailing.from_email, true).label
          };
        });
        scope.$watch(placeholder + '.label', function(newValue) {
          var addr = crmFromAddresses.getByLabel(newValue);
          mailing.from_name = addr.author;
          mailing.from_email = addr.email;
          if (!CRM.crmMailing.enableReplyTo) {
            mailing.replyto_email = crmFromAddresses.getByAuthorEmail(mailing.from_name, mailing.from_email, true).label;
          }
        });
      }
    };
  });

angular.module('crmMailing').controller('ListMailingsCtrl', ['crmLegacy', 'crmNavigator', function ListMailingsCtrl(crmLegacy, crmNavigator) {
    var new_url = crmLegacy.url('civicrm/mailing/browse/unscheduled', {reset: 1, scheduled: 'false'});
    crmNavigator.redirect(new_url);
  }]);


angular.module('crmMailing').controller('MsgTemplateCtrl', function MsgTemplateCtrl($scope, crmMsgTemplates, dialogService) {
    var ts = $scope.ts = CRM.ts('civi_mail');
    $scope.crmMsgTemplates = crmMsgTemplates;
    $scope.checkPerm = CRM.checkPerm;
    $scope.saveTemplate = function saveTemplate(mailing) {
      var model = {
        selected_id: mailing.msg_template_id,
        tpl: {
          msg_title: '',
          msg_subject: mailing.subject,
          msg_text: mailing.body_text,
          msg_html: mailing.body_html
        }
      };
      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: ts('Save Template')
      });
      return dialogService.open('saveTemplateDialog', '~/crmMailing/SaveMsgTemplateDialogCtrl.html', model, options)
        .then(function(item) {
          mailing.msg_template_id = item.id;
          return item;
        });
    };
    $scope.loadTemplate = function loadTemplate(mailing, id) {
      return crmMsgTemplates.get(id).then(function(tpl) {
        mailing.msg_template_id = tpl.id;
        mailing.subject = tpl.msg_subject;
        mailing.body_text = tpl.msg_text;
        mailing.body_html = tpl.msg_html;
      });
    };
  });


angular.module('crmMailing').controller('PreviewComponentCtrl', function PreviewComponentCtrl($scope, dialogService) {
    var ts = $scope.ts = CRM.ts('civi_mail');

    $scope.previewComponent = function previewComponent(title, componentId) {
      var component = _.where(CRM.crmMailing.headerfooterList, {id: "" + componentId});
      if (!component || !component[0]) {
        CRM.alert(ts('Invalid component ID (%1)', {
          1: componentId
        }));
        return;
      }
      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        title: title // component[0].name
      });
      dialogService.open('previewComponentDialog', '~/crmMailing/PreviewComponentDialogCtrl.html', component[0], options);
    };
  });


angular.module('crmMailing').controller('PreviewComponentDialogCtrl', function PreviewComponentDialogCtrl($scope) {
    $scope.ts = CRM.ts('civi_mail');
  });


angular.module('crmMailing').controller('PreviewMailingDialogCtrl', function PreviewMailingDialogCtrl($scope) {
    $scope.ts = CRM.ts('civi_mail');
  });


angular.module('crmMailing').controller('PreviewRecipCtrl', function($scope) {
    $scope.ts = CRM.ts('civi_mail');
  });


function parseYmdHms(d) {
    var parts = d.split(/[\-: ]/);
    return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
  }

  function isDateBefore(tgt, cutoff, tolerance) {
    var ad = parseYmdHms(tgt), bd = parseYmdHms(cutoff);
    return  ad < bd-tolerance;
  }
  angular.module('crmMailing').directive('crmMailingRadioDate', function(crmUiAlert) {
    return {
      require: 'ngModel',
      link: function($scope, element, attrs, ngModel) {
        var lastAlert = null;

        var schedule = $scope[attrs.crmMailingRadioDate] = {
          mode: 'now',
          datetime: ''
        };

        ngModel.$render = function $render() {
          var sched = ngModel.$viewValue;
          if (!_.isEmpty(sched)) {
            schedule.mode = 'at';
            schedule.datetime = sched;
          }
          else {
            schedule.mode = 'now';
            schedule.datetime = '';
          }
        };

        var updateParent = (function() {
          switch (schedule.mode) {
            case 'now':
              ngModel.$setViewValue(null);
              schedule.datetime = '';
              break;
            case 'at':
              schedule.datetime = schedule.datetime || '?';
              ngModel.$setViewValue(schedule.datetime);
              break;
            default:
              throw 'Unrecognized schedule mode: ' + schedule.mode;
          }
        });

        element
          .on('click', ':radio[value=at]', function() {
            $('.crm-form-date', element).focus();
          })
          .on('change', '.crm-hidden-date', function(e, context) {
            if (context === 'userInput' && $(this).val() === '' && $(this).siblings('.crm-form-date').val().length) {
              schedule.mode = 'at';
              schedule.datetime = '?';
            } else {
              var d = new Date(),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear(),
                hours = '' + d.getHours(),
                minutes = '' + d.getMinutes(),
                submittedDate = $(this).val();
              if (month.length < 2) month = '0' + month;
              if (day.length < 2) day = '0' + day;
              if (hours.length < 2) hours = '0' + hours;
              if (minutes.length < 2) minutes = '0' + minutes;
              var
                date = [year, month, day].join('-'),
                time = [hours, minutes, "00"].join(':'),
                currentDate = date + ' ' + time,
                isInPast = (submittedDate.length && submittedDate.match(/^[0-9\-]+ [0-9\:]+$/) && isDateBefore(submittedDate, currentDate, 4*60*60*1000));
              ngModel.$setValidity('dateTimeInThePast', !isInPast);
              if (lastAlert && lastAlert.isOpen) {
                lastAlert.close();
              }
              if (isInPast) {
                lastAlert = crmUiAlert({
                  text: ts('The scheduled date and time is in the past'),
                  title: ts('Error')
                });
              }
            }
          });

        $scope.$watch(attrs.crmMailingRadioDate + '.mode', updateParent);
        $scope.$watch(attrs.crmMailingRadioDate + '.datetime', function(newValue, oldValue) {
          if (typeof oldValue === 'undefined') {
            oldValue = '';
          }
          if (typeof newValue === 'undefined') {
            newValue = '';
          }
          if (oldValue !== newValue) {
            if (_.isEmpty(newValue)) {
              schedule.mode = 'now';
            }
            else {
              schedule.mode = 'at';
            }
          }
          updateParent();
        });
      }
    };
  });

angular.module('crmMailing').directive('crmMailingReviewBool', function() {
    return {
      scope: {
        crmOn: '@',
        crmTitle: '@'
      },
      template: '<span ng-class="spanClasses"><i class="crm-i" ng-class="iconClasses"></i> {{evalTitle}} </span>',
      link: function(scope, element, attrs) {
        function refresh() {
          if (scope.$parent.$eval(attrs.crmOn)) {
            scope.spanClasses = {'crmMailing-active': true};
            scope.iconClasses = {'fa-check': true};
          }
          else {
            scope.spanClasses = {'crmMailing-inactive': true};
            scope.iconClasses = {'fa-times': true};
          }
          scope.evalTitle = scope.$parent.$eval(attrs.crmTitle);
        }

        refresh();
        scope.$parent.$watch(attrs.crmOn, refresh);
        scope.$parent.$watch(attrs.crmTitle, refresh);
      }
    };
  });

angular.module('crmMailing').controller('SaveMsgTemplateDialogCtrl', function SaveMsgTemplateDialogCtrl($scope, crmMsgTemplates, dialogService) {
    var ts = $scope.ts = CRM.ts('civi_mail');
    $scope.saveOpt = {mode: '', newTitle: ''};
    $scope.selected = null;

    $scope.save = function save() {
      var tpl = _.extend({}, $scope.model.tpl);
      switch ($scope.saveOpt.mode) {
        case 'add':
          tpl.msg_title = $scope.saveOpt.newTitle;
          break;
        case 'update':
          tpl.id = $scope.selected.id;
          tpl.msg_title = $scope.selected.msg_title;
          break;
        default:
          throw 'SaveMsgTemplateDialogCtrl: Unrecognized mode: ' + $scope.saveOpt.mode;
      }
      return crmMsgTemplates.save(tpl)
        .then(function (item) {
          CRM.status(ts('Saved'));
          return item;
        });
    };

    function scopeApply(f) {
      return function () {
        var args = arguments;
        $scope.$apply(function () {
          f.apply(args);
        });
      };
    }

    function init() {
      crmMsgTemplates.get($scope.model.selected_id).then(
        function (tpl) {
          $scope.saveOpt.mode = 'update';
          $scope.selected = tpl;
        },
        function () {
          $scope.saveOpt.mode = 'add';
          $scope.selected = null;
        }
      );
      var buttons = [
        {
          text: ts('Save'),
          icons: {primary: 'fa-check'},
          click: function () {
            $scope.save().then(function (item) {
              dialogService.close('saveTemplateDialog', item);
            });
          }
        },
        {
          text: ts('Cancel'),
          icons: {primary: 'fa-times'},
          click: function () {
            dialogService.cancel('saveTemplateDialog');
          }
        }
      ];
      dialogService.setButtons('saveTemplateDialog', buttons);
    }

    setTimeout(scopeApply(init), 0);
  });


angular.module('crmMailing').directive('crmMailingTemplates', function(crmUiAlert) {
      return {
          restrict: 'AE',
          require: 'ngModel',
          scope: {
            ngRequired: '@'
          },
          link: function(scope, element, attrs, ngModel) {
            scope.template = ngModel.$viewValue;

            var refreshUI = ngModel.$render = function refresuhUI() {
              scope.template = ngModel.$viewValue;
              if (ngModel.$viewValue) {
                $(element).select2('val', ngModel.$viewValue);
              }
            };
            function formatItem(item) {
              if (!item.id) {
                return item.text;
              }
              return '<span class="crmMailing-template">' + item.text + '</span>';
            }

            var rcpAjaxState = {
              input: '',
              entity: 'civicrm_msg_templates',
              page_n: 0,
              page_i: 0,
            };

            $(element).select2({
              width: '36em',
              placeholder: "<i class='fa fa-clipboard'></i> Mailing Templates",
              formatResult: formatItem,
              escapeMarkup: function(m) {
                return m;
              },
              multiple: false,
              initSelection: function(el, cb) {

                  var value = el.val();

                  CRM.api3('MessageTemplate', 'getlist', {params: {id: value}, label_field: 'msg_title'}).then(function(tlist) {

                      var template = {};

                      if (tlist.count) {
                        $(tlist.values).each(function(id, val) {
                          template.id = val.id;
                          template.text = val.label;
                        });
                      }

                      cb(template);
                  });
              },
              ajax: {
                  url: CRM.url('civicrm/ajax/rest'),
                  quietMillis: 300,
                  data: function(input, page_num) {
                    if (page_num <= 1) {
                      rcpAjaxState = {
                        input: input,
                        entity: 'civicrm_msg_templates',
                        page_n: 0,
                      };
                    }

                    rcpAjaxState.page_i = page_num - rcpAjaxState.page_n;
                    var filterParams = {is_active: 1, workflow_name: {"IS NULL": 1}};

                    var params = {
                      input: input,
                      page_num: rcpAjaxState.page_i,
                      label_field: 'msg_title',
                      search_field: 'msg_title',
                      params: filterParams,
                    };
                    return params;
                  },
                  transport: function(params) {
                    CRM.api3('MessageTemplate', 'getlist', params.data).then(params.success, params.error);
                  },
                  results: function(data) {

                    var results = {
                      children: $.map(data.values, function(obj) {
                        return {id: obj.id, text: obj.label};
                      })
                    };

                    if (rcpAjaxState.page_i == 1 && data.count) {
                      results.text = ts('Message Templates');
                    }

                    return {
                      more: data.more_results,
                      results: [results]
                    };
                  },
                }
            });

            $(element).on('select2-selecting', function(e) {
              var entity_id = parseInt(e.val);
              ngModel.$viewValue = entity_id;

              scope.$parent.loadTemplate(scope.$parent.$parent.mailing, entity_id);
              scope.$apply();
              $(element).select2('close');
              e.preventDefault();
            });


            scope.$watchCollection("template", refreshUI);
            setTimeout(refreshUI, 50);
          }
      };


  });

angular.module('crmMailing').directive('crmMailingToken', function() {
    return {
      require: '^crmUiIdScope',
      scope: {
        onSelect: '@'
      },
      template: '<input type="text" class="crmMailingToken" />',
      link: function(scope, element, attrs, crmUiIdCtrl) {
        $(element).addClass('crm-action-menu fa-code').crmSelect2({
          width: "12em",
          dropdownAutoWidth: true,
          data: CRM.crmMailing.mailTokens,
          placeholder: ts('Tokens')
        });
        $(element).on('select2-selecting', function(e) {
          e.preventDefault();
          $(element).select2('close').select2('val', '');
          scope.$parent.$eval(attrs.onSelect, {
            token: {name: e.val}
          });
        });
      }
    };
  });

angular.module('crmMailing').controller('ViewRecipCtrl', function ViewRecipCtrl($scope, crmMailingLoader) {

    $scope.getIncludesAsString = function(mailing) {
      var first = true;
      var names = '';
      crmMailingLoader.getGroupNames(mailing);
      crmMailingLoader.getCiviMails(mailing);
      _.each(mailing.recipients.groups.include, function(id) {
        var group = _.where(CRM.crmMailing.groupNames, {id: parseInt(id)});
        if (group.length) {
          if (!first) {
            names = names + ', ';
          }
          names = names + group[0].title;
          first = false;
        }
      });
      _.each(mailing.recipients.mailings.include, function(id) {
        var oldMailing = _.where(CRM.crmMailing.civiMails, {id: parseInt(id)});
        if (oldMailing.length) {
          if (!first) {
            names = names + ', ';
          }
          names = names + oldMailing[0].name;
          first = false;
        }
      });
      return names;
    };
    $scope.getExcludesAsString = function(mailing) {
      var first = true;
      var names = '';
      _.each(mailing.recipients.groups.exclude, function(id) {
        var group = _.where(CRM.crmMailing.groupNames, {id: parseInt(id)});
        if (group.length) {
          if (!first) {
            names = names + ', ';
          }
          names = names + group[0].title;
          first = false;
        }
      });
      _.each(mailing.recipients.mailings.exclude, function(id) {
        var oldMailing = _.where(CRM.crmMailing.civiMails, {id: parseInt(id)});
        if (oldMailing.length) {
          if (!first) {
            names = names + ', ';
          }
          names = names + oldMailing[0].name;
          first = false;
        }
      });
      return names;
    };
  });


angular.module('crmMailing').component('crmMailingRecipientsAutocomplete', {
    bindings: {
      recipients: '<crmRecipients',
      mailingId: '<crmMailingId',
      mode: '@crmMode',
    },
    template: '<input type="text" crm-autocomplete="\'EntitySet\'" ' +
      'crm-autocomplete-params="$ctrl.autocompleteParams" ' +
      'ng-required="$ctrl.mode === \'include\'" ' +
      'ng-model="$ctrl.getSetValue" ' +
      'ng-model-options="{getterSetter: true}" ' +
      'multi="true" ' +
      'auto-open="true" ' +
      'placeholder="{{ $ctrl.placeholder }}" ' +
      'title="{{ $ctrl.title }}" ' +
      '>',
    controller: function($timeout) {
      var ctrl = this;

      this.$onInit = function() {
        this.placeholder = this.mode === 'include' ? ts('Include Groups & Mailings') :  ts('Exclude Groups & Mailings');
        this.title = this.mode === 'include' ? ts('Include recipients from groups and past mailings.') :  ts('Exclude recipients from groups and past mailings.');
        ctrl.autocompleteParams = {
          formName: 'crmMailing.' + ctrl.mailingId,
          fieldName: 'Mailing.recipients_' + ctrl.mode
        };
      };
      this.getSetValue = function(val) {
        var selectValues = '';
        if (arguments.length) {
          ctrl.recipients.groups[ctrl.mode].length = 0;
          ctrl.recipients.mailings[ctrl.mode].length = 0;
          _.each(val, function(munged) {
            var entityType = munged.split('_')[0],
              id = parseInt(munged.split('_')[1], 10),
              oppositeMode = ctrl.mode === 'include' ? 'exclude' : 'include';
            ctrl.recipients[entityType][ctrl.mode].push(id);
            _.pull(ctrl.recipients[entityType][oppositeMode], id);
          });
        }
        else {
          _.each(ctrl.recipients, function (items, entityType) {
            _.each(items[ctrl.mode], function (id) {
              selectValues += (selectValues.length ? ',' : '') + entityType + '_' + id;
            });
          });

        }
        return selectValues;
      };
    }
  });


angular.module('crmMailing').factory('crmFromAddresses', function ($q, crmApi) {
    var emailRegex = /^"(.*)" *<([^@>]*@[^@>]*)>$/;
    var addrs = _.map(CRM.crmMailing.fromAddress, function (addr) {
      var match = emailRegex.exec(addr.label);
      return angular.extend({}, addr, {
        email: match ? match[2] : '(INVALID)',
        author: match ? match[1] : '(INVALID)'
      });
    });

    function first(array) {
      return (array.length === 0) ? null : array[0];
    }

    return {
      getAll: function getAll() {
        return addrs;
      },
      getByAuthorEmail: function getByAuthorEmail(author, email, autocreate) {
        var result = null;
        _.each(addrs, function (addr) {
          if (addr.author == author && addr.email == email) {
            result = addr;
          }
        });
        if (!result && autocreate) {
          result = {
            label: '(INVALID) "' + author + '" <' + email + '>',
            author: author,
            email: email
          };
          addrs.push(result);
        }
        return result;
      },
      getByEmail: function getByEmail(email) {
        return first(_.where(addrs, {email: email}));
      },
      getByLabel: function (label) {
        return first(_.where(addrs, {label: label}));
      },
      getDefault: function getDefault() {
        return first(_.where(addrs, {is_default: "1"}));
      }
    };
  });

  angular.module('crmMailing').factory('crmMsgTemplates', function ($q, crmApi) {
    var tpls = _.map(CRM.crmMailing.mesTemplate, function (tpl) {
      return angular.extend({}, tpl, {
      });
    });
    window.tpls = tpls;
    var lastModifiedTpl = null;
    return {
      get: function get(id) {
        return crmApi('MessageTemplate', 'getsingle', {
           "return": "id,msg_subject,msg_html,msg_title,msg_text",
           "id": id
        });
      },
      save: function (tpl) {
        return crmApi('MessageTemplate', 'create', tpl).then(function (response) {
          if (!tpl.id) {
            tpl.id = '' + response.id; //parseInt(response.id);
            tpls.push(tpl);
          }
          lastModifiedTpl = tpl;
          return tpl;
        });
      },
      getLastModifiedTpl: function () {
        return lastModifiedTpl;
      },
      getAll: function getAll() {
        return tpls;
      }
    };
  });
  angular.module('crmMailing').factory('crmMailingMgr', function ($q, crmApi, crmFromAddresses, crmQueue) {
    var qApi = crmQueue(crmApi);
    var pickDefaultMailComponent = function pickDefaultMailComponent(type) {
      var mcs = _.where(CRM.crmMailing.headerfooterList, {
        component_type: type,
        is_default: "1"
      });
      return (mcs.length >= 1) ? mcs[0].id : null;
    };

    return {
      getOrCreate: function getOrCreate(idExpr) {
        return (idExpr == 'new') ? this.create() : this.get(idExpr);
      },
      get: function get(id) {
        var crmMailingMgr = this;
        var mailing;
        return qApi('Mailing', 'getsingle', {id: id})
          .then(function (getResult) {
            mailing = getResult;
            return $q.all([
              crmMailingMgr._loadGroups(mailing),
              crmMailingMgr._loadJobs(mailing)
            ]);
          })
          .then(function () {
            return mailing;
          });
      },
      _loadGroups: function (mailing) {
        return crmApi('MailingGroup', 'get', {mailing_id: mailing.id, 'options': {'limit':0}})
          .then(function (groupResult) {
            mailing.recipients = {};
            mailing.recipients.groups = {include: [], exclude: [], base: []};
            mailing.recipients.mailings = {include: [], exclude: []};
            _.each(groupResult.values, function (mailingGroup) {
              var bucket = (/^civicrm_group/.test(mailingGroup.entity_table)) ? 'groups' : 'mailings';
              var entityId = parseInt(mailingGroup.entity_id);
              mailing.recipients[bucket][mailingGroup.group_type.toLowerCase()].push(entityId);
            });
          });
      },
      _loadJobs: function (mailing) {
        return crmApi('MailingJob', 'get', {mailing_id: mailing.id, is_test: 0})
          .then(function (jobResult) {
            mailing.jobs = mailing.jobs || {};
            angular.extend(mailing.jobs, jobResult.values);
          });
      },
      create: function create(params) {
        var defaults = {
          jobs: {}, // {jobId: JobRecord}
          recipients: {
            groups: {include: [], exclude: [], base: []},
            mailings: {include: [], exclude: []}
          },
          template_type: "traditional",
          template_options: {nonce: 1},
          name: "",
          campaign_id: null,
          replyto_email: "",
          subject: "",
          body_html: "",
          body_text: ""
        };
        return angular.extend({}, defaults, params);
      },
      'delete': function (mailing) {
        if (mailing.id) {
          return qApi('Mailing', 'delete', {id: mailing.id});
        }
        else {
          var d = $q.defer();
          d.resolve();
          return d.promise;
        }
      },
      findMissingTokens: function(mailing, field) {
        var missing = {};
        if (!_.isEmpty(mailing[field]) && !CRM.crmMailing.disableMandatoryTokensCheck) {
          var body = '';
          if (mailing.footer_id) {
            var footer = _.where(CRM.crmMailing.headerfooterList, {id: mailing.footer_id});
            body = body + footer[0][field];

          }
          body = body + mailing[field];
          if (mailing.header_id) {
            var header = _.where(CRM.crmMailing.headerfooterList, {id: mailing.header_id});
            body = body + header[0][field];
          }

          angular.forEach(CRM.crmMailing.requiredTokens, function(value, token) {
            if (!_.isObject(value)) {
              if (body.indexOf('{' + token + '}') < 0) {
                missing[token] = value;
              }
            }
            else {
              var count = 0;
              angular.forEach(value, function(nestedValue, nestedToken) {
                if (body.indexOf('{' + nestedToken + '}') >= 0) {
                  count++;
                }
              });
              if (count === 0) {
                angular.extend(missing, value);
              }
            }
          });
        }
        return missing;
      },
      mergeInto: function mergeInto(mailingTgt, mailingFrom, excludes) {
        var MAILING_FIELDS = [
          'name',
          'campaign_id',
          'from_name',
          'from_email',
          'replyto_email',
          'subject',
          'dedupe_email',
          'recipients',
          'body_html',
          'body_text',
          'footer_id',
          'header_id',
          'visibility',
          'url_tracking',
          'dedupe_email',
          'forward_replies',
          'auto_responder',
          'open_tracking',
          'override_verp',
          'optout_id',
          'reply_id',
          'resubscribe_id',
          'unsubscribe_id'
        ];
        if (!excludes) {
          excludes = [];
        }
        _.each(MAILING_FIELDS, function (field) {
          if (!_.contains(excludes, field)) {
            mailingTgt[field] = mailingFrom[field];
          }
        });
      },
      preview: function preview(mailing) {
        return this.getPreviewContent(qApi, mailing);
      },
      getPreviewContent: function getPreviewContent(backend, mailing) {
        if (CRM.crmMailing.workflowEnabled && !CRM.checkPerm('create mailings') && !CRM.checkPerm('access CiviMail')) {
          return backend('Mailing', 'preview', {id: mailing.id}).then(function(result) {
            return result.values;
          });
        }
        else {
          var params = angular.extend({}, mailing);
          delete params.id;
          return backend('Mailing', 'preview', params).then(function(result) {
            return result.values;
          });
        }
      },
      previewRecipients: function previewRecipients(mailing, previewLimit) {
        var params = angular.extend({}, mailing.recipients, {
          id: mailing.id,
          'api.MailingRecipients.get': {
            mailing_id: '$value.id',
            options: {limit: previewLimit},
            'api.contact.getvalue': {'return': 'display_name'},
            'api.email.getvalue': {'return': 'email'}
          }
        });
        delete params.scheduled_date;
        delete params.recipients; // the content was merged in
        return qApi('Mailing', 'create', params).then(function (recipResult) {
          mailing.modified_date = recipResult.values[recipResult.id].modified_date;
          return recipResult.values[recipResult.id]['api.MailingRecipients.get'].values;
        });
      },

      previewRecipientCount: function previewRecipientCount(mailing, crmMailingCache, rebuild) {
        var cachekey = 'mailing-' + mailing.id + '-recipient-count';
        var recipientCount = crmMailingCache.get(cachekey);
        if (rebuild || _.isEmpty(recipientCount)) {
          var params = angular.extend({}, mailing, mailing.recipients, {
            id: mailing.id,
            'api.MailingRecipients.getcount': {
              mailing_id: '$value.id'
            }
          });
          if (rebuild) {
            params = angular.extend(params, {
              'api.MailingRecipients.get': {
                mailing_id: '$value.id',
                options: {limit: 50},
                'api.contact.getvalue': {'return': 'display_name'},
                'api.email.getvalue': {'return': 'email'}
              }
            });
            crmMailingCache.put('mailing-' + mailing.id + '-recipient-params', params.recipients);
          }
          delete params.scheduled_date;
          delete params.recipients; // the content was merged in
          recipientCount = qApi('Mailing', 'create', params).then(function (recipResult) {
            mailing.modified_date = recipResult.values[recipResult.id].modified_date;
            if (rebuild) {
              crmMailingCache.put('mailing-' + mailing.id + '-recipient-list', recipResult.values[recipResult.id]['api.MailingRecipients.get'].values);
            }
            return recipResult.values[recipResult.id]['api.MailingRecipients.getcount'];
          });
          crmMailingCache.put(cachekey, recipientCount);
        }

        return recipientCount;
      },
      save: function(mailing) {
        var params = angular.extend({}, mailing, mailing.recipients);
        angular.forEach(mailing, function(value, key) {
          if (value === undefined || value === null) {
            mailing[key] = '';
          }
        });
        delete params.scheduled_date;

        delete params.jobs;

        delete params.recipients; // the content was merged in
        params._skip_evil_bao_auto_recipients_ = 1; // skip recipient rebuild on simple save
        return qApi('Mailing', 'create', params).then(function(result) {
          if (result.id && !mailing.id) {
            mailing.id = result.id;
          }  // no rollback, so update mailing.id
          mailing.modified_date = result.values[result.id].modified_date;
          return mailing;
        });
      },
      submit: function (mailing) {
        var crmMailingMgr = this;
        var params = {
          id: mailing.id,
          approval_date: 'now',
          scheduled_date: mailing.scheduled_date ? mailing.scheduled_date : 'now'
        };
        return qApi('Mailing', 'submit', params)
          .then(function (result) {
            angular.extend(mailing, result.values[result.id]); // Perhaps we should reload mailing based on result?
            return crmMailingMgr._loadJobs(mailing);
          })
          .then(function () {
            return mailing;
          });
      },
      sendTest: function (mailing, recipient) {
        var params = angular.extend({}, mailing, mailing.recipients, {
          'api.Mailing.send_test': {
            mailing_id: '$value.id',
            test_email: recipient.email,
            test_group: recipient.gid
          }
        });
        delete params.scheduled_date;

        delete params.jobs;

        delete params.recipients; // the content was merged in

        params._skip_evil_bao_auto_recipients_ = 1; // skip recipient rebuild while sending test mail

        return qApi('Mailing', 'create', params).then(function (result) {
          if (result.id && !mailing.id) {
            mailing.id = result.id;
          }  // no rollback, so update mailing.id
          mailing.modified_date = result.values[result.id].modified_date;
          return result.values[result.id]['api.Mailing.send_test'].values;
        });
      }
    };
  });
  angular.module('crmMailing').factory('crmMailingLoader', function ($q, crmApi, crmFromAddresses, crmQueue) {

    var mids = [];
    var gids = [];
    var groupNames = [];
    var mailings = [];
    var civimailings = [];
    var civimails = [];

    return {
      getGroupNames: function(mailing) {
        if (-1 == mailings.indexOf(mailing.id)) {
          mailings.push(mailing.id);
          _.each(mailing.recipients.groups.include, function(id) {
            if (-1 == gids.indexOf(id)) {
              gids.push(id);
            }
          });
          _.each(mailing.recipients.groups.exclude, function(id) {
            if (-1 == gids.indexOf(id)) {
              gids.push(id);
            }
          });
          _.each(mailing.recipients.groups.base, function(id) {
            if (-1 == gids.indexOf(id)) {
              gids.push(id);
            }
          });
          if (!_.isEmpty(gids)) {
            CRM.api3('Group', 'get', {'id': {"IN": gids}}).then(function(result) {
              _.each(result.values, function(grp) {
                if (_.isEmpty(_.where(groupNames, {id: parseInt(grp.id)}))) {
                  groupNames.push({id: parseInt(grp.id), title: grp.title, is_hidden: grp.is_hidden});
                }
              });
              CRM.crmMailing.groupNames = groupNames;
            });
          }
        }
      },
      getCiviMails: function(mailing) {
        if (-1 == civimailings.indexOf(mailing.id)) {
          civimailings.push(mailing.id);
          _.each(mailing.recipients.mailings.include, function(id) {
            if (-1 == mids.indexOf(id)) {
              mids.push(id);
            }
          });
          _.each(mailing.recipients.mailings.exclude, function(id) {
            if (-1 == mids.indexOf(id)) {
              mids.push(id);
            }
          });
          if (!_.isEmpty(mids)) {
            CRM.api3('Mailing', 'get', {'id': {"IN": mids}}).then(function(result) {
              _.each(result.values, function(mail) {
                if (_.isEmpty(_.where(civimails, {id: parseInt(mail.id)}))) {
                  civimails.push({id: parseInt(mail.id), name: mail.name});
                }
              });
              CRM.crmMailing.civiMails = civimails;
            });
          }
        }
      }
    };
  });
  angular.module('crmMailing').factory('crmMailingPreviewMgr', function (dialogService, crmMailingMgr, crmStatus) {
    return {
      preview: function preview(mailing, mode) {
        var templates = {
          html: '~/crmMailing/PreviewMgr/html.html',
          text: '~/crmMailing/PreviewMgr/text.html',
          full: '~/crmMailing/PreviewMgr/full.html'
        };
        var result = null;
        var p = crmMailingMgr
          .getPreviewContent(CRM.api3, mailing)
          .then(function (content) {
            var options = CRM.utils.adjustDialogDefaults({
              autoOpen: false,
              height: '90%',
              width: '800px',
              title: ts('Subject: %1', {
                1: content.subject
              })
            });
            result = dialogService.open('previewDialog', templates[mode], content, options);
          });
        crmStatus({start: ts('Previewing...'), success: ''}, p);
        return result;
      },
      sendTest: function sendTest(mailing, recipient) {
        var promise = crmMailingMgr.sendTest(mailing, recipient)
            .then(function (deliveryInfos) {
              var count = Object.keys(deliveryInfos).length;
              if (count === 0) {
                CRM.alert(ts('Could not identify any recipients. Perhaps your test group is empty, all contacts are set to deceased/opt out/do_not_email, or you tried sending to contacts that do not exist and you have no permission to add contacts.'));
              }
            })
          ;
        return crmStatus({start: ts('Sending...'), success: ts('Sent')}, promise);
      }
    };
  });

  angular.module('crmMailing').factory('crmMailingStats', function (crmApi, crmLegacy) {
    var statTypes = [
      {name: 'Recipients',    title: ts('Intended Recipients'),     searchFilter: '',                           eventsFilter: '&event=queue', reportType: 'detail', reportFilter: ''},
      {name: 'Delivered',     title: ts('Successful Deliveries'),   searchFilter: '&mailing_delivery_status=Y', eventsFilter: '&event=delivered', reportType: 'detail', reportFilter: '&delivery_status_value=successful'},
      {name: 'Opened',        title: ts('Unique Opens'),           searchFilter: '&mailing_open_status=Y',     eventsFilter: '&event=opened', reportType: 'opened', reportFilter: ''},
      {name: 'Unique Clicks', title: ts('Unique Clicks'),          searchFilter: '&mailing_click_status=Y',    eventsFilter: '&event=click&distinct=1', reportType: 'clicks', reportFilter: ''},
      {name: 'Bounces',       title: ts('Bounces'),                 searchFilter: '&mailing_delivery_status=N', eventsFilter: '&event=bounce', reportType: 'bounce', reportFilter: ''},
      {name: 'Unsubscribers', title: ts('Unsubscribes & Opt-outs'), searchFilter: '&mailing_unsubscribe=1',     eventsFilter: '&event=unsubscribe', reportType: 'detail', reportFilter: '&is_unsubscribed_value=1'},
    ];

    return {
      getStatTypes: function() {
        return statTypes;
      },

      /**
       * @param mailingIds object
       *   List of mailing IDs ({a: 123, b: 456})
       * @return Promise
       *   List of stats for each mailing
       *   ({a: ...object..., b: ...object...})
       */
      getStats: function(mailingIds) {
        var params = {};
        angular.forEach(mailingIds, function(mailingId, name) {
          params[name] = ['Mailing', 'stats', {mailing_id: mailingId, is_distinct: 1}];
        });
        return crmApi(params).then(function(result) {
          var stats = {};
          angular.forEach(mailingIds, function(mailingId, name) {
            stats[name] = result[name].values[mailingId];
          });
          return stats;
        });
      },

      /**
       * Determine the legacy URL for a report about a given mailing and stat.
       *
       * @param mailing object
       * @param statType object (see statTypes above)
       * @param view string ('search', 'event', 'report')
       * @param returnPath string|null Return path (relative to Angular base)
       * @return string|null
       */
      getUrl: function getUrl(mailing, statType, view, returnPath) {
        switch (view) {
          case 'events':
            var retParams = returnPath ? '&context=angPage&angPage=' + returnPath : '';
            return crmLegacy.url('civicrm/mailing/report/event',
              'reset=1&mid=' + mailing.id + statType.eventsFilter + retParams);
          case 'search':
            return crmLegacy.url('civicrm/contact/search/advanced',
              'force=1&mailing_id=' + mailing.id + statType.searchFilter);
          case 'report':
            var reportIds = CRM.crmMailing.reportIds;
            return crmLegacy.url('civicrm/report/instance/' + reportIds[statType.reportType],
                'reset=1&mailing_id_value=' + mailing.id + statType.reportFilter);
          default:
            return null;
        }
      }
    };
  });
  angular.module('crmMailing').factory('crmMailingSimpleDirective', function ($q, crmMetadata, crmUiHelp) {
    return function crmMailingSimpleDirective(directiveName, templateUrl) {
      return {
        scope: {
          crmMailing: '@'
        },
        templateUrl: templateUrl,
        link: function (scope, elm, attr) {
          scope.$parent.$watch(attr.crmMailing, function(newValue){
            scope.mailing = newValue;
          });
          scope.crmMailingConst = CRM.crmMailing;
          scope.ts = CRM.ts('civi_mail');
          scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
          scope.checkPerm = CRM.checkPerm;
          scope[directiveName] = attr[directiveName] ? scope.$parent.$eval(attr[directiveName]) : {};
          $q.when(crmMetadata.getFields('Mailing'), function(fields) {
            scope.mailingFields = fields;
          });
        }
      };
    };
  });

  angular.module('crmMailing').factory('crmMailingCache', ['$cacheFactory', function($cacheFactory) {
    return $cacheFactory('crmMailingCache');
  }]);


angular.module('crmMailingAB', CRM.angRequires('crmMailingAB'));
  angular.module('crmMailingAB').config([
    '$routeProvider',
    function($routeProvider) {
      $routeProvider.when('/abtest', {
        templateUrl: '~/crmMailingAB/ListCtrl.html',
        controller: 'CrmMailingABListCtrl',
        resolve: {
          mailingABList: function($route, crmApi) {
            return crmApi('MailingAB', 'get', {rowCount: 0});
          },
          fields: function(crmMetadata) {
            return crmMetadata.getFields('MailingAB');
          }
        }
      });
      $routeProvider.when('/abtest/new', {
        template: '<p>' + ts('Initializing...') + '</p>',
        controller: 'CrmMailingABNewCtrl',
        resolve: {
          abtest: function($route, CrmMailingAB) {
            var abtest = new CrmMailingAB(null);
            return abtest.load().then(function() {
              return abtest.save();
            });
          }
        }
      });
      $routeProvider.when('/abtest/:id', {
        templateUrl: '~/crmMailingAB/EditCtrl/main.html',
        controller: 'CrmMailingABEditCtrl',
        resolve: {
          mailingFields: function(crmMetadata) {
            return crmMetadata.getFields('Mailing');
          },
          abtest: function($route, CrmMailingAB) {
            var abtest = new CrmMailingAB($route.current.params.id == 'new' ? null : $route.current.params.id);
            return abtest.load();
          }
        }
      });
    }
  ]);


var simpleDirectives = {
    crmMailingAbBlockMailing: '~/crmMailingAB/BlockMailing.html'
  };
  _.each(simpleDirectives, function(templateUrl, directiveName) {
    angular.module('crmMailingAB').directive(directiveName, function($parse, crmMailingABCriteria, crmUiHelp) {
      var scopeDesc = {crmAbtest: '@'};
      scopeDesc[directiveName] = '@';

      return {
        scope: scopeDesc,
        templateUrl: templateUrl,
        link: function(scope, elm, attr) {
          var model = $parse(attr.crmAbtest);
          scope.abtest = model(scope.$parent);
          scope.crmMailingConst = CRM.crmMailing;
          scope.crmMailingABCriteria = crmMailingABCriteria;
          scope.ts = CRM.ts('civi_mail');
          scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});

          var fieldsModel = $parse(attr[directiveName]);
          scope.fields = fieldsModel(scope.$parent);
        }
      };
    });
  });


var simpleDirectives = {
    crmMailingAbBlockSetup: '~/crmMailingAB/BlockSetup.html'
  };
  _.each(simpleDirectives, function(templateUrl, directiveName) {
    angular.module('crmMailingAB').directive(directiveName, function($parse, crmMailingABCriteria, crmUiHelp) {
      var scopeDesc = {crmAbtest: '@'};
      scopeDesc[directiveName] = '@';

      return {
        scope: scopeDesc,
        templateUrl: templateUrl,
        link: function(scope, elm, attr) {
          var model = $parse(attr.crmAbtest);
          scope.abtest = model(scope.$parent);
          scope.crmMailingConst = CRM.crmMailing;
          scope.crmMailingABCriteria = crmMailingABCriteria;
          scope.ts = CRM.ts('civi_mail');
          scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});

          var fieldsModel = $parse(attr[directiveName]);
          scope.fields = fieldsModel(scope.$parent);
        }
      };
    });
  });


angular.module('crmMailingAB').controller('CrmMailingABEditCtrl', function($scope, abtest, crmMailingABCriteria, crmMailingMgr, crmMailingPreviewMgr, crmStatus, $q, $location, crmBlocker, $interval, $timeout, CrmAutosaveCtrl, dialogService, mailingFields) {
    $scope.abtest = abtest;
    var ts = $scope.ts = CRM.ts('civi_mail');
    var block = $scope.block = crmBlocker();
    $scope.crmUrl = CRM.url;
    var myAutosave = null;
    $scope.crmMailingABCriteria = crmMailingABCriteria;
    $scope.crmMailingConst = CRM.crmMailing;
    $scope.checkPerm = CRM.checkPerm;
    $scope.mailingFields = mailingFields;

    $scope.isSubmitted = function isSubmitted() {
      return _.size(abtest.mailings.a.jobs) > 0 || _.size(abtest.mailings.b.jobs) > 0;
    };

    $scope.sync = function sync() {
      abtest.mailings.a.name = ts('Test A (%1)', {1: abtest.ab.name});
      abtest.mailings.b.name = ts('Test B (%1)', {1: abtest.ab.name});
      abtest.mailings.c.name = ts('Final (%1)', {1: abtest.ab.name});

      if (abtest.ab.testing_criteria) {
        switch (abtest.ab.testing_criteria) {
          case 'subject':
            var exclude_subject = [
              'name',
              'recipients',
              'subject'
            ];
            crmMailingMgr.mergeInto(abtest.mailings.b, abtest.mailings.a, exclude_subject);
            crmMailingMgr.mergeInto(abtest.mailings.c, abtest.mailings.a, exclude_subject);
            break;
          case 'from':
            var exclude_from = [
              'name',
              'recipients',
              'from_name',
              'from_email'
            ];
            crmMailingMgr.mergeInto(abtest.mailings.b, abtest.mailings.a, exclude_from);
            crmMailingMgr.mergeInto(abtest.mailings.c, abtest.mailings.a, exclude_from);
            break;
          case 'full_email':
            var exclude_full_email = [
              'name',
              'recipients',
              'subject',
              'from_name',
              'from_email',
              'replyto_email',
              'override_verp', // keep override_verp and replyto_Email linked
              'body_html',
              'body_text'
            ];
            crmMailingMgr.mergeInto(abtest.mailings.b, abtest.mailings.a, exclude_full_email);
            crmMailingMgr.mergeInto(abtest.mailings.c, abtest.mailings.a, exclude_full_email);
            break;
          default:
            throw "Unrecognized testing_criteria";
        }
      }
      return true;
    };
    $scope.save = function save() {
      return block(crmStatus({start: ts('Saving...'), success: ts('Saved')}, abtest.save()));
    };
    $scope.previewMailing = function previewMailing(mailingName, mode) {
      return crmMailingPreviewMgr.preview(abtest.mailings[mailingName], mode);
    };
    $scope.sendTest = function sendTest(mailingName, recipient) {
      return block(crmStatus({start: ts('Saving...'), success: ''}, abtest.save())
        .then(function() {
          crmMailingPreviewMgr.sendTest(abtest.mailings[mailingName], recipient);
        }));
    };
    $scope.delete = function() {
      return block(crmStatus({start: ts('Deleting...'), success: ts('Deleted')}, abtest.delete().then($scope.leave)));
    };
    $scope.submit = function submit() {
      if (block.check() || $scope.crmMailingAB.$invalid) {
        return;
      }
      return block(crmStatus({start: ts('Saving...'), success: ''}, abtest.save())
          .then(function() {
            return crmStatus({
              start: ts('Submitting...'),
              success: ts('Submitted')
            }, myAutosave.suspend(abtest.submitTest()));
          })
      );
    };

    $scope.leave = function leave() {
      $location.path('abtest');
      $location.replace();
    };

    $scope.selectWinner = function selectWinner(mailingName) {
      var model = {
        abtest: $scope.abtest,
        mailingName: mailingName
      };
      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: ts('Select Final Mailing (Test %1)', {
          1: mailingName.toUpperCase()
        })
      });
      return myAutosave.suspend(dialogService.open('selectWinnerDialog', '~/crmMailingAB/WinnerDialogCtrl.html', model, options));
    };
    var syncJob = $interval($scope.sync, 333);
    $scope.$on('$destroy', function() {
      $interval.cancel(syncJob);
    });

    myAutosave = new CrmAutosaveCtrl({
      save: $scope.save,
      saveIf: function() {
        return abtest.ab.status == 'Draft' && $scope.sync();
      },
      model: function() {
        return abtest.getAutosaveSignature();
      },
      form: function() {
        return $scope.crmMailingAB;
      }
    });
    $timeout(myAutosave.start);
    $scope.$on('$destroy', myAutosave.stop);
  });


angular.module('crmMailingAB').controller('CrmMailingABListCtrl', function($scope, mailingABList, crmMailingABCriteria, crmMailingABStatus, fields) {
    var ts = $scope.ts = CRM.ts('civi_mail');
    $scope.mailingABList = _.values(mailingABList.values);
    $scope.crmMailingABCriteria = crmMailingABCriteria;
    $scope.crmMailingABStatus = crmMailingABStatus;
    $scope.fields = fields;
    $scope.filter = {};
  });


angular.module('crmMailingAB').controller('CrmMailingABNewCtrl', function($scope, abtest, $location) {
    var parts = $location.path().split('/'); // e.g. "/mailing/new" or "/mailing/123/wizard"
    parts[2] = abtest.id;
    $location.path(parts.join('/'));
    $location.replace();
  });


angular.module('crmMailingAB').controller('CrmMailingABReportCtrl', function($scope, crmApi, crmMailingStats) {
    var ts = $scope.ts = CRM.ts('civi_mail');

    var CrmMailingABReportCnt = 1, activeMailings = null;
    $scope.getActiveMailings = function() {
      if ($scope.abtest.$CrmMailingABReportCnt != CrmMailingABReportCnt) {
        $scope.abtest.$CrmMailingABReportCnt = ++CrmMailingABReportCnt;
        activeMailings = [
          {
            name: 'a',
            title: ts('Mailing A'),
            mailing: $scope.abtest.mailings.a,
            attachments: $scope.abtest.attachments.a
          },
          {
            name: 'b',
            title: ts('Mailing B'),
            mailing: $scope.abtest.mailings.b,
            attachments: $scope.abtest.attachments.b
          }
        ];
        if ($scope.abtest.ab.status == 'Final') {
          activeMailings.push({
            name: 'c',
            title: ts('Final'),
            mailing: $scope.abtest.mailings.c,
            attachments: $scope.abtest.attachments.c
          });
        }
      }
      return activeMailings;
    };

    crmMailingStats.getStats({
      a: $scope.abtest.ab.mailing_id_a,
      b: $scope.abtest.ab.mailing_id_b,
      c: $scope.abtest.ab.mailing_id_c
    }).then(function(stats) {
      $scope.stats = stats;
    });
    $scope.rateStats = {
      'Unique Clicks': 'clickthrough_rate',
      'Delivered': 'delivered_rate',
      'Opened': 'opened_rate',
    };
    $scope.statTypes = crmMailingStats.getStatTypes();
    $scope.statUrl = function statUrl(mailing, statType, view) {
      return crmMailingStats.getUrl(mailing, statType, view, 'abtest/' + $scope.abtest.ab.id);
    };

    $scope.checkPerm = CRM.checkPerm;
  });


angular.module('crmMailingAB').directive('crmMailingAbSlider', function() {
    return {
      require: '?ngModel',
      scope: {},
      templateUrl: '~/crmMailingAB/Slider.html',
      link: function(scope, element, attrs, ngModel) {
        var TEST_MIN = 1, TEST_MAX = 50;
        var sliders = $('.slider-test,.slider-win', element);
        var sliderTests = $('.slider-test', element);
        var sliderWin = $('.slider-win', element);

        scope.ts = CRM.ts('civi_mail');
        scope.testValue = 0;
        scope.winValue = 100;
        function setValue(value) {
          value = Math.min(TEST_MAX, Math.max(TEST_MIN, value));
          scope.$apply(function() {
            ngModel.$setViewValue(value);
            scope.testValue = value;
            scope.winValue = 100 - (2 * scope.testValue);
            sliderTests.slider('value', scope.testValue);
            sliderWin.slider('value', scope.winValue);
          });
        }

        sliders.slider({
          min: 0,
          max: 100,
          range: 'min',
          step: 1
        });
        sliderTests.slider({
          slide: function slideTest(event, ui) {
            event.preventDefault();
            setValue(ui.value);
          }
        });
        sliderWin.slider({
          slide: function slideWinner(event, ui) {
            event.preventDefault();
            setValue(Math.round((100 - ui.value) / 2));
          }
        });

        ngModel.$render = function() {
          scope.testValue = ngModel.$viewValue;
          scope.winValue = 100 - (2 * scope.testValue);
          sliderTests.slider('value', scope.testValue);
          sliderWin.slider('value', scope.winValue);
        };
      }
    };
  });

})(angular, CRM.$, CRM._);

(function (angular, $, _, d3) {
  angular.module('crmMailingAB').directive('crmMailingAbStats', function (crmApi, $parse) {
    return {
      scope: {
        crmMailingAbStats: '@',
        crmAbtest: '@'
      },
      template: '<div class="crm-mailing-ab-stats"></div>',
      link: function (scope, element, attrs) {
        var abtestModel = $parse(attrs.crmAbtest);
        var optionModel = $parse(attrs.crmMailingAbStats);
        var options = angular.extend({}, optionModel(scope.$parent), {
          criteria: 'Open', // e.g. 'Open', 'Total Unique Clicks'
          split_count: 5
        });

        scope.$watch(attrs.crmAbtest, refresh);
        function refresh() {
          var abtest = abtestModel(scope.$parent);
          if (!abtest) {
            console.log('failed to draw stats - missing abtest');
            return;
          }

          scope.graph_data = [
            {},
            {},
            {},
            {},
            {}
          ];
          var keep_cnt = 0;

          for (var i = 1; i <= options.split_count; i++) {
            var result = crmApi('MailingAB', 'graph_stats', {
              id: abtest.ab.id,
              target_date: abtest.ab.declare_winning_time ? abtest.ab.declare_winning_time : 'now',
              target_url: null, // FIXME
              criteria: options.criteria,
              split_count: options.split_count,
              split_count_select: i
            });
            /*jshint -W083 */
            result.then(function (data) {
              var temp = 0;
              keep_cnt++;
              for (var key in data.values.A) {
                temp = key;
              }
              var t = data.values.A[temp].time.split(" ");
              var m = t[0];
              var year = t[2];
              var day = t[1].substr(0, t[1].length - 3);
              var t1, hur, hour, min;
              if (_.isEmpty(t[3])) {
                t1 = t[4].split(":");
                hur = t1[0];
                if (t[5] == "AM") {
                  hour = hur;
                  if (hour == 12) {
                    hour = 0;
                  }
                }
                if (t[5] == "PM") {
                  hour = parseInt(hur) + 12;
                }
                min = t1[1];
              }
              else {
                t1 = t[3].split(":");
                hur = t1[0];
                if (t[4] == "AM") {
                  hour = hur;
                  if (hour == 12) {
                    hour = 0;
                  }
                }
                if (t[4] == "PM") {
                  hour = parseInt(hur) + 12;
                }
                min = t1[1];
              }
              var month = 0;
              switch (m) {
                case "January":
                  month = 0;
                  break;
                case "February":
                  month = 1;
                  break;
                case "March":
                  month = 2;
                  break;
                case "April":
                  month = 3;
                  break;
                case "May":
                  month = 4;
                  break;
                case "June":
                  month = 5;
                  break;
                case "July":
                  month = 6;
                  break;
                case "August":
                  month = 7;
                  break;
                case "September":
                  month = 8;
                  break;
                case "October":
                  month = 9;
                  break;
                case "November":
                  month = 10;
                  break;
                case "December":
                  month = 11;
                  break;

              }
              var tp = new Date(year, month, day, hour, min, 0, 0);
              scope.graph_data[temp - 1] = {
                time: tp,
                x: data.values.A[temp].count,
                y: data.values.B[temp].count
              };

              if (keep_cnt == options.split_count) {
                scope.graphload = true;
                data = scope.graph_data;
                var color = d3.scale.category10();
                color.domain(d3.keys(data[0]).filter(function (key) {
                  return key !== "time";
                }));
                var series = color.domain().map(function (name) {
                  return {
                    name: name,
                    values: data.map(function (d) {
                      return {
                        time: d.time,
                        score: +d[name]
                      };
                    })
                  };
                });
                var margin = {
                    top: 30,
                    right: 20,
                    bottom: 40,
                    left: 75
                  },
                  width = 550 - margin.left - margin.right,
                  height = 350 - margin.top - margin.bottom;
                var x = d3.time.scale().range([0, width]);
                var y = d3.scale.linear().range([height, 0]);
                var xAxis = d3.svg.axis().scale(x)
                  .orient("bottom").ticks(10);

                var yAxis = d3.svg.axis().scale(y)
                  .orient("left").ticks(5);
                var valueline = d3.svg.line()
                  .x(function (d) {
                    return x(d.time);
                  })
                  .y(function (d) {
                    return y(d.score);
                  });
                var svg = d3.select($('.crm-mailing-ab-stats', element)[0])
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                x.domain(d3.extent(data, function (d) {
                  return d.time;
                }));
                y.domain([
                  d3.min(series, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.score;
                    });
                  }),
                  d3.max(series, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.score;
                    });
                  })
                ]);
                svg.append("text")      // text label for the x axis
                  .attr("x", width / 2)
                  .attr("y", height + margin.bottom)
                  .style("text-anchor", "middle")
                  .text("Time");

                svg.append("text")      // text label for the x axis
                  .style("text-anchor", "middle")
                  .text(scope.winnercriteria).attr("transform",function (d) {
                    return "rotate(-90)";
                  }).attr("x", -height / 2)
                  .attr("y", -30);
                series = svg.selectAll(".series")
                  .data(series)
                  .enter().append("g")
                  .attr("class", "series");
                series.append("path")
                  .attr("class", "line")
                  .attr("d", function (d) {
                    return valueline(d.values);
                  })
                  .style("stroke", function (d) {
                    return color(d.name);
                  });
                svg.append("g") // Add the X Axis
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis)
                  .selectAll("text")
                  .attr("transform", function (d) {
                    return "rotate(-30)";
                  });
                svg.append("g") // Add the Y Axis
                  .attr("class", "y axis")
                  .call(yAxis);
              }
            });
          }
        }
      } // link()
    };
  });
})(angular, CRM.$, CRM._, CRM.visual.d3);

(function(angular, $, _) {

  angular.module('crmMailingAB').controller('CrmMailingABWinnerDialogCtrl', function($scope, $timeout, dialogService, crmMailingMgr, crmStatus) {
    var ts = $scope.ts = CRM.ts('civi_mail');
    var abtest = $scope.abtest = $scope.model.abtest;
    var mailingName = $scope.model.mailingName;

    var titles = {a: ts('Mailing A'), b: ts('Mailing B')};
    $scope.mailingTitle = titles[mailingName];

    function init() {
      var buttons = [
        {
          text: ts('Submit final mailing'),
          icons: {primary: 'fa-paper-plane'},
          click: function() {
            crmStatus({start: ts('Submitting...'), success: ts('Submitted')},
              abtest.submitFinal(abtest.mailings[mailingName].id).then(function (r) {
                delete abtest.$CrmMailingABReportCnt;
              }))
              .then(function () {
                dialogService.close('selectWinnerDialog', abtest);
              });
          }
        },
        {
          text: ts('Cancel'),
          icons: {primary: 'fa-times'},
          click: function() {
            dialogService.cancel('selectWinnerDialog');
          }
        }
      ];
      dialogService.setButtons('selectWinnerDialog', buttons);
    }

    $timeout(init);
  });


function OptionGroup(values) {
    this.get = function get(value) {
      var r = _.where(values, {value: '' + value});
      return r.length > 0 ? r[0] : null;
    };
    this.getByName = function get(name) {
      var r = _.where(values, {name: '' + name});
      return r.length > 0 ? r[0] : null;
    };
    this.getAll = function getAll() {
      return values;
    };
  }

  angular.module('crmMailingAB').factory('crmMailingABCriteria', function () {
    var values = {
      '1': {value: 'subject', name: 'subject', label: ts('Test different "Subject" lines')},
      '2': {value: 'from', name: 'from', label: ts('Test different "From" lines')},
      '3': {value: 'full_email', name: 'full_email', label: ts('Test entirely different emails')}
    };
    return new OptionGroup(values);
  });

  angular.module('crmMailingAB').factory('crmMailingABStatus', function () {
    var values = {
      '1': {value: '1', name: 'Draft', label: ts('Draft')},
      '2': {value: '2', name: 'Testing', label: ts('Testing')},
      '3': {value: '3', name: 'Final', label: ts('Final')}
    };
    return new OptionGroup(values);
  });
  angular.module('crmMailingAB').factory('CrmMailingAB', function (crmApi, crmMailingMgr, $q, CrmAttachments) {
    function CrmMailingAB(id) {
      this.id = id;
      this.mailings = {};
      this.attachments = {};
    }

    angular.extend(CrmMailingAB.prototype, {
      getAutosaveSignature: function() {
        var mailings = angular.copy(this.mailings);
        _.each(mailings, function(mailing) {
          mailing.modified_date = undefined;
        });
        return [
          this.ab,
          mailings,
          this.attachments.a.getAutosaveSignature(),
          this.attachments.b.getAutosaveSignature(),
          this.attachments.c.getAutosaveSignature()
        ];
      },
      load: function load() {
        var crmMailingAB = this;
        if (!crmMailingAB.id) {
          crmMailingAB.ab = {
            name: '',
            status: 'Draft',
            mailing_id_a: null,
            mailing_id_b: null,
            mailing_id_c: null,
            testing_criteria: 'subject',
            winner_criteria: null,
            specific_url: '',
            declare_winning_time: null,
            group_percentage: 10
          };
          var mailingDefaults = {
            open_tracking: "1",
            url_tracking: "1",
            mailing_type:"experiment"
          };
          crmMailingAB.mailings.a = crmMailingMgr.create(mailingDefaults);
          crmMailingAB.mailings.b = crmMailingMgr.create(mailingDefaults);
          mailingDefaults.mailing_type = 'winner';
          crmMailingAB.mailings.c = crmMailingMgr.create(mailingDefaults);
          crmMailingAB.attachments.a = new CrmAttachments(function () {
            return {entity_table: 'civicrm_mailing', entity_id: crmMailingAB.ab.mailing_id_a};
          });
          crmMailingAB.attachments.b = new CrmAttachments(function () {
            return {entity_table: 'civicrm_mailing', entity_id: crmMailingAB.ab.mailing_id_b};
          });
          crmMailingAB.attachments.c = new CrmAttachments(function () {
            return {entity_table: 'civicrm_mailing', entity_id: crmMailingAB.ab.mailing_id_c};
          });

          var dfr = $q.defer();
          dfr.resolve(crmMailingAB);
          return dfr.promise;
        }
        else {
          return crmApi('MailingAB', 'get', {id: crmMailingAB.id})
            .then(function (abResult) {
              if (abResult.count != 1) {
                throw "Failed to load AB Test";
              }
              crmMailingAB.ab = abResult.values[abResult.id];
              return crmMailingAB._loadMailings();
            });
        }
      },
      save: function save() {
        var crmMailingAB = this;
        return crmMailingAB._saveMailings()
          .then(function () {
            return crmApi('MailingAB', 'create', crmMailingAB.ab)
              .then(function (abResult) {
                if (!crmMailingAB.id) {
                  crmMailingAB.id = crmMailingAB.ab.id = abResult.id;
                }
              });
          })
          .then(function () {
            return crmMailingAB;
          });
      },
      submitTest: function submitTest() {
        var crmMailingAB = this;
        var params = {
          id: this.ab.id,
          status: 'Testing',
          approval_date: 'now',
          scheduled_date: this.mailings.a.scheduled_date ? this.mailings.a.scheduled_date : 'now'
        };
        return crmApi('MailingAB', 'submit', params)
          .then(function () {
            return crmMailingAB.load();
          });
      },
      submitFinal: function submitFinal(winner_id) {
        var crmMailingAB = this;
        var params = {
          id: this.ab.id,
          status: 'Final',
          winner_id: winner_id,
          approval_date: 'now',
          scheduled_date: this.mailings.c.scheduled_date ? this.mailings.c.scheduled_date : 'now'
        };
        return crmApi('MailingAB', 'submit', params)
          .then(function () {
            return crmMailingAB.load();
          });
      },
      'delete': function () {
        if (this.id) {
          return crmApi('MailingAB', 'delete', {id: this.id});
        }
        else {
          var d = $q.defer();
          d.resolve();
          return d.promise;
        }
      },
      _loadMailings: function _loadMailings() {
        var crmMailingAB = this;
        var todos = {};
        _.each(['a', 'b', 'c'], function (mkey) {
          if (crmMailingAB.ab['mailing_id_' + mkey]) {
            todos[mkey] = crmMailingMgr.get(crmMailingAB.ab['mailing_id_' + mkey])
              .then(function (mailing) {
                crmMailingAB.mailings[mkey] = mailing;
                crmMailingAB.attachments[mkey] = new CrmAttachments(function () {
                  return {entity_table: 'civicrm_mailing', entity_id: crmMailingAB.ab['mailing_id_' + mkey]};
                });
                return crmMailingAB.attachments[mkey].load();
              }).catch(function (ex){
                console.error(ex);
                throw new Error('Failed to load Mailings');
              });
          }
          else {
            crmMailingAB.mailings[mkey] = crmMailingMgr.create();
            crmMailingAB.attachments[mkey] = new CrmAttachments(function () {
              return {entity_table: 'civicrm_mailing', entity_id: crmMailingAB.ab['mailing_id_' + mkey]};
            });
          }
        });
        return $q.all(todos).then(function () {
          return crmMailingAB;
        });
      },
      _saveMailings: function _saveMailings() {
        var crmMailingAB = this;
        var todos = {};
        var p = $q.when(true);
        _.each(['a', 'b', 'c'], function (mkey) {
          if (!crmMailingAB.mailings[mkey]) {
            return;
          }
          if (crmMailingAB.ab['mailing_id_' + mkey]) {
            crmMailingAB.mailings[mkey].id = crmMailingAB.ab['mailing_id_' + mkey];
          }
          p = p.then(function(){
            return crmMailingMgr.save(crmMailingAB.mailings[mkey])
              .then(function () {
                crmMailingAB.ab['mailing_id_' + mkey] = crmMailingAB.mailings[mkey].id;
                return crmMailingAB.attachments[mkey].save();
              });
          });
        });
        return p.then(function () {
          return crmMailingAB;
        });
      }

    });
    return CrmMailingAB;
  });


angular.module('crmMosaico', CRM.angRequires('crmMosaico'));

angular.module('crmMosaico').controller('CrmMosaicoAdvancedDialogCtrl', function CrmMosaicoAdvancedDialogCtrl($scope, dialogService) {
    var ts = $scope.ts = CRM.ts(null);
  });


angular.module('crmMosaico').directive('crmMosaicoBlockDesign', function($q, crmUiHelp, dialogService, crmMosaicoTemplates, crmStatus, CrmMosaicoIframe, $timeout) {

    return {
      scope: {
        crmMailing: '@',
        crmMailingAttachments: '@',
        crmMailingVariant: '@',
      },
      templateUrl: '~/crmMosaico/BlockDesign.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
        });
        scope.$parent.$watch(attr.crmMailingAttachments, function(newValue){
          scope.attachments = newValue;
        });
        scope.$parent.$watch(attr.crmMailingVariant, function(newValue){
          scope.variantId = newValue;
        });
        scope.crmMailingConst = CRM.crmMailing;
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});

        function _object(prop) {
          const mailing = scope.mailing;
          mailing.template_options = mailing.template_options || {};

          if (scope.variantId !== null) return mailing.template_options.variants[scope.variantId];
          return prop.match(/^mosaico/) ? mailing.template_options : mailing;
        }
        function getProp(prop) { return _object(prop)[prop]; }
        function setProp(prop, value) { _object(prop)[prop] = value; }
        function deleteProp(prop) { delete _object(prop)[prop]; }

        const $scope = scope;
        var crmMosaicoIframe = null, activeDialogs = {};
        $scope.mosaicoCtrl = {
          templates: [],
          select: function(template) {
            var promise = crmMosaicoTemplates.getFull(template).then(function(tplCtnt){
              setProp('mosaicoTemplate', template.id);
              setProp('mosaicoMetadata', tplCtnt.metadata);
              setProp('mosaicoContent', tplCtnt.content);
              setProp('body_html', tplCtnt.html);
              $scope.mosaicoCtrl.edit();
            });
            return crmStatus({start: ts('Loading...'), success: null}, promise);
          },
          hasSelection: function() {
            return !!getProp('mosaicoTemplate');
          },
          hasMarkup: function() {
            return !!getProp('body_html');
          },
          getTemplate: function() {
            const mailing = scope.mailing;
            if (!mailing || !getProp('mosaicoTemplate')) {
              return null;
            }
            var matches = _.where($scope.mosaicoCtrl.templates, {
              id: getProp('mosaicoTemplate')
            });
            return matches.length > 0 ? matches[0] : null;
          },
          reset: function() {
            if (crmMosaicoIframe) crmMosaicoIframe.destroy();
            crmMosaicoIframe = null;
            deleteProp('mosaicoTemplate');
            deleteProp('mosaicoMetadata');
            deleteProp('mosaicoContent');
            setProp('body_html', '');
          },
          edit: function() {
            if (crmMosaicoIframe) {
              crmMosaicoIframe.show();
              return;
            }

            function syncModel(viewModel) {
              setProp('body_html', viewModel.exportHTML());
              setProp('mosaicoMetadata', viewModel.exportMetadata());
              setProp('mosaicoContent', viewModel.exportJSON());
            }

            crmMosaicoIframe = new CrmMosaicoIframe({
              model: {
                template: $scope.mosaicoCtrl.getTemplate().path,
                metadata: getProp('mosaicoMetadata'),
                content: getProp('mosaicoContent')
              },
              actions: {
                sync: function(ko, viewModel) {
                  syncModel(viewModel);
                },
                close: function(ko, viewModel) {
                  viewModel.metadata.changed = Date.now();
                  syncModel(viewModel);
                  $timeout(function(){
                    $scope.$parent.$apply(attr.onSave);
                  }, 100);
                  crmMosaicoIframe.hide('crmMosaicoEditorDialog');
                },
                test: function(ko, viewModel) {
                  syncModel(viewModel);

                  var model = {mailing: $scope.mailing, attachments: $scope.attachments, variantId: $scope.variantId};
                  var options = CRM.utils.adjustDialogDefaults(angular.extend(
                    {autoOpen: false, title: ts('Preview / Test'), width: 550},
                    options
                  ));
                  activeDialogs.crmMosaicoPreviewDialog = 1;
                  var pr = dialogService.open('crmMosaicoPreviewDialog', '~/crmMosaico/PreviewDialogCtrl.html', model, options)
                    .finally(function(){ delete activeDialogs.crmMosaicoPreviewDialog; });
                  return pr;
                }
              }
            });

            return crmStatus({start: ts('Loading...'), success: null}, crmMosaicoIframe.open());
          }
        };

        crmMosaicoTemplates.whenLoaded().then(function(){
          $scope.mosaicoCtrl.templates = crmMosaicoTemplates.getAll();
          $scope.mosaicoCtrl.categoryFilters = _.transform(crmMosaicoTemplates.getCategories(), function(filters, category) {
            filters.push({id: filters.length, text: category.label, filter: {category_id: category.value}});
          }, [{id: 0, text: ts('Base Template'), filter: {isBase: true}}]);
        });

        $scope.$on("$destroy", function() {
          angular.forEach(activeDialogs, function(v,name){
            dialogService.cancel(name);
          });
          if (crmMosaicoIframe) {
            crmMosaicoIframe.destroy();
            crmMosaicoIframe = null;
          }
        });


      }
    };
  });

angular.module('crmMosaico').directive('crmMosaicoBlockMailing', function(crmMailingSimpleDirective, crmMosaicoVariants) {
    const d = crmMailingSimpleDirective('crmMosaicoBlockMailing', '~/crmMosaico/BlockMailing.html');
    const link = d.link;
    d.link = function(scope, elm, attr) {
      link(scope, elm, attr);
      scope.isMailingSplit = (mailing, field) => crmMosaicoVariants.isSplit(mailing, field);
    };
    return d;
  });

angular.module('crmMosaico').directive('crmMosaicoBlockPreview', function(crmUiHelp, crmMosaicoVariants) {
    return {
      templateUrl: '~/crmMosaico/BlockPreview.html',
      link: function(scope, elm, attr) {
        scope.$watch(attr.crmMailing, function(newValue) {
          scope.mailing = newValue;
        });
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
        scope.testContact = {email: CRM.crmMailing.defaultTestEmail};
        scope.testGroup = {gid: null};
        scope.validateMultipleEmail = function(email) {
          email = email.split(',');
          var emailRegex = /\S+@\S+\.\S+/;

          var validityArr = email.map(function(str){
            return emailRegex.test(str.trim());
          });

          return ($.inArray(false, validityArr) == -1);
        };
        scope.isSplit = crmMosaicoVariants.isSplit;

        scope.doPreview = function(mode) {
          scope.$eval(attr.onPreview, {
            preview: {mode: mode}
          });
        };
        scope.doSend = function doSend(recipient) {
          recipient = JSON.parse(JSON.stringify(recipient).replace(/\,\s/g, ','));
          scope.$eval(attr.onSend, {
            preview: {recipient: recipient}
          });
        };

        scope.previewTestGroup = function(e) {
          var $dialog = $(this);
          $dialog.html('<div class="crm-loading-element"></div>').parent().find('button[data-op=yes]').prop('disabled', true);
          CRM.api3({
            contact: ['contact', 'get', {group: scope.testGroup.gid, options: {limit: 0}, return: 'display_name,email'}],
            group: ['group', 'getsingle', {id: scope.testGroup.gid, return: 'title'}]
          }).done(function(data) {
            $dialog.dialog('option', 'title', ts('Send to %1', {1: data.group.title}));
            var count = 0,
            markup = '<ol>';
            _.each(data.contact.values, function(row) {
              if (row.email) {
                count++;
                markup += '<li>' + row.display_name + ' - ' + row.email + '</li>';
              }
            });
            markup += '</ol>';
            markup = '<h4>' + ts('A test message will be sent to %1 people:', {1: count}) + '</h4>' + markup;
            if (!count) {
              markup = '<div class="messages status"><i class="crm-i fa-exclamation-triangle"></i> ' +
              (data.contact.count ? ts('None of the contacts in this group have an email address.') : ts('Group is empty.')) +
              '</div>';
            }
            $dialog
              .html(markup)
              .trigger('crmLoad')
              .parent().find('button[data-op=yes]').prop('disabled', !count);
          });
        };
      }
    };
  });


angular.module('crmMosaico').directive('crmMosaicoBlockSchedule', function(crmMailingSimpleDirective) {
    return crmMailingSimpleDirective('crmMosaicoBlockSchedule', '~/crmMosaico/BlockSchedule.html');
  });

angular.module('crmMosaico').controller('CrmMosaicoCreateFromBaseTemplate', function($scope, crmStatus, dialogService, crmMosaicoTemplates) {
    var ts = $scope.ts = CRM.ts('mosaico');
    var ctrl = $scope.$ctrl = this;

    this.model = {};

    crmMosaicoTemplates.whenLoaded().then(function() {
      ctrl.bases = _.sortBy(crmMosaicoTemplates.getBases(), 'type');
      ctrl.model.base = ctrl.bases[0].baseDetails.name;
    });

    this.create = function() {
      crmStatus({},
        crmMosaicoTemplates.create(ctrl.model)
      )
      .then(function(tpl) {
        crmMosaicoTemplates.edit(tpl);
        dialogService.close('crmMosaicoCreatePopup');
      });
    };
  });


angular.module('crmMosaico').directive('crmMosaicoDistribution', function(crmUiHelp) {
    return {
      scope: {
        crmMailing: '@'
      },
      templateUrl: '~/crmMosaico/Distribution.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
          if (!scope.mailing.template_options.variantsPct) {
            scope.mailing.template_options.variantsPct = CRM.crmMosaico.variantsPct;
          }
        });
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
      }
    };

  });

angular.module('crmMosaico').controller('CrmMosaicoEditorDialogCtrl', function CrmMosaicoEditorDialogCtrl($scope, dialogService) {
    var ts = $scope.ts = CRM.ts(null);
  });


angular.module('crmMosaico').directive('crmMosaicoFromList', function(crmUiHelp, crmMosaicoVariants) {
    return {
      scope: {
        crmMailing: '@'
      },
      templateUrl: '~/crmMosaico/FromList.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
        });
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
        scope.checkPerm = CRM.checkPerm;

        scope.addFrom = function() {
          crmMosaicoVariants.split(scope.mailing, 'from_name');
          crmMosaicoVariants.split(scope.mailing, 'from_email');
          if (!CRM.crmMailing.enableReplyTo) {
            crmMosaicoVariants.split(scope.mailing, 'replyto_email');
          }

        }
        scope.rmFrom = function(vid) {
          crmMosaicoVariants.remove(scope.mailing, 'from_email', vid);
          crmMosaicoVariants.remove(scope.mailing, 'from_name', vid);
          if (!CRM.crmMailing.enableReplyTo) {
            crmMosaicoVariants.remove(scope.mailing, 'replyto_email', vid);
          }
        }
        scope.isSplit = function() {
          return crmMosaicoVariants.isSplit(scope.mailing, 'from_email')
        }
        scope.labels = crmMosaicoVariants.getLabels();
      }
    };

  });

/**
   * The class CrmMosaicoIframe allows you to instantiate and manage a
   * full-screen IFRAME with embedded Mosaico runtime.
   */
  angular.module('crmMosaico').factory('CrmMosaicoIframe', function(crmUiAlert, $q, $timeout, $rootScope, CrmMosaicoSyncMonitor) {

    /**
     * @param Object newOptions
     *  - dimensions: function()
     *  - url: string (optional)
     *  - actions: Object
     *    - save: function(ko, viewModel)
     *    - test: function(ko, viewModel)
     *    - close: function(ko, viewModel) (an alias for "save")
     *  - model: Object. Must have "metadata+content" or "template"
     *    - metadata: string, JSON-encoded
     *    - content: string, JSON-encoded
     *    - template: string, relative file path
     */
    return function CrmMosaicoIframe(options){
      var cfg = {
        url: CRM.url('civicrm/mosaico/iframe', 'snippet=1'),
        dimensions: function resize() {
          var c = CRM.crmMosaico || {};
          var top = 0, left = 0, width = $(window).width(), height = $(window).height();
          if (c.topNav && $(c.topNav).length > 0) {
            top = $(c.topNav).outerHeight() + $(c.topNav).position().top;
            height -= top;
          }
          if (c.leftNav && $(c.leftNav).length > 0) {
            left = $(c.leftNav).width();
            width -= left;
          }
          return {position: 'fixed', left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px'};
        }
      };
      angular.extend(cfg, options);

      var model = cfg.model, actions = cfg.actions;
      var isVisible = false, $iframe = null, iframe = null;
      var syncMonitor = new CrmMosaicoSyncMonitor();

      if (actions.save && actions.close) {
        throw "Error: Save and Close actions are mutually exclusive";
      }

      var oldOverflow = null;
      function scrollHide() {
        if (oldOverflow === null) {
          oldOverflow = $('body').css('overflow');
          $(document).on('dialogclose', scrollRefresh); // jQuery dialog bug
        }
        $('body').css('overflow', 'hidden');
      }
      function scrollRestore() {
        if (oldOverflow !== null) {
          $(document).off('dialogclose', scrollRefresh); // jQuery dialog bug
          $('body').css('overflow', oldOverflow);
        }
        oldOverflow = null;
      }
      function scrollRefresh() { $('body').css('overflow', 'hidden'); }

      function onResize() {
        if ($iframe) $iframe.css(cfg.dimensions());
      }

      this.render = function render() {
        $iframe = $('<iframe id="crm-mosaico" frameborder="0" class="ui-front">');
        $('body').append($iframe);
        onResize();
        $(window).on('resize', onResize);

        iframe = $iframe[0];
        iframe.setAttribute('src', cfg.url);

        return this;
      };
      this.open = function open() {
        var dfr = $q.defer();

        if ($iframe) {
          dfr.resolve();
          return dfr.promise;
        }

        window.top.crmMosaicoIframe = function(newWindow, Mosaico, config, plugins) {
          plugins.push(function(viewModel) {
            mosaicoPlugin(newWindow.ko, viewModel);
          });

          var ok = true;
          if (model.content) {
            Mosaico.start(config, undefined, JSON.parse(model.metadata), JSON.parse(model.content), plugins);
          } else if (model.template) {
            Mosaico.start(config, model.template, undefined, undefined, plugins);
          } else {
            crmUiAlert({text: 'Cannot edit mailing'});
            ok = false;
          }

          $timeout(function(){
            if (ok) dfr.resolve();
            else dfr.reject();
          }, 150);
        };

        this.render();
        this.show();
        return dfr.promise;
      };

      this.hide = function hide() {
        isVisible = false;
        if ($iframe) {
          syncMonitor.stop($iframe);
          scrollRestore();
          $iframe.hide();
        }
        return this;
      };

      this.show = function show() {
        isVisible = true;
        if ($iframe) {
          scrollHide();
          onResize();
          $iframe.show();
          syncMonitor.start($iframe);
        }
        return this;
      };

      this.destroy = function destroy() {
        this.hide();
        $(window).off('resize', onResize);
        if ($iframe) $iframe.remove();
        iframe = $iframe = null;
        return this;
      };
      function mosaicoPlugin(ko, viewModel) {
        viewModel.logoUrl = null;

        function mkCmd(name, callback) {
          var cmd = {
            name: name, // l10n happens in the template
            enabled: ko.observable(true)
          };
          cmd.execute = function() {
            cmd.enabled(false);
            $rootScope.$apply(function(){
              callback(ko, viewModel);
            });
            cmd.enabled(true);
          };
          return cmd;
        }

        if (actions.save) {
          viewModel.save = mkCmd("Save", actions.save);
        }
        if (actions.close) { // pretend like Mosaico has a "Close" action.
          viewModel.save = mkCmd("Close", actions.close);
        }
        if (actions.test) {
          viewModel.test = mkCmd("Test", actions.test);
        }

        syncMonitor.onSync = function () {
          if (actions.sync) actions.sync(ko, viewModel);
        };
      }

    };
  });



angular.module('crmMosaico').controller('CrmMosaicoMixinCtrl', function CrmMosaicoMixinCtrl($scope, dialogService, crmMosaicoVariants) {
    const ts = $scope.ts = CRM.ts('mosaico');

    const singleDesign = [
      {title: ts('Design'), vid: null, action: 'split'}
    ];
    const abDesign = [
      {title: ts('Design (A)'), vid: 0, action: 'unsplit'},
      {title: ts('Design (B)'), vid: 1, action: 'unsplit'},
    ];

    $scope.getDesigns = function(mailing) {
      if (!mailing) return [];
      return crmMosaicoVariants.isSplit(mailing, 'body_html') ? abDesign : singleDesign;
    }
    $scope.unsplitDesign = function(mailing, vid) {
      crmMosaicoVariants.remove(mailing, ['mosaicoTemplate', 'mosaicoMetadata', 'mosaicoContent', 'body_html'], vid);
    };
    $scope.splitDesign = function(mailing) {
      crmMosaicoVariants.split(mailing, ['mosaicoTemplate', 'mosaicoMetadata', 'mosaicoContent', 'body_html']);
    };

    $scope.isMailingSplit = (mailing, field) => crmMosaicoVariants.isSplit(mailing, field);

    var activeDialogs = {};
    $scope.openAdvancedOptions = function() {
      var model = {mailing: $scope.mailing, attachments: $scope.attachments};
      var options = CRM.utils.adjustDialogDefaults(angular.extend(
        {
          autoOpen: false,
          title: ts('Advanced Settings'),
          width: 600,
          height: 'auto'
        },
        options
      ));
      activeDialogs.crmMosaicoAdvancedDialog = 1;
      return dialogService.open('crmMosaicoAdvancedDialog', '~/crmMosaico/AdvancedDialogCtrl.html', model, options)
        .finally(function(){ delete activeDialogs.crmMosaicoAdvancedDialog; });
    };

    $scope.$on("$destroy", function() {
      angular.forEach(activeDialogs, function(v,name){
        dialogService.cancel(name);
      });
    });

  });


angular.module('crmMosaico').controller('CrmMosaicoPreviewDialogCtrl', function CrmMosaicoPreviewDialogCtrl($scope, crmMailingMgr, crmMailingPreviewMgr, crmBlocker, crmStatus, crmMosaicoVariants) {
    var ts = $scope.ts = CRM.ts(null);
    var block = $scope.block = crmBlocker();
    $scope.previewMailing = function previewMailing(mailing, variantId, mode) {
      const preview = crmMosaicoVariants.preview(mailing, variantId);
      return crmMailingPreviewMgr.preview(preview, mode);
    };
    $scope.sendTest = function sendTest(mailing, variantId, attachments, recipient) {
      var savePromise = crmMailingMgr.save(mailing)
        .then(function() {
          return attachments.save();
        });
      return block(crmStatus({start: ts('Saving...'), success: ''}, savePromise)
        .then(function() {
          crmMailingPreviewMgr.sendTest(mailing, recipient);
        }));
    };
  });


angular.module('crmMosaico').factory('crmMosaicoPrompt', function($q) {
    return function crmMosaicoPrompt(question, defaultName) {
      var dfr = $q.defer();
      var answer = window.prompt(question, defaultName);

      if (!_.isEmpty(answer)) dfr.resolve(answer);
      else dfr.reject();

      return dfr.promise;
    };
  });

angular.module('crmMosaico').directive('crmMosaicoReplyToList', function(crmUiHelp, crmMosaicoVariants) {
    return {
      scope: {
        crmMailing: '@'
      },
      templateUrl: '~/crmMosaico/ReplyToList.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
        });
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
        scope.checkPerm = CRM.checkPerm;

        scope.addReplyTo = () => crmMosaicoVariants.split(scope.mailing, 'replyto_email');
        scope.rmReplyTo = (vid) => crmMosaicoVariants.remove(scope.mailing, 'replyto_email', vid);
        scope.isSplit = () => crmMosaicoVariants.isSplit(scope.mailing, 'replyto_email');
        scope.labels = crmMosaicoVariants.getLabels();
      }
    };

  });

angular.module('crmMosaico').component('crmMosaicoSearchTemplateCreateButton', {
    bindings: {
      tpl: '<',
      refresh: '&'
    },
    templateUrl: '~/crmMosaico/SearchTemplateListButtons.html',
    controller: function($scope, crmApi4, crmStatus, crmMosaicoTemplates) {
      var ts = $scope.ts = CRM.ts('mosaico'),
        ctrl = this;

      this.copyTpl = function(tpl) {
        crmStatus(
          {start: ts('Copying...'), success: ts('Copied')},
          crmMosaicoTemplates.clone({id: tpl.id, title: tpl.title + ' ' + ts('(copy)')})
        )
        .then(function(newTpl) {
          return ctrl.editTpl(newTpl);
        });
      };

      this.deleteTpl = function(tpl) {
        return crmStatus(
          {start: ts('Deleting...'), success: ts('Deleted')},
          crmMosaicoTemplates.delete(tpl)
        ).then(ctrl.refresh);
      };

      this.editTpl = function(tpl) {
        crmMosaicoTemplates.edit(tpl)
          .then(ctrl.refresh);
      };

    }
  });

angular.module('crmMosaico').component('crmMosaicoSearchTemplateListButtons', {
    bindings: {
      tpl: '<',
      refresh: '&'
    },
    templateUrl: '~/crmMosaico/SearchTemplateListButtons.html',
    controller: function($scope, crmApi4, crmStatus, crmMosaicoTemplates) {
      var ts = $scope.ts = CRM.ts('mosaico'),
        ctrl = this;

      this.copyTpl = function(tpl) {
        crmStatus(
          {start: ts('Copying...'), success: ts('Copied')},
          crmMosaicoTemplates.clone({id: tpl.id, title: tpl.title + ' ' + ts('(copy)')})
        )
        .then(function(newTpl) {
          return ctrl.editTpl(newTpl);
        });
      };

      this.deleteTpl = function(tpl) {
        return crmStatus(
          {start: ts('Deleting...'), success: ts('Deleted')},
          crmMosaicoTemplates.delete(tpl)
        ).then(ctrl.refresh);
      };

      this.editTpl = function(tpl) {
        crmMosaicoTemplates.edit(tpl)
          .then(ctrl.refresh);
      };

    }
  });

angular.module('crmMosaico').directive('crmMosaicoSubjectList', function(crmUiHelp, crmMosaicoVariants) {
    return {
      scope: {
        crmMailing: '@'
      },
      templateUrl: '~/crmMosaico/SubjectList.html',
      link: function (scope, elm, attr) {
        scope.$parent.$watch(attr.crmMailing, function(newValue){
          scope.mailing = newValue;
        });
        scope.ts = CRM.ts(null);
        scope.hs = crmUiHelp({file: 'CRM/Mailing/MailingUI'});
        scope.checkPerm = CRM.checkPerm;

        scope.addSubj = () => crmMosaicoVariants.split(scope.mailing, 'subject');
        scope.rmSubj = (vid) => crmMosaicoVariants.remove(scope.mailing, 'subject', vid);
        scope.isSplit = () => crmMosaicoVariants.isSplit(scope.mailing, 'subject');
        scope.labels = crmMosaicoVariants.getLabels();
      }
    };

  });

/**
   * The class CrmMosaicoSyncMonitor monitors the Mosaico IFRAME and decides when to fire synchronization events.
   * It follows these rules:
   *
   * - The user alternates between periods of being "idle" (no clicking) or "active" (clicking).
   * - Most clicks are interpreted as activity.
   * - Some clicks (arrow keys, home, end, mouse-scrolling) do not count as activity.
   * - Fire `onSync()` after a (moderately) short period of idleness (eg `idleTimeout=5000`).
   * - Fire `onSync()` after a (moderately) long period of activity (eg `activeTimeout=60000`).
   * - Do not fire `onSync()` while there is active input (mouse-down or key-down).
   */
  angular.module('crmMosaico').factory('CrmMosaicoSyncMonitor', function($interval) {
    var verbose = function() {};

    /**
     * @param Object options
     * - interval (int, ms): How frequently to poll and decide about whether to sync.
     * - idleTimeout (int, ms): After $X period of idle usage, fire a sync.
     * - activeTimeout (int, ms): After $X period of active usage, fire a sync.
     * - onSync (function): The function to call periodically.
     */
    return function CrmMosaicoSyncMonitor(options) {
      var defaults = {
        interval: 500,
        idleTimeout: 4 * 1000,
        activeTimeout: 2 * 60 * 1000,
        onSync: function() {}
      };
      angular.extend(this, defaults, options);

      var monitor = this, intervalHandle = null, startCount = 0;
      var isKeyDown, isMouseDown, lastInput, lastSync;

      function ding(e) {
        lastInput = (new Date()).getTime();
        verbose('CrmMosaicoSyncMonitor: activity: ', lastInput, e.type);
      }
      function onMouseDown(e) { isMouseDown = true; ding(e); }
      function onMouseUp(e) { isMouseDown = false; ding(e); }
      function onKeyDown(e) { isKeyDown = true; ding(e); }
      function onKeyUp(e) {
        isKeyDown = false;
        if (e.keyCode < 35 || e.keyCode > 40) {
          ding(e);
        }
      }

      function onPoll() {
        if (isKeyDown || isMouseDown) {
          verbose('CrmMosaicoSyncMonitor: onPoll: defer pending input:', isKeyDown, isMouseDown);
          return;
        }
        if (lastInput === null) {
          return;
        }
        var now = (new Date()).getTime();
        if (now > lastSync + monitor.activeTimeout || now > lastInput + monitor.idleTimeout) {
          lastSync = now;
          lastInput = null;
          verbose('CrmMosaicoSyncMonitor: onPoll: fire', now);
          monitor.onSync();
        }
      }

      this.start = function start($iframe) {
        switch (++startCount) {
          case 1:
            return $iframe.load(function () {_start($iframe);});
          default:
            return _start($iframe);
        }
      };

      function _start($iframe) {
        verbose('CrmMosaicoSyncMonitor: start');
        intervalHandle = $interval(onPoll, monitor.interval);

        isKeyDown = isMouseDown = false;
        lastInput = null;
        lastSync = 0;

        var tgt = $iframe[0].contentDocument;
        tgt.addEventListener('mousedown', onMouseDown, true);
        tgt.addEventListener('mouseup', onMouseUp, true);
        tgt.addEventListener('keydown', onKeyDown, true);
        tgt.addEventListener('keyup', onKeyUp, true);
      }

      this.stop = function stop($iframe) {
        verbose('CrmMosaicoSyncMonitor: stop');
        $interval.cancel(intervalHandle);
        intervalHandle = null;

        var tgt = $iframe[0].contentDocument;
        tgt.removeEventListener('mousedown', onMouseDown, true);
        tgt.removeEventListener('mouseup', onMouseUp, true);
        tgt.removeEventListener('keydown', onKeyDown, true);
        tgt.removeEventListener('keyup', onKeyUp, true);
      };
    };
  });


angular.module('crmMosaico').directive('crmMosaicoTemplateItem', function () {
    return {
      restrict: 'AE',
      templateUrl: '~/crmMosaico/TemplateItem.html',
      scope: {
        crmMosaicoTemplateItem: '='
      },
      link: function ($scope, $el, $attr) {
        var mainActionLabels = {
          select: "Select",
          selected: "Edit",
          configure: "Edit",
          new: "New"
        };

        var ts = $scope.ts = CRM.ts('mosaico');
        $scope.mainActionLabel = "";

        $scope.$watch('crmMosaicoTemplateItem', function (newValue) {
          $scope.myOptions = newValue;
          if (newValue.state) {
            $scope.mainActionLabel = mainActionLabels[newValue.state];
          }
        });
        $scope.hasAction = function hasAction(action) {
          if (!$attr['on' + action]) return false;
          if ($attr['check' + action]) {
            if (!$scope.$parent.$eval($attr['check' + action])) {
              return false;
            }
          }
          return true;
        };
        $scope.fireAction = function fireAction(action) {
          $scope.$parent.$eval($attr[action], {});
        };
      }
    };
  });

angular.module('crmMosaico').factory('crmMosaicoTemplates', function ($q, crmApi, $timeout, CrmMosaicoIframe, crmBlocker, crmStatus) {
    var ts = CRM.ts(null);
    var cache = {};
    var block = crmBlocker();
    var currentIframe, warmTplId;

    function filterBase(base) {
      return {
        id: 'base-' + base.name,
        baseDetails: base,
        title: ts('Empty Template'),
        type: base.title,
        thumbnail: base.thumbnail,
        path: base.path,
        isBase: true,
        category_id: null,
        category: ts('Base Template'),
        isHidden: base.is_hidden
      };
    }
    function filterTemplate(tpl) {
      var base = cache.basesByName[tpl.base];
      return {
        id: tpl.id,
        baseDetails: base,
        title: tpl.title,
        type: base.title,
        thumbnail: base.thumbnail,
        path: base.path,
        base: tpl.base,
        category_id: tpl.category_id,
        category: tpl.category_id && cache.categoriesByValue[tpl.category_id] ? cache.categoriesByValue[tpl.category_id].label : '',
        isBase: false
      };
    }

    crmApi({
      bases: ['MosaicoBaseTemplate', 'get', {sequential: 1, options: {sort: 'title ASC', limit: 0}}],
      templates: ['MosaicoTemplate', 'get', {sequential: 1, options: {sort: 'title ASC', limit: 0}, return: ['title', 'base', 'category_id']}],
      categories: ['OptionValue', 'get', {sequential: 1, is_active: 1, option_group_id: 'mailing_template_category', options: {sort: 'weight ASC', limit: 0}, return: ['value', 'label']}]
    }).then(function(r){
      cache.categories = r.categories.values;
      cache.categoriesByValue = _.indexBy(r.categories.values, 'value');
      cache.basesByName = _.indexBy(r.bases.values, 'name');
      cache.bases = _.map(r.bases.values, filterBase);
      cache.configured = _.map(r.templates.values, filterTemplate);
      cache.all = _.union(cache.bases, cache.configured);
    });

    function arrayDel(array, item) {
      var p = _.indexOf(array, item);
      if (p >= 0) array.splice(p, 1);
    }

    function register(tpl) {
      cache.configured.push(tpl);
      cache.all.push(tpl);
      return tpl;
    }

    function getFull(template) {
      if (!template.isBase) {
        return crmApi('MosaicoTemplate', 'getsingle', {id: template.id});
      }
      return $q(function(resolve){
        $timeout(function(){resolve({});}, 100);
      });
    }

    return {
      whenLoaded: function whenLoaded() {
        return $q(function(resolve) {
          var poll = function() {
            if (cache.all !== undefined) resolve();
            else $timeout(poll, 100);
          };
          poll();
        });
      },
      create: function(params) {
        return crmApi('MosaicoTemplate', 'create', params).then(function(r){
          return register(filterTemplate(r.values[r.id]));
        });
      },
      clone: function(params) {
        return crmApi('MosaicoTemplate', 'clone', params).then(function(r){
          return register(filterTemplate(r.values[r.id]));
        });
      },
      'delete': function(tpl) {
        if (tpl.isBase) throw "Cannot delete base template";
        return crmApi('MosaicoTemplate', 'delete', {id: tpl.id}).then(function(){
          arrayDel(cache.configured, tpl);
          arrayDel(cache.all, tpl);
        });
      },
      getFull: getFull,
      getBases: function() {
        return cache.bases.filter((template) => !template.isHidden);
      },
      getConfigured: function(){ return cache.configured; },
      getAll: function() {
        return cache.all.filter((template) => !template.isHidden);
      },
      getCategories: function() {
        return cache.categories;
      },
      save: function(tplId, viewModel) {
        viewModel.metadata.changed = Date.now();
        return crmApi('MosaicoTemplate', 'create', {
          id: tplId,
          html: viewModel.exportHTML(),
          metadata: viewModel.exportMetadata(),
          content: viewModel.exportJSON()
        });
      },
      edit: function(tpl) {
        function save(tplId, viewModel) {
          viewModel.metadata.changed = Date.now();
          return crmApi('MosaicoTemplate', 'create', {
            id: tplId,
            html: viewModel.exportHTML(),
            metadata: viewModel.exportMetadata(),
            content: viewModel.exportJSON()
          });
        }

        return $q(function(resolve, reject) {
          if (block.check()) {
            return reject({});
          }

          if (warmTplId === tpl.id) {
            currentIframe.show();
            return reject({});
          }

          warmTplId = tpl.id;
          var openPromise = getFull(tpl).then(function(fullTpl) {
            if (currentIframe) currentIframe.destroy();
            var base = tpl.baseDetails || cache.basesByName[tpl.base];
            currentIframe = new CrmMosaicoIframe({
              model: {
                template: base.path,
                metadata: fullTpl.metadata,
                content: fullTpl.content
              },
              actions: {
                sync: function(ko, viewModel) {
                  var savePromise = save(tpl.id, viewModel);
                  crmStatus({start: ts('Saving'), success: ts('Saved')}, savePromise);
                },
                save: function(ko, viewModel) {
                  var savePromise = save(tpl.id, viewModel).then(function(result) {
                    currentIframe.hide();
                    resolve(result);
                  });
                  crmStatus({start: ts('Saving'), success: ts('Saved')}, savePromise);
                }
              }
            });
            return currentIframe.open();
          });

          block(crmStatus({start: ts('Loading...'), success: null}, openPromise));
        });
      }
    };
  });


angular.module('crmMosaico').service('crmMosaicoVariants', function() {

    function angularObj(obj) {
      return JSON.parse(angular.toJson(obj));
    }

    const mainPlaceholders = {
      subject: 'VARIANT SUBJECTS',
      body_html: 'VARIANT HTMLS',
      from_name: 'VARIANT FROM',
      from_email: 'VARIANT@EXAMPLE.ORG',
      replyto_email: '"VARIANT FROM" <VARIANT@EXAMPLE.ORG>',
      mosaicoTemplate: "",
      mosaicoMetadata: '{}',
      mosaicoContent: '{}'
    };

    const self = {
      getLabels: () => ['A', 'B'],
      split: function split(mailing, field, bValue) {
        if (_.isArray(field)) {
          bValue = bValue || {};
          return angular.forEach(field, (f) => self.split(mailing, f, bValue[field]));
        }

        mailing.template_options.variants = mailing.template_options.variants || [];

        const mainObj = field.match(/^mosaico/) ? mailing.template_options : mailing;
        mailing.template_options.variants[0] = mailing.template_options.variants[0] || {};

        mailing.template_options.variants[1] = mailing.template_options.variants[1] || {};
        mailing.template_options.variants[0][field] = mainObj[field];
        mailing.template_options.variants[1][field] = (bValue === undefined ? mainObj[field] : bValue);

        if (mainPlaceholders[field] !== undefined) {
          mainObj[field] = mainPlaceholders[field];
        }
      },
      remove: function remove(mailing, field, deleteVid) {
        if (_.isArray(field)) {
          return angular.forEach(field, (f) => self.remove(mailing, f, deleteVid));
        }

        const mainObj = field.match(/^mosaico/) ? mailing.template_options : mailing;
        const deadVariant = mailing.template_options.variants[deleteVid];
        const liveVariant = mailing.template_options.variants[deleteVid ? 0 : 1];

        mainObj[field] = liveVariant[field];
        delete liveVariant[field];
        delete deadVariant[field];
        const nonEmpties = _.filter(mailing.template_options.variants, (v) => !_.isEmpty(angularObj(v)));
        if (nonEmpties.length === 0) {
          delete mailing.template_options.variants;
        }
      },
      preview: function preview(mailing, vid) {
        const preview = angular.copy(mailing, {}, 5);
        if (vid !== null && vid !== undefined) {
          angular.extend(preview, mailing.template_options.variants[vid]);
        }
        delete preview.id;
        delete preview.template_options.variants;
        delete preview.mosaicoTemplate;
        delete preview.mosaicoMetadata;
        delete preview.mosaicoContent;
        return preview;
      },
      isSplit: function isSplit(mailing, field) {
        if (!mailing.template_options || !mailing.template_options.variants) {
          return false;
        }
        if (field) {
          return (field in mailing.template_options.variants[0]);
        }
        const nonEmpties = _.filter(mailing.template_options.variants, (v) => !_.isEmpty(angularObj(v)));
        return nonEmpties.length > 0;
      }
    };
    return self;
  });

angular.module('crmProfileUtils', []);

  angular.module('crmProfileUtils').factory('crmProfiles', function($q, crmApi){
    function loadNextScript(scripts, callback, fail) {
      var script = scripts.shift();
      var isAbsoluteUrl = /^(http|\/)/.test(script.url);
      var baseUrl = script.packages ? CRM.config.packagesBase : CRM.config.resourceBase;
      script.url = isAbsoluteUrl ? script.url : baseUrl + script.url;

      CRM.$.getScript(script.url)
        .done(function(scriptData, status) {
          if(scripts.length) {
            loadNextScript(scripts, callback, fail);
          } else {
            callback();
          }
        }).fail(function(jqxhr, settings, exception) {
          fail(exception);
        });
    }

    function loadStyleFile(url) {
      CRM.$("#backbone_resources").append('<link type="text/css" rel="stylesheet" href="'+url+'" />');
    }

    function loadBackbone() {
      var deferred = $q.defer();
      var scripts = [
        {url: 'jquery/plugins/jstree/jquery.jstree.js', weight: 0, packages: true},
        {url: 'backbone/json2.js', weight: 100, packages: true},
        {url: 'backbone/backbone.js', weight: 120, packages: true},
        {url: 'backbone/backbone.marionette.js', weight: 125, packages: true},
        {url: 'backbone/backbone.collectionsubset.js', weight: 125, packages: true},
        {url: 'backbone-forms/distribution/backbone-forms.js', weight: 130, packages: true},
        {url: 'backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js', weight: 140, packages: true},
        {url: 'backbone-forms/distribution/editors/list.min.js', weight: 140, packages: true},
        {url: CRM.crmProfileUtils.backboneInitUrl, weight: 145, packages: false},
        {url: 'js/crm.backbone.js', weight: 150, packages: false},
        {url: 'js/model/crm.schema-mapped.js', weight: 200, packages: false},
        {url: 'js/model/crm.uf.js', weight: 200, packages: false},
        {url: 'js/model/crm.designer.js', weight: 200, packages: false},
        {url: 'js/model/crm.profile-selector.js', weight: 200, packages: false},
        {url: 'js/view/crm.designer.js', weight: 200, packages: false},
        {url: 'js/view/crm.profile-selector.js', weight: 200, packages: false},
        {url: 'js/jquery/jquery.crmProfileSelector.js', weight: 250, packages: false},
        {url: 'js/crm.designerapp.js', weight: 250, packages: false}
      ];

      scripts.sort(function(a, b){
        return a.weight-b.weight;
      });
      CRM.origJQuery = window.jQuery;
      window.jQuery = CRM.$;
      window._ = CRM._;

      loadStyleFile(CRM.config.packagesBase + 'jquery/plugins/jstree/themes/default/style.css');
      loadStyleFile(CRM.config.packagesBase + 'backbone-forms/distribution/templates/default.css');
      loadStyleFile(CRM.config.resourceBase + 'css/crm.designer.css');
      loadNextScript(scripts, function () {
        window.jQuery = CRM.origJQuery;
        delete CRM.origJQuery;
        delete window._;
        deferred.resolve(true);
      }, function(status) {
        deferred.resolve(status);
      });

      return deferred.promise;
    }

    function loadSettings() {
      var deferred = $q.defer();
      crmApi('profile', 'getangularsettings').then(function(result) {
        if(result.hasOwnProperty('values')) {
          CRM.$.extend(true, CRM, result.values);
        }
        if (!verifyBackbone()) {
          loadBackbone().then(function() {
            deferred.resolve(true);
          });
        } else {
          deferred.resolve(true);
        }
      }, function(status) {
        deferred.reject(status);
      });
      return deferred.promise;
    }

    function loadTemplate() {
      var deferred = $q.defer();
      CRM.$("body").append("<div id='backbone_templates'></div>");
      CRM.$("#backbone_templates").load(CRM.url("civicrm/angularprofiles/template", {snippet: 5}), function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }
    function verifyBackbone() {
      return !!CRM.Backbone;
    }
    function verifyTemplate() {
      return (angular.element("#designer_template").length > 0);
    }
    function verifySettings() {
      return (!!CRM.PseudoConstant && !!CRM.initialProfileList && !!CRM.contactSubTypes && !!CRM.profilePreviewKey);
    }

    return {
      verify: function() {
        return (verifyBackbone() && verifyTemplate() && verifySettings());
      },
      load: function() {
        var deferred = $q.defer();
        var promises = [];

        if (CRM.$("#backbone_resources").length < 1) {
          CRM.$("body").append("<div id='backbone_resources'></div>");
        }
        if(!verifySettings()) {
          promises.push(loadSettings());
        } else if(!verifyBackbone()) {
          promises.push(loadBackbone());
        }

        if(!verifyTemplate()) {
          promises.push(loadTemplate());
        }

        $q.all(promises).then(
          function () {
            deferred.resolve(true);
          },
          function () {
            console.log("Failed to load all backbone resources");
            deferred.reject(ts("Failed to load all backbone resources"));
          }
        );

        return deferred.promise;
      }
    };
  })
    .directive('crmProfileSelector', function () {
      return {
        require: '?ngModel',
        scope: {
          crmProfileSelector: '='
        },
        link: function (scope, element, attrs, ngModel) {
          ngModel.$render = function () {
            if (!element.val() && !element.hasClass("rendered")) {
              element.val(ngModel.$modelValue);
              element.crmProfileSelector(scope.crmProfileSelector || {});
            }
          };
        }
      };
    });

angular.module('crmResource', []);

  angular.module('crmResource').factory('crmResource', function($q, $http) {
    var deferreds = {}; // null|object; deferreds[url][idx] = Deferred;

    var notify = function notify() {
      var oldDfrds = deferreds;
      deferreds = null;

      angular.forEach(oldDfrds, function(dfrs, url) {
        if (CRM.angular.templates[url]) {
          angular.forEach(dfrs, function(dfr) {
            dfr.resolve({
              status: 200,
              headers: function(name) {
                var headers = {'Content-type': 'text/html'};
                return name ? headers[name] : headers;
              },
              data: CRM.angular.templates[url]
            });
          });
        }
        else {
          angular.forEach(dfrs, function(dfr) {
            dfr.reject({status: 500}); // FIXME
          });
        }
      });
    };

    var moduleUrl = CRM.angular.bundleUrl;
    $http.get(moduleUrl)
      .then(function httpSuccess(response) {
        CRM.angular.templates = CRM.angular.templates || {};
        angular.forEach(response.data, function (module) {
          if (module.partials) {
            angular.extend(CRM.angular.templates, module.partials);
          }
          if (module.strings) {
            CRM.addStrings(module.domain, module.strings);
          }
        });
        notify();
      }, function httpError() {
        notify();
      });

    return {
      getUrl: function getUrl(url) {
        if (CRM.angular.templates && CRM.angular.templates[url]) {
          return CRM.angular.templates[url];
        }
        else {
          var deferred = $q.defer();
          if (!deferreds[url]) {
            deferreds[url] = [];
          }
          deferreds[url].push(deferred);
          return deferred.promise;
        }
      }
    };
  });

  angular.module('crmResource').config(function($provide) {
    $provide.decorator('$templateCache', function($delegate, $http, $q, crmResource) {
      var origGet = $delegate.get;
      var urlPat = /^~\//;
      $delegate.get = function(url) {
        if (urlPat.test(url)) {
          return crmResource.getUrl(url);
        }
        else {
          return origGet.call(this, url);
        }
      };
      return $delegate;
    });
  });


angular.module('crmRouteBinder', CRM.angRequires('crmRouteBinder'));
  var pendingUpdates = null, activeTimer = null, registered = false, ignorable = {};

  function registerGlobalListener($injector) {
    if (registered) return;
    registered = true;

    $injector.get('$rootScope').$on('$routeUpdate', function () {
      if (null === pendingUpdates) {
        $injector.get('$route').reload();
      }
    });
  }

  var formats = {
    json: {
      watcher: '$watchCollection',
      decode: angular.fromJson,
      encode: angular.toJson,
      default: {}
    },
    raw: {
      watcher: '$watch',
      decode: function(v) { return v; },
      encode: function(v) { return v; },
      default: ''
    },
    int: {
      watcher: '$watch',
      decode: function(v) { return parseInt(v); },
      encode: function(v) { return v; },
      default: 0
    },
    bool: {
      watcher: '$watch',
      decode: function(v) { return v === '1'; },
      encode: function(v) { return v ? '1' : '0'; },
      default: false
    }
  };

  angular.module('crmRouteBinder').config(function ($provide) {
    $provide.decorator('$rootScope', function ($delegate, $injector, $parse) {
      Object.getPrototypeOf($delegate).$bindToRoute = function (options) {
        registerGlobalListener($injector);

        options.format = options.format || 'json';
        var fmt = _.clone(formats[options.format]);
        if (options.deep) {
          fmt.watcher = '$watch';
        }
        if (options.default === undefined) {
          options.default = fmt.default;
        }
        var value,
          _scope = this,
          $route = $injector.get('$route'),
          $timeout = $injector.get('$timeout');

        if (options.param in $route.current.params) {
          value = fmt.decode($route.current.params[options.param]);
        }
        else {
          value = _.cloneDeep(options.default);
          ignorable[options.param] = fmt.encode(options.default);
        }
        $parse(options.expr).assign(_scope, value);
        _scope[fmt.watcher](options.expr, function (newValue) {
          var encValue = fmt.encode(newValue);
          if (!_.isEqual(newValue, options.default) && $route.current.params[options.param] === encValue) {
            return;
          }

          pendingUpdates = pendingUpdates || {};
          pendingUpdates[options.param] = encValue;
          var p = angular.extend({}, $route.current.params, pendingUpdates);

          angular.forEach(ignorable, function(v, k) {
            if (p[k] === v) {
              delete p[k];
            }
          });
          if (_.isEqual(newValue, options.default)) {
            p[options.param] = null;
          }

          $route.updateParams(p);

          if (activeTimer) $timeout.cancel(activeTimer);
          activeTimer = $timeout(function () {
            pendingUpdates = null;
            activeTimer = null;
            ignorable = {};
          }, 50);
        }, options.deep);
      };

      return $delegate;
    });
  });


angular.module('crmStatusPage', CRM.angRequires('crmStatusPage'));
  angular.module('crmStatusPage').config( function($routeProvider) {
    $routeProvider.when('/status', {
      controller: 'crmStatusPageCtrl',
      templateUrl: '~/crmStatusPage/StatusPage.html',

      resolve: {
        statusData: function(crmApi) {
          return crmApi('System', 'check', {sequential: 1, options: {limit: 0, sort: 'severity_id DESC'}});
        }
      }
    });

  }
);

angular.module('crmStatusPage').controller('crmStatusPageCtrl',
    function($scope, crmApi, crmStatus, statusData) {
      $scope.ts = CRM.ts();
      $scope.help = CRM.help;
      $scope.formatDate = CRM.utils.formatDate;
      $scope.statuses = statusData.values;
      function refresh(apiCalls, title) {
        title = title || 'Untitled operation';
        apiCalls = (apiCalls || []).concat([['System', 'check', {sequential: 1, options: {limit: 0, sort: 'severity_id DESC'}}]]);
        $('#crm-status-list').block();
        crmApi(apiCalls, true)
          .then(function(results) {
            $scope.statuses = results[results.length - 1].values;
            results.forEach(function(result) {
              if (result.is_error) {
                var error_message = ts(result.error_message);
                if (typeof(result.debug_information) !== 'undefined') {
                  error_message += '<div class="status-debug-information">' +
                      '<b>' + ts('Debug information') + ':</b><br>' +
                      result.debug_information + '</div>';
                }
                CRM.alert(error_message, ts('Operation failed: ' + title), 'error');
                }
              });
            $('#crm-status-list').unblock();
          });
      }
      $scope.setPref = function(status, until, visible) {
        refresh([
          ['StatusPreference', 'create', {
            name: status.name,
            ignore_severity: visible ? 0 : status.severity,
            hush_until: until
          }]
        ], 'Set preference');
      };

      $scope.countVisible = function(visibility) {
        return _.filter($scope.statuses, function(s) {
          return s.is_visible == visibility && s.severity_id >= 2;
        }).length;
      };

      $scope.doAction = function(action) {
        function run() {
          switch (action.type) {
            case 'href':
              window.location = action.params.url ? action.params.url : CRM.url(action.params.path, action.params.query, action.params.mode);
              break;

            case 'api3':
              refresh([action.params], action.title);
              break;

            case 'api4':
              $('#crm-status-list').block();
              CRM.api4([action.params]).then(() => refresh());
              break;
          }
        }

        if (action.confirm) {
          CRM.confirm({
            title: action.title,
            message: action.confirm
          }).on('crmConfirm:yes', run);
        } else {
          run();
        }
      };
    });


angular.module('crmStatusPage')
    .filter('trusted', function($sce){ return $sce.trustAsHtml; })
    .directive('statuspagePopupMenu', function($timeout) {
      return {
        templateUrl: '~/crmStatusPage/SnoozeOptions.html',
        transclude: true,

        link: function(scope, element, attr) {
          element.on('click', '.hush-menu-button', function() {
            $timeout(function() {
              $('ul', element).show().menu();
              element.closest('h3').addClass('menuopen');
              $('body').one('click', function() {
                $('ul', element).menu('destroy').hide();
                element.closest('h3').removeClass('menuopen');
              });
            });
          });
          element.on('click', 'button:not(.hush-menu-button), li', function() {
            $(this).closest('div.crm-status-item').slideUp();
          });
        }
      };
    });


var uidCount = 0,
    pageTitleHTML = 'CiviCRM',
    documentTitle = 'CiviCRM';

  angular.module('crmUi', CRM.angRequires('crmUi'))
    .directive('crmUiAccordion', function() {
      return {
        scope: {
          crmUiAccordion: '='
        },
        template: '<details class="crm-accordion-bold"><summary>{{crmUiAccordion.title}} <a crm-ui-help="help" ng-if="help"></a></summary><div class="crm-accordion-body" ng-transclude></div></details>',
        transclude: true,
        link: function (scope, element, attrs) {
          scope.help = null;
          let openSet = false;
          scope.$watch('crmUiAccordion', function(crmUiAccordion, oldVal) {
            if (crmUiAccordion) {
              if (!openSet) {
                $(element).children('details').prop('open', !crmUiAccordion.collapsed);
                openSet = true;
              }
              if (crmUiAccordion.help) {
                scope.help = crmUiAccordion.help.clone({}, {
                  title: crmUiAccordion.title
                });
              }
            }
          });
        }
      };
    })
    .service('crmUiAlert', function($compile, $rootScope, $templateRequest, $q) {
      var count = 0;
      return function crmUiAlert(params) {
        var id = 'crmUiAlert_' + (++count);
        var tpl = null;
        if (params.templateUrl) {
          tpl = $templateRequest(params.templateUrl);
        }
        else if (params.template) {
          tpl = params.template;
        }
        if (tpl) {
          params.text = '<div id="' + id + '"></div>'; // temporary stub
        }
        var result = CRM.alert(params.text, params.title, params.type, params.options);
        if (tpl) {
          $q.when(tpl, function(html) {
            var scope = params.scope || $rootScope.$new();
            var linker = $compile(html);
            $('#' + id).append($(linker(scope)));
          });
        }
        return result;
      };
    })
    .directive('crmUiDatepicker', function ($timeout) {
      return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
          crmUiDatepicker: '='
        },
        link: function (scope, element, attrs, ngModel) {
          ngModel.$render = function () {
            element.val(ngModel.$viewValue).change();
          };
          let settings = angular.copy(scope.crmUiDatepicker || {});
          settings.start_date_years = settings.start_date_years || 100;
          settings.end_date_years = settings.end_date_years || 100;
          $timeout(function() {
            element
              .crmDatepicker(settings)
              .on('change', function () {
                $timeout(function() {
                  let requiredLength = 19;
                  if (settings.time === false) {
                    requiredLength = 10;
                  }
                  if (settings.date === false) {
                    requiredLength = 8;
                  }
                  ngModel.$setValidity('incompleteDateTime', !(element.val().length && element.val().length !== requiredLength));
                });
              });
          });
        }
      };
    })
    .directive('crmUiDebug', function ($location) {
      return {
        restrict: 'AE',
        scope: {
          crmUiDebug: '@'
        },
        template: function() {
          var args = $location.search();
          if (args && args.angularDebug) {
            var jsonTpl = (CRM.angular.modules.indexOf('jsonFormatter') < 0) ? '<pre>{{data|json}}</pre>' : '<json-formatter json="data" open="1"></json-formatter>';
            return '<div crm-ui-accordion=\'{title: ts("Debug (%1)", {1: crmUiDebug}), collapsed: true}\'>' + jsonTpl + '</div>';
          }
          return '';
        },
        link: function(scope, element, attrs) {
          var args = $location.search();
          if (args && args.angularDebug) {
            scope.ts = CRM.ts(null);
            scope.$parent.$watch(attrs.crmUiDebug, function(data) {
              scope.data = data;
            });
          }
        }
      };
    })
    .directive('crmUiField', function() {
      var templateUrls = {
        default: '~/crmUi/field.html',
        checkbox: '~/crmUi/field-cb.html'
      };

      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        scope: {
          crmUiField: '='
        },
        templateUrl: function(tElement, tAttrs){
          var layout = tAttrs.crmLayout ? tAttrs.crmLayout : 'default';
          return templateUrls[layout];
        },
        transclude: true,
        link: function (scope, element, attrs, crmUiIdCtrl) {
          $(element).addClass('crm-section');
          scope.help = null;
          scope.$watch('crmUiField', function(crmUiField) {
            if (crmUiField && crmUiField.help) {
              scope.help = crmUiField.help.clone({}, {
                title: crmUiField.title
              });
            }
          });
        }
      };
    })
    .directive('crmUiId', function () {
      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        link: {
          pre: function (scope, element, attrs, crmUiIdCtrl) {
            var id = crmUiIdCtrl.get(attrs.crmUiId);
            element.attr('id', id);
          }
        }
      };
    })
    .service('crmUiHelp', function(){
      function FieldHelp(options) {
        this.options = options;
      }
      angular.extend(FieldHelp.prototype, {
        get: function(n) {
          return this.options[n];
        },
        open: function open() {
          CRM.help(this.options.title, {id: this.options.id, file: this.options.file});
        },
        clone: function clone(options, defaults) {
          return new FieldHelp(angular.extend({}, defaults, this.options, options));
        }
      });
      return function(defaults){
        return function(options) {
          if (_.isString(options)) {
            options = {id: options};
          }
          return new FieldHelp(angular.extend({}, defaults, options));
        };
      };
    })
    .directive('crmUiHelp', function() {
      return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
          setTimeout(function() {
            var crmUiHelp = scope.$eval(attrs.crmUiHelp);
            var title = crmUiHelp && crmUiHelp.get('title') ? ts('%1 Help', {1: crmUiHelp.get('title')}) : ts('Help');
            element.attr('title', title);
          }, 50);

          element
            .addClass('helpicon')
            .attr('href', '#')
            .on('click', function(e) {
              e.preventDefault();
              scope.$eval(attrs.crmUiHelp).open();
            });
        }
      };
    })
    .directive('crmUiFor', function ($parse, $timeout) {
      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        template: '<span ng-class="cssClasses"><span ng-transclude/><span crm-ui-visible="crmIsRequired" class="crm-marker" title="This field is required.">*</span></span>',
        transclude: true,
        link: function (scope, element, attrs, crmUiIdCtrl) {
          scope.crmIsRequired = false;
          scope.cssClasses = {};

          if (!attrs.crmUiFor) return;

          var id = crmUiIdCtrl.get(attrs.crmUiFor);
          element.attr('for', id);
          var ngModel = null;

          var updateCss = function () {
            scope.cssClasses['crm-error'] = !ngModel.$valid && !ngModel.$pristine;
          };
          var init = function (retries, retryDelay) {
            var input = $('#' + id);
            if (input.length === 0 && !attrs.crmUiForceRequired) {
              if (retries) {
                $timeout(function(){
                  init(retries-1, retryDelay);
                }, retryDelay);
              }
              return;
            }

            if (attrs.crmUiForceRequired) {
              scope.crmIsRequired = true;
              return;
            }

            var tgtScope = scope;//.$parent;
            if (attrs.crmDepth) {
              for (var i = attrs.crmDepth; i > 0; i--) {
                tgtScope = tgtScope.$parent;
              }
            }

            if (input.attr('ng-required')) {
              scope.crmIsRequired = scope.$parent.$eval(input.attr('ng-required'));
              scope.$parent.$watch(input.attr('ng-required'), function (isRequired) {
                scope.crmIsRequired = isRequired;
              });
            }
            else {
              scope.crmIsRequired = input.prop('required');
            }

            ngModel = $parse(attrs.crmUiFor)(tgtScope);
            if (ngModel) {
              ngModel.$viewChangeListeners.push(updateCss);
            }
          };

          $timeout(function(){
            init(3, 100);
          });
        }
      };
    })
    .directive('crmUiIdScope', function () {
      return {
        restrict: 'EA',
        scope: {},
        controllerAs: 'crmUiIdCtrl',
        controller: function($scope) {
          var ids = {};
          this.get = function(name) {
            if (!ids[name]) {
              ids[name] = "crmUiId_" + (++uidCount);
            }
            return ids[name];
          };
        },
        link: function (scope, element, attrs) {}
      };
    })
    .directive('crmUiIframe', function ($parse) {
      return {
        scope: {
          crmUiIframeSrc: '@', // expression which evaluates to a URL
          crmUiIframe: '@' // expression which evaluates to HTML content
        },
        link: function (scope, elm, attrs) {
          var iframe = $(elm)[0];
          iframe.setAttribute('width', '100%');
          iframe.setAttribute('height', '250px');
          iframe.setAttribute('frameborder', '0');

          var refresh = function () {
            if (attrs.crmUiIframeSrc) {
              iframe.setAttribute('src', scope.$parent.$eval(attrs.crmUiIframeSrc));
            }
            else {
              var iframeHtml = scope.$parent.$eval(attrs.crmUiIframe);

              var doc = iframe.document;
              if (iframe.contentDocument) {
                doc = iframe.contentDocument;
              }
              else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document;
              }

              doc.open();
              doc.writeln(iframeHtml);
              doc.close();
            }
          };
          $(elm).parent().on('dialogresize dialogopen', function(e, ui) {
            $(this).css({padding: '0', margin: '0', overflow: 'hidden'});
            iframe.setAttribute('height', '' + $(this).innerHeight() + 'px');
          });

          $(elm).parent().on('dialogresize', function(e, ui) {
            iframe.setAttribute('class', 'resized');
          });

          scope.$parent.$watch(attrs.crmUiIframe, refresh);
        }
      };
    })
    .directive('crmUiInsertRx', function() {
      return {
        link: function(scope, element, attrs) {
          scope.$on(attrs.crmUiInsertRx, function(e, tokenName) {
            CRM.wysiwyg.insert(element, tokenName);
            $(element).select2('close').select2('val', '');
            CRM.wysiwyg.focus(element);
          });
        }
      };
    })
    .directive('crmUiRichtext', function ($timeout) {
      return {
        require: '?ngModel',
        link: function (scope, elm, attr, ngModel) {
          $timeout(function() {
            var editor = CRM.wysiwyg.create(elm);

            if (!ngModel) {
              return;
            }

            if (attr.ngBlur) {
              $(elm).on('blur', function() {
                $timeout(function() {
                  scope.$eval(attr.ngBlur);
                });
              });
            }

            ngModel.$render = function(value) {
              editor.done(function() {
                CRM.wysiwyg.setVal(elm, ngModel.$viewValue || '');
              });
            };
          });
        }
      };
    })
    .directive('crmUiLock', function ($parse, $rootScope) {
      var defaultVal = function (defaultValue) {
        var f = function (scope) {
          return defaultValue;
        };
        f.assign = function (scope, value) {
        };
        return f;
      };
      var parse = function (expr, defaultValue) {
        return expr ? $parse(expr) : defaultVal(defaultValue);
      };

      return {
        template: '',
        link: function (scope, element, attrs) {
          var binding = parse(attrs.binding, true);
          var titleLocked = parse(attrs.titleLocked, ts('Locked'));
          var titleUnlocked = parse(attrs.titleUnlocked, ts('Unlocked'));

          $(element).addClass('crm-i lock-button');
          var refresh = function () {
            var locked = binding(scope);
            if (locked) {
              $(element)
                .removeClass('fa-unlock')
                .addClass('fa-lock')
                .prop('title', titleLocked(scope))
              ;
            }
            else {
              $(element)
                .removeClass('fa-lock')
                .addClass('fa-unlock')
                .prop('title', titleUnlocked(scope))
              ;
            }
          };

          $(element).click(function () {
            binding.assign(scope, !binding(scope));
            $rootScope.$digest();
          });

          scope.$watch(attrs.binding, refresh);
          scope.$watch(attrs.titleLocked, refresh);
          scope.$watch(attrs.titleUnlocked, refresh);

          refresh();
        }
      };
    })
    .service('CrmUiOrderCtrl', function(){
      function CrmUiOrderCtrl(defaults){
        this.values = defaults;
      }
      angular.extend(CrmUiOrderCtrl.prototype, {
        get: function get() {
          return this.values;
        },
        getDir: function getDir(name) {
          if (this.values.indexOf(name) >= 0 || this.values.indexOf('+' + name) >= 0) {
            return '+';
          }
          if (this.values.indexOf('-' + name) >= 0) {
            return '-';
          }
          return '';
        },
        remove: function remove(name) {
          var idx = this.values.indexOf(name);
          if (idx >= 0) {
            this.values.splice(idx, 1);
            return true;
          }
          else {
            return false;
          }
        },
        setDir: function setDir(name, dir) {
          return this.toggle(name, dir);
        },
        toggle: function toggle(name, next) {
          if (!next && next !== '') {
            next = '+';
            if (this.remove(name) || this.remove('+' + name)) {
              next = '-';
            }
            if (this.remove('-' + name)) {
              next = '';
            }
          }

          if (next == '+') {
            this.values.unshift('+' + name);
          }
          else if (next == '-') {
            this.values.unshift('-' + name);
          }
        }
      });
      return CrmUiOrderCtrl;
    })
    .directive('crmUiOrder', function(CrmUiOrderCtrl) {
      return {
        link: function(scope, element, attrs){
          var options = angular.extend({var: 'crmUiOrderBy'}, scope.$eval(attrs.crmUiOrder));
          scope[options.var] = new CrmUiOrderCtrl(options.defaults);
        }
      };
    })
    .directive('crmUiOrderBy', function() {
      return {
        link: function(scope, element, attrs) {
          function updateClass(crmUiOrderCtrl, name) {
            var dir = crmUiOrderCtrl.getDir(name);
            element
              .toggleClass('sorting_asc', dir === '+')
              .toggleClass('sorting_desc', dir === '-')
              .toggleClass('sorting', dir === '');
          }

          element.on('click', function(e){
            var tgt = scope.$eval(attrs.crmUiOrderBy);
            tgt[0].toggle(tgt[1]);
            updateClass(tgt[0], tgt[1]);
            e.preventDefault();
            scope.$digest();
          });

          var tgt = scope.$eval(attrs.crmUiOrderBy);
          updateClass(tgt[0], tgt[1]);
        }
      };
    })
    .directive('crmUiSelect', function ($parse, $timeout) {
      return {
        require: '?ngModel',
        priority: 1,
        scope: {
          crmUiSelect: '='
        },
        link: function (scope, element, attrs, ngModel) {

          if (ngModel && !attrs.ngOptions) {
            ngModel.$render = function () {
              $timeout(function () {
                var newVal = _.cloneDeep(ngModel.$modelValue);
                if (typeof newVal === 'string' && element.select2('container').hasClass('select2-container-multi')) {
                  newVal = newVal.length ? newVal.split(scope.crmUiSelect.separator || ',') : [];
                }
                element.select2('val', newVal);
              });
            };
          }
          function refreshModel() {
            var oldValue = ngModel.$viewValue, newValue = element.select2('val');
            if (Array.isArray(newValue) && attrs.ngList) {
              newValue = newValue.join(attrs.ngList);
            }
            if (oldValue != newValue) {
              scope.$parent.$apply(function () {
                ngModel.$setViewValue(newValue);
              });
            }
          }

          function init() {
            element.crmSelect2(scope.crmUiSelect || {});
            if (ngModel) {
              element.on('change', refreshModel);
            }
          }
          if (attrs.ngOptions) {
            $timeout(function() {
              element.crmSelect2(scope.crmUiSelect || {});
              ngModel.$render = function () {
                element.val(ngModel.$viewValue || '').change();
              };
            });
          } else {
            $timeout(init);
          }
        }
      };
    })
    .directive('onCrmUiSelect', function () {
      return {
        priority: 10,
        link: function (scope, element, attrs) {
          element.on('select2-selecting', function(e) {
            e.preventDefault();
            element.select2('close').select2('val', '');
            scope.$apply(function() {
              scope.$eval(attrs.onCrmUiSelect, {selection: e.val});
            });
          });
        }
      };
    })
    .directive('crmEntityref', function ($parse, $timeout) {
      return {
        require: '?ngModel',
        scope: {
          crmEntityref: '='
        },
        link: function (scope, element, attrs, ngModel) {

          ngModel.$render = function () {
            $timeout(function () {
              var newVal = _.cloneDeep(ngModel.$modelValue);
              if (typeof newVal === 'string' && element.select2('container').hasClass('select2-container-multi')) {
                newVal = newVal.length ? newVal.split(',') : [];
              }
              element.select2('val', newVal);
            });
          };
          function refreshModel() {
            var oldValue = ngModel.$viewValue, newValue = element.select2('val');
            if (oldValue != newValue) {
              scope.$parent.$apply(function () {
                ngModel.$setViewValue(newValue);
              });
            }
          }

          function init() {
            element.crmEntityRef(scope.crmEntityref || {});
            element.on('change', refreshModel);
            $timeout(ngModel.$render);
          }

          init();
        }
      };
    })
    .directive('crmAutocomplete', function () {
      return {
        require: {
          crmAutocomplete: 'crmAutocomplete',
          ngModel: '?ngModel'
        },
        priority: 100,
        bindToController: {
          entity: '<crmAutocomplete',
          crmAutocompleteParams: '<',
          multi: '<',
          autoOpen: '<',
          quickAdd: '<',
          staticOptions: '<'
        },
        link: function(scope, element, attr, ctrl) {
          var parseList = function(viewValue) {
            if (_.isUndefined(viewValue)) return;

            if (!ctrl.crmAutocomplete.multi) {
              return viewValue;
            }

            var list = [];

            if (viewValue) {
              _.each(viewValue.split(','), function(value) {
                if (value) {
                  list.push(_.trim(value));
                }
              });
            }

            return list;
          };

          if (ctrl.ngModel) {
            ctrl.ngModel.$render = function() {
              const newValue = (ctrl.ngModel.$viewValue === null || ctrl.ngModel.$viewValue === undefined || ctrl.ngModel.$viewValue === false) ? '' : ctrl.ngModel.$viewValue.toString();
              if (newValue !== element.val().toString()) {
                element.val(newValue).change();
              }
            };
            ctrl.ngModel.$parsers.push(parseList);
            ctrl.ngModel.$formatters.push(function(value) {
              return _.isArray(value) ? value.join(',') : value;
            });
            ctrl.ngModel.$isEmpty = function(value) {
              return !value || !value.length;
            };
          }
        },
        controller: function($element, $timeout) {
          var ctrl = this;
          this.$onChanges = function() {
            $timeout(function() {
              $element.crmAutocomplete(ctrl.entity, ctrl.crmAutocompleteParams || {}, {
                multiple: ctrl.multi,
                minimumInputLength: ctrl.autoOpen && _.isEmpty(ctrl.staticOptions) ? 0 : 1,
                static: ctrl.staticOptions || [],
                quickAdd: ctrl.quickAdd,
              });
            });
          };
        }
      };
    })
    .directive('crmMultipleEmail', function ($parse, $timeout) {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (_.isEmpty(viewValue)) {
              ctrl.$setValidity('crmMultipleEmail', true);
              return viewValue;
            }
            var emails = viewValue.split(',');
            var emailRegex = /\S+@\S+\.\S+/;

            var validityArr = emails.map(function(str){
              return emailRegex.test(str.trim());
            });

            if ($.inArray(false, validityArr) > -1) {
              ctrl.$setValidity('crmMultipleEmail', false);
            } else {
              ctrl.$setValidity('crmMultipleEmail', true);
            }
            return viewValue;
          });
        }
      };
    })
    .directive('crmUiTab', function($parse) {
      return {
        require: '^crmUiTabSet',
        restrict: 'EA',
        scope: {
          crmTitle: '@',
          crmIcon: '@',
          count: '@',
          id: '@'
        },
        template: '<div ng-transclude></div>',
        transclude: true,
        link: function (scope, element, attrs, crmUiTabSetCtrl) {
          crmUiTabSetCtrl.add(scope);
        }
      };
    })
    .directive('crmUiTabSet', function() {
      return {
        restrict: 'EA',
        scope: {
          crmUiTabSet: '@',
          tabSetOptions: '<'
        },
        templateUrl: '~/crmUi/tabset.html',
        transclude: true,
        controllerAs: 'crmUiTabSetCtrl',
        controller: function($scope, $element, $timeout) {
          var init;
          $scope.tabs = [];
          this.add = function(tab) {
            if (!tab.id) throw "Tab is missing 'id'";
            $scope.tabs.push(tab);
            if (init) {
              $timeout.cancel(init);
            }
            init = $timeout(function() {
              $element.find('.crm-tabset').tabs($scope.tabSetOptions);
            });
          };
        }
      };
    })
    .directive('crmUiValidate', function() {
      return {
        restrict: 'EA',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          var validationKey = attrs.crmUiValidateName ? attrs.crmUiValidateName : 'crmUiValidate';
          scope.$watch(attrs.crmUiValidate, function(newValue){
            ngModel.$setValidity(validationKey, !!newValue);
          });
        }
      };
    })
    .directive('crmUiVisible', function($parse) {
      return {
        restrict: 'EA',
        scope: {
          crmUiVisible: '@'
        },
        link: function (scope, element, attrs) {
          var model = $parse(attrs.crmUiVisible);
          function updatecChildren() {
            element.css('visibility', model(scope.$parent) ? 'inherit' : 'hidden');
          }
          updatecChildren();
          scope.$parent.$watch(attrs.crmUiVisible, updatecChildren);
        }
      };
    })
    .directive('crmUiWizard', function() {
      return {
        restrict: 'EA',
        scope: {
          crmUiWizard: '@',
          crmUiWizardNavClass: '@' // string, A list of classes that will be added to the nav items
        },
        templateUrl: '~/crmUi/wizard.html',
        transclude: true,
        controllerAs: 'crmUiWizardCtrl',
        controller: function($scope, $parse) {
          var steps = $scope.steps = []; // array<$scope>
          var crmUiWizardCtrl = this;
          var maxVisited = 0;
          var selectedIndex = null;

          var findIndex = function() {
            var found = null;
            angular.forEach(steps, function(step, stepKey) {
              if (step.selected) found = stepKey;
            });
            return found;
          };
          this.$index = function() { return selectedIndex; };
          this.$first = function() { return this.$index() === 0; };
          this.$last = function() { return this.$index() === steps.length -1; };
          this.$maxVisit = function() { return maxVisited; };
          this.$validStep = function() {
            return steps[selectedIndex] && steps[selectedIndex].isStepValid();
          };
          this.iconFor = function(index) {
            if (index < this.$index()) return 'crm-i fa-check';
            if (index === this.$index()) return 'crm-i fa-angle-double-right';
            return '';
          };
          this.isSelectable = function(step) {
            if (step.selected) return false;
            return this.$validStep();
          };

          /*** @param Object step the $scope of the step */
          this.select = function(step) {
            angular.forEach(steps, function(otherStep, otherKey) {
              otherStep.selected = (otherStep === step);
              if (otherStep === step && maxVisited < otherKey) maxVisited = otherKey;
            });
            selectedIndex = findIndex();
          };
          /*** @param Object step the $scope of the step */
          this.add = function(step) {
            if (steps.length === 0) {
              step.selected = true;
              selectedIndex = 0;
            }
            steps.push(step);
            steps.sort(function(a,b){
              return a.crmUiWizardStep - b.crmUiWizardStep;
            });
            selectedIndex = findIndex();
          };
          this.remove = function(step) {
            var key = null;
            angular.forEach(steps, function(otherStep, otherKey) {
              if (otherStep === step) key = otherKey;
            });
            if (key !== null) {
              steps.splice(key, 1);
            }
          };
          this.goto = function(index) {
            if (index < 0) index = 0;
            if (index >= steps.length) index = steps.length-1;
            this.select(steps[index]);
          };
          this.previous = function() { this.goto(this.$index()-1); };
          this.next = function() { this.goto(this.$index()+1); };
          if ($scope.crmUiWizard) {
            $parse($scope.crmUiWizard).assign($scope.$parent, this);
          }
        },
        link: function (scope, element, attrs) {
          scope.ts = CRM.ts(null);

          element.find('.crm-wizard-buttons button[ng-click^=crmUiWizardCtrl]').click(function () {
            var topOfWizard = element.offset().top;
            var heightOfMenu = $('#civicrm-menu').height() || 0;

            $('html')
              .stop()
              .animate({scrollTop: topOfWizard - heightOfMenu}, 1000);
          });
        }
      };
    })
    .directive('crmUiWizardButtons', function() {
      return {
        require: '^crmUiWizard',
        restrict: 'EA',
        scope: {},
        template: '<span ng-transclude></span>',
        transclude: true,
        link: function (scope, element, attrs, crmUiWizardCtrl) {
          var realButtonsEl = $(element).closest('.crm-wizard').find('.crm-wizard-buttons');
          $(element).appendTo(realButtonsEl);
        }
      };
    })
    .directive('crmIcon', function() {
      return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
          if (element.is('[crm-ui-tab]')) {
            return;
          }
          if (attrs.crmIcon) {
            if (attrs.crmIcon.substring(0,3) == 'fa-') {
              $(element).prepend('<i class="crm-i ' + attrs.crmIcon + '" aria-hidden="true"></i> ');
            }
            else {
              $(element).prepend('<span class="icon ui-icon-' + attrs.crmIcon + '"></span> ');
            }
          }
          if ($(element).is('button:not(.btn)')) {
            $(element).addClass('crm-button');
          }
        }
      };
    })
    .directive('crmUiWizardStep', function() {
      var nextWeight = 1;
      return {
        require: ['^crmUiWizard', 'form'],
        restrict: 'EA',
        scope: {
          crmTitle: '@', // expression, evaluates to a printable string
          crmUiWizardStep: '@', // int, a weight which determines the ordering of the steps
          crmUiWizardStepClass: '@' // string, A list of classes that will be added to the template
        },
        template: '<div class="crm-wizard-step {{crmUiWizardStepClass}}" ng-show="selected" ng-transclude/></div>',
        transclude: true,
        link: function (scope, element, attrs, ctrls) {
          var crmUiWizardCtrl = ctrls[0], form = ctrls[1];
          if (scope.crmUiWizardStep) {
            scope.crmUiWizardStep = parseInt(scope.crmUiWizardStep);
          } else {
            scope.crmUiWizardStep = nextWeight++;
          }
          scope.isStepValid = function() {
            return form.$valid;
          };
          crmUiWizardCtrl.add(scope);
          scope.$on('$destroy', function(){
            crmUiWizardCtrl.remove(scope);
          });
        }
      };
    })
    .directive('crmConfirm', function ($compile, $rootScope, $templateRequest, $q) {
      var defaultFuncs = {
        'disable': function (options) {
          return {
            message: ts('Are you sure you want to disable this?'),
            options: {no: ts('Cancel'), yes: ts('Disable')},
            width: 300,
            title: ts('Disable %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        },
        'revert': function (options) {
          return {
            message: ts('Are you sure you want to revert this?'),
            options: {no: ts('Cancel'), yes: ts('Revert')},
            width: 300,
            title: ts('Revert %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        },
        'delete': function (options) {
          return {
            message: ts('Are you sure you want to delete this?'),
            options: {no: ts('Cancel'), yes: ts('Delete')},
            width: 300,
            title: ts('Delete %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        }
      };
      var confirmCount = 0;
      return {
        link: function (scope, element, attrs) {
          $(element).click(function () {
            var options = scope.$eval(attrs.crmConfirm);
            if (attrs.title && !options.title) {
              options.title = attrs.title;
            }
            var defaults = (options.type) ? defaultFuncs[options.type](options) : {};

            var tpl = null, stubId = null;
            if (!options.message) {
              if (options.templateUrl) {
                tpl = $templateRequest(options.templateUrl);
              }
              else if (options.template) {
                tpl = options.template;
              }
              if (tpl) {
                stubId = 'crmUiConfirm_' + (++confirmCount);
                options.message = '<div id="' + stubId + '"></div>';
              }
            }

            if (options.confirmed) {
              scope.$apply(attrs.onYes);
              return;
            }

            CRM.confirm(_.extend(defaults, options))
              .on('crmConfirm:yes', function() { scope.$apply(attrs.onYes); })
              .on('crmConfirm:no', function() { scope.$apply(attrs.onNo); });

            if (tpl && stubId) {
              $q.when(tpl, function(html) {
                var scope = options.scope || $rootScope.$new();
                if (options.export) {
                  angular.extend(scope, options.export);
                }
                var linker = $compile(html);
                $('#' + stubId).append($(linker(scope)));
              });
            }
          });
        }
      };
    })
    .directive('crmPageTitle', function($timeout) {
      return {
        scope: {
          crmDocumentTitle: '='
        },
        link: function(scope, $el, attrs) {
          function update() {
            $timeout(function() {
              var newPageTitleHTML = $el.html().trim(),
                newDocumentTitle = scope.crmDocumentTitle || $el.text(),
                dialog = $el.closest('.ui-dialog-content');
              if (dialog.length) {
                dialog.dialog('option', 'title', newDocumentTitle);
                $el.hide();
              } else {
                document.title = $('title').text().replace(documentTitle, newDocumentTitle);
                [].forEach.call(document.querySelectorAll('h1:not(.crm-container h1), .crm-page-title-wrapper>h1'), h1 => {
                  if (h1.classList.contains('crm-page-title') || h1.innerHTML.trim() === pageTitleHTML) {
                    h1.classList.add('crm-page-title');
                    h1.innerHTML = newPageTitleHTML;
                    $el.hide();
                  }
                });
                pageTitleHTML = newPageTitleHTML;
                documentTitle = newDocumentTitle;
              }
            });
          }

          scope.$watch(function() {return scope.crmDocumentTitle + $el.html();}, update);
        }
      };
    })
    .directive("crmUiEditable", function() {
      return {
        restrict: "A",
        require: "ngModel",
        scope: {
          defaultValue: '='
        },
        link: function(scope, element, attrs, ngModel) {
          var ts = CRM.ts();

          function read() {
            var htmlVal = element.text();
            if (!htmlVal) {
              htmlVal = scope.defaultValue || '';
              element.text(htmlVal);
            }
            ngModel.$setViewValue(htmlVal);
          }

          ngModel.$render = function() {
            element.text(ngModel.$viewValue || scope.defaultValue || '');
          };
          element.on('keydown', function(e) {
            if (e.which === 13) {
              e.preventDefault();
              element.blur();
            }
            if (e.which === 27) {
              element.text(ngModel.$viewValue || scope.defaultValue || '');
              element.blur();
            }
          });

          element.on("blur change", function() {
            scope.$apply(read);
          });

          element.attr('contenteditable', 'true');
        }
      };
    })
    .directive('crmUiIconPicker', function($timeout) {
      return {
        restrict: 'A',
        require: '?ngModel', // Soft require ngModel
        controller: function($element, $scope, $attrs) {
          CRM.loadScript(CRM.config.resourceBase + 'js/jquery/jquery.crmIconPicker.js').then(function() {
            $timeout(function() {
              $element.crmIconPicker();
              if ($attrs.ngModel) {
                $scope.$watch($attrs.ngModel, function(newValue) {
                  if (newValue !== undefined) {
                    $element.val(newValue).trigger('change');
                  }
                });
              }
            });
          });
        }
      };
    })
    .factory('formatForSelect2', function() {
      return function(input, key, label, extra) {
        return _.transform(input, function(result, item) {
          var formatted = {id: item[key], text: item[label]};
          if (extra) {
            _.merge(formatted, _.pick(item, extra));
          }
          result.push(formatted);
        }, []);
      };
    })

    .run(function($rootScope, $location) {
      $rootScope.goto = function(path) {
        $location.path(path);
      };
    });


angular.module('crmUtil', CRM.angRequires('crmUtil'));
  angular.module('crmUtil').factory('crmApi', function($q) {
    var crmApi = function(entity, action, params, message) {
      var deferred = $q.defer();
      var p;
      var backend = crmApi.backend || CRM.api3;
      if (params && params.body_html) {
        params.body_html = params.body_html.replace(/([\u2028]|[\u2029])/g, '\n');
      }
      if (_.isObject(entity)) {
        /*jshint -W061 */
        p = backend(eval('('+angular.toJson(entity)+')'), action);
      } else {
        /*jshint -W061 */
        p = backend(entity, action, eval('('+angular.toJson(params)+')'), message);
      }
      p.then(
        function(result) {
          if (result.is_error) {
            deferred.reject(result);
          } else {
            deferred.resolve(result);
          }
        },
        function(error) {
          deferred.reject(error);
        }
      );
      return deferred.promise;
    };
    crmApi.backend = null;
    crmApi.val = function(value) {
      var d = $.Deferred();
      d.resolve(value);
      return d.promise();
    };
    return crmApi;
  });
  angular.module('crmUtil').factory('crmMetadata', function($q, crmApi) {
    function convertOptionsToMap(options) {
      var result = {};
      angular.forEach(options, function(o) {
        result[o.key] = o.value;
      });
      return result;
    }

    var cache = {}; // cache[entityName+'::'+action][fieldName].title
    var deferreds = {}; // deferreds[cacheKey].push($q.defer())
    var crmMetadata = {
      getField: function getField(entity, field) {
        return $q.when(crmMetadata.getFields(entity)).then(function(fields){
          return fields[field];
        });
      },
      getFields: function getFields(entity) {
        var action = '', cacheKey;
        if (_.isArray(entity)) {
          action = entity[1];
          entity = entity[0];
          cacheKey = entity + '::' + action;
        } else {
          cacheKey = entity;
        }

        if (_.isObject(cache[cacheKey])) {
          return cache[cacheKey];
        }

        var needFetch = _.isEmpty(deferreds[cacheKey]);
        deferreds[cacheKey] = deferreds[cacheKey] || [];
        var deferred = $q.defer();
        deferreds[cacheKey].push(deferred);

        if (needFetch) {
          crmApi(entity, 'getfields', {action: action, sequential: 1, options: {get_options: 'all'}})
            .then(
            function(fields) {
              cache[cacheKey] = _.indexBy(fields.values, 'name');
              angular.forEach(cache[cacheKey],function (field){
                if (field.options) {
                  field.optionsMap = convertOptionsToMap(field.options);
                }
              });
              angular.forEach(deferreds[cacheKey], function(dfr) {
                dfr.resolve(cache[cacheKey]);
              });
              delete deferreds[cacheKey];
            },
            function() {
              cache[cacheKey] = {}; // cache nack
              angular.forEach(deferreds[cacheKey], function(dfr) {
                dfr.reject();
              });
              delete deferreds[cacheKey];
            }
          );
        }

        return deferred.promise;
      }
    };

    return crmMetadata;
  });
  angular.module('crmUtil').factory('crmBlocker', function() {
    return function() {
      var blocks = 0;
      var result = function(promise) {
        blocks++;
        return promise.finally(function() {
          blocks--;
        });
      };
      result.check = function() {
        return blocks > 0;
      };
      return result;
    };
  });

  angular.module('crmUtil').factory('crmLegacy', function() {
    return CRM;
  });
  angular.module('crmUtil').factory('crmLog', function(){
    var level = 0;
    var write = console.log;
    function indent() {
      var s = '>';
      for (var i = 0; i < level; i++) s = s + '  ';
      return s;
    }
    var crmLog = {
      log: function(msg, vars) {
        write(indent() + msg, vars);
      },
      wrap: function(label, f) {
        return function(){
          level++;
          crmLog.log(label + ": start", arguments);
          var r;
          try {
            r = f.apply(this, arguments);
          } finally {
            crmLog.log(label + ": end");
            level--;
          }
          return r;
        };
      }
    };
    return crmLog;
  });

  angular.module('crmUtil').factory('crmNavigator', ['$window', function($window) {
    return {
      redirect: function(path) {
        $window.location.href = path;
      }
    };
  }]);
  angular.module('crmUtil').factory('crmQueue', function($q) {
    return function crmQueue(worker) {
      var queue = [];
      function next() {
        var task = queue[0];
        worker.apply(null, task.a).then(
          function onOk(data) {
            queue.shift();
            task.dfr.resolve(data);
            if (queue.length > 0) next();
          },
          function onErr(err) {
            queue.shift();
            task.dfr.reject(err);
            if (queue.length > 0) next();
          }
        );
      }
      function enqueue() {
        var dfr = $q.defer();
        queue.push({a: arguments, dfr: dfr});
        if (queue.length === 1) {
          next();
        }
        return dfr.promise;
      }
      return enqueue;
    };
  });
  angular.module('crmUtil').factory('crmStatus', function($q){
    return function(options, aPromise){
      if (aPromise) {
        return CRM.toAPromise($q, CRM.status(options, CRM.toJqPromise(aPromise)));
      } else {
        return CRM.toAPromise($q, CRM.status(options));
      }
    };
  });
  angular.module('crmUtil').factory('crmWatcher', function(){
    return function() {
      var unwatches = {}, watchFactories = {}, suspends = {};
      this.setup = function(name, newWatchFactory) {
        watchFactories[name] = newWatchFactory;
        unwatches[name] = watchFactories[name]();
        suspends[name] = 0;
        return this;
      };
      this.suspend = function(name, f) {
        suspends[name]++;
        this.teardown(name);
        var r;
        try {
          r = f.apply(this, []);
        } finally {
          if (suspends[name] === 1) {
            unwatches[name] = watchFactories[name]();
            if (!angular.isArray(unwatches[name])) {
              unwatches[name] = [unwatches[name]];
            }
          }
          suspends[name]--;
        }
        return r;
      };

      this.teardown = function(name) {
        if (!unwatches[name]) return;
        _.each(unwatches[name], function(unwatch){
          unwatch();
        });
        delete unwatches[name];
      };

      return this;
    };
  });
  angular.module('crmUtil').factory('crmThrottle', function($q) {
    var pending = [],
      executing = [];
    return function(func) {
      var deferred = $q.defer();

      function checkResult(result, success) {
        _.pull(executing, func);
        if (_.includes(pending, func)) {
          runNext();
        } else if (success) {
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
      }

      function runNext() {
        executing.push(func);
        _.pull(pending, func);
        func().then(function(result) {
          checkResult(result, true);
        }, function(result) {
          checkResult(result, false);
        });
      }

      if (!_.includes(executing, func)) {
        runNext();
      } else if (!_.includes(pending, func)) {
        pending.push(func);
      }
      return deferred.promise;
    };
  });

  angular.module('crmUtil').factory('crmLoadScript', function($q) {
    return function(url) {
      var deferred = $q.defer();

      CRM.loadScript(url).done(function() {
        deferred.resolve(true);
      });

      return deferred.promise;
    };
  });


angular.module('crmbWizard', [
    'crmUi', 'crmUtil'
  ]);
  angular.module('crmbWizard').directive('crmbWizard', function() {
      return {
        restrict: 'EA',
        scope: {
          crmbWizard: '@',
          crmbWizardCtrl: '=',
          crmbWizardNavClass: '@' // string, A list of classes that will be added to the nav items
        },
        templateUrl: '~/crmbWizard/layout.html',
        transclude: true,
        controllerAs: 'crmbWizardCtrl',
        controller: function($scope, $parse) {
          var steps = $scope.steps = []; // array<$scope>
          var crmbWizardCtrl = this;
          var maxVisited = 0;
          var selectedIndex = null;

          var findIndex = function() {
            var found = null;
            angular.forEach(steps, function(step, stepKey) {
              if (step.selected) found = stepKey;
            });
            return found;
          };
          this.$index = function() { return selectedIndex; };
          this.$first = function() { return this.$index() === 0; };
          this.$last = function() { return this.$index() === steps.length -1; };
          this.$maxVisit = function() { return maxVisited; };
          this.$validStep = function() {
            return steps[selectedIndex] && steps[selectedIndex].isStepValid();
          };
          this.iconFor = function(index) {
            if (index < this.$index()) return '√';
            if (index === this.$index()) return '»';
            return ' ';
          };
          this.isSelectable = function(step) {
            var stepIndex;
            for (stepIndex = 0; steps[stepIndex] !== step; stepIndex++) {}

            if (stepIndex <= selectedIndex) return true;
            for (var i = 0; i < stepIndex; i++) {
              if (!steps[i].isStepValid()) return false;
            }
            return true;
          };
          /*** @param Object step the $scope of the step */
          this.isStepDone = function(step) {
            var stepIndex;
            for (stepIndex = 0; steps[stepIndex] !== step; stepIndex++) {}

            if (stepIndex < selectedIndex) {
              return true;
            }
            return false;
          };

          /*** @param Object step the $scope of the step */
          this.select = function(step) {
            angular.forEach(steps, function(otherStep, otherKey) {
              otherStep.selected = (otherStep === step);
              if (otherStep === step && maxVisited < otherKey) maxVisited = otherKey;
            });
            selectedIndex = findIndex();
          };
          /*** @param Object step the $scope of the step */
          this.add = function(step) {
            if (steps.length === 0) {
              step.selected = true;
              selectedIndex = 0;
            }
            steps.push(step);
            steps.sort(function(a,b){
              return a.crmbWizardStep - b.crmbWizardStep;
            });
            selectedIndex = findIndex();
          };
          this.remove = function(step) {
            var key = null;
            angular.forEach(steps, function(otherStep, otherKey) {
              if (otherStep === step) key = otherKey;
            });
            if (key !== null) {
              steps.splice(key, 1);
            }
          };
          this.goto = function(index) {
            if (index < 0) index = 0;
            if (index >= steps.length) index = steps.length-1;
            this.select(steps[index]);
          };
          this.previous = function() { this.goto(this.$index()-1); };
          this.next = function() { this.goto(this.$index()+1); };
          if ($scope.crmbWizard) {
            $parse($scope.crmbWizard).assign($scope.$parent, this);
          }

          $scope.crmbWizardCtrl = this;
        },
        link: function (scope, element, attrs) {
          scope.ts = CRM.ts(null);
        }
      };
    });
  angular.module('crmbWizard').directive('crmbWizardButtonPosition', function() {
    return {
      require: '^crmbWizard',
      restrict: 'EA',
      scope: {
        crmbWizardButtonPosition: '@'
      },
      template: '<span ng-transclude></span>',
      transclude: true,
      link: function (scope, element, attrs, crmbWizardCtrl) {
        var pos = scope.crmbWizardButtonPosition;
        var realButtonsEl = $(element).closest('.crmb-wizard').find('.crmb-wizard-button-' + pos);
        if (pos === 'right') realButtonsEl.append(' ');
        element.appendTo(realButtonsEl);
        if (pos === 'left') realButtonsEl.append(' ');
      }
    };
  });
  angular.module('crmbWizard').directive('crmbWizardStep', function() {
    var nextWeight = 1;
    return {
      require: ['^crmbWizard', 'form'],
      restrict: 'EA',
      scope: {
        crmTitle: '@', // expression, evaluates to a printable string
        crmbWizardStep: '@', // int, a weight which determines the ordering of the steps
        crmbWizardStepClass: '@' // string, A list of classes that will be added to the template
      },
      template: '<div class="crmb-wizard-step {{crmbWizardStepClass}}" ng-show="selected" ng-transclude/></div>',
      transclude: true,
      link: function (scope, element, attrs, ctrls) {
        var crmbWizardCtrl = ctrls[0], form = ctrls[1];
        if (scope.crmbWizardStep) {
          scope.crmbWizardStep = parseInt(scope.crmbWizardStep);
        } else {
          scope.crmbWizardStep = nextWeight++;
        }
        scope.isStepValid = function() {
          return form.$valid;
        };
        crmbWizardCtrl.add(scope);
        scope.$on('$destroy', function(){
          crmbWizardCtrl.remove(scope);
        });
      }
    };
  });

})(angular, CRM.$, CRM._);

(function($, angular){
angular.module('dialogService', []).service('dialogService',
	['$rootScope', '$q', '$compile', '$templateCache', '$http',
	function($rootScope, $q, $compile, $templateCache, $http) {

			var _this = this;
			_this.dialogs = {};

			this.open = function(id, template, model, options) {
				if (!angular.isDefined(id)) {
					throw "dialogService requires id in call to open";
				}

				if (!angular.isDefined(template)) {
					throw "dialogService requires template in call to open";
				}
				if (!angular.isDefined(model)) {
					model = null;
				}
				var dialogOptions = {};
				if (angular.isDefined(options)) {
					angular.extend(dialogOptions, options);
				}
				var dialog = { scope: null, ref: null, deferred: $q.defer() };
				loadTemplate(template).then(
					function(dialogTemplate) {
						dialog.scope = $rootScope.$new();
						dialog.scope.model = model;
						var dialogLinker = $compile(dialogTemplate);
						dialog.ref = $(dialogLinker(dialog.scope));
						var customCloseFn = dialogOptions.close;
						dialogOptions.close = function(event, ui) {
							if (customCloseFn) {
								customCloseFn(event, ui);
							}
							cleanup(id);
						};
						dialog.ref.dialog(dialogOptions);
						dialog.ref.dialog("open");
						_this.dialogs[id] = dialog;

					}, function(error) {
						throw error;
					}
				);
				return dialog.deferred.promise;
			};

			this.close = function(id, result) {
				var dialog = getExistingDialog(id);
				dialog.deferred.resolve(result);
				dialog.ref.dialog("close");
			};

			this.cancel = function(id) {
				var dialog = getExistingDialog(id);
				dialog.deferred.reject();
				dialog.ref.dialog("close");
			};

			this.setButtons = function(id, buttons) {
				var dialog = getExistingDialog(id);
				dialog.ref.dialog("option", 'buttons', buttons);
			};

			function cleanup (id) {
				var dialog = getExistingDialog(id);
				dialog.deferred.reject();
				dialog.scope.$destroy();
				dialog.ref.remove();
				delete _this.dialogs[id];
			};

			function getExistingDialog(id) {
				var dialog = _this.dialogs[id];
				if (!angular.isDefined(dialog)) {
					throw "DialogService does not have a reference to dialog id " + id;
				}
				return dialog;
			};
			function loadTemplate(template) {

				var deferred = $q.defer();
				var html = $templateCache.get(template);

				if (angular.isDefined(html)) {
					html = html.trim();
					deferred.resolve(html);
				} else {
					return $http.get(template, { cache : $templateCache }).then(
						function(response) {
							var html = response.data;
							if(!html || !html.length) {
								return $q.reject("Template " + template + " was not found");
							}
							html = html.trim();
							$templateCache.put(template, html);
							return html;
						}, function() {
							return $q.reject("Template " + template + " was not found");
			        	}
			        );
				}
			    return deferred.promise;
			}
		}
]);
})(jQuery, angular);

(function (angular, $, _) {
  angular.module('extendedreport', [
    'crmUi', 'crmUtil', 'ngRoute', 'ui.sortable'
  ]);

angular.module('extendedreport').config(function ($routeProvider) {
      $routeProvider.when('/exreport/report/:id', {
        controller: 'ExtendedreportReportCntrl',
        templateUrl: '~/extendedreport/ReportCntrl.html',
        resolve: {
          reportMetadata: function (crmApi, $route) {
            return crmApi('ReportTemplate', 'getmetadata', {
              instance_id: $route.current.params.id
            });
          },
          reportInstance: function (crmApi, $route) {
            return crmApi('ReportTemplate', 'getinstance', {
              id: $route.current.params.id
            });
          }
        }
      });
    }
  );
  angular.module('extendedreport').controller('ExtendedreportReportCntrl', function ($scope, crmApi, crmStatus, crmUiHelp, reportMetadata, reportInstance, crmLegacy) {
    var ts = $scope.ts = CRM.ts('extendedreport');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/extendedreport/ReportCntrl'});// See: templates/CRM/extendedreport/ReportCntrl.hlp
    var reportID = reportInstance.id;
    var reportFields = reportInstance.values[reportID]['form_values']['fields'];
    var reportOrderBys = reportInstance.values[reportID]['form_values']['order_bys'];
    var form_values = reportInstance.values[reportID]['form_values'];
    $scope.form_values = form_values;

    $scope.classicUrl = crmLegacy.url('civicrm/report/instance/' + reportInstance.id, 'reset=1output=html');
    $scope.reportMetadata = reportMetadata.values;

    function getLabels(fields) {
      var labels = [];
      _.each(fields, function (field, key) {
        var label = {
          'title': field.title,
          'name': key
        };
        labels.push(label);
      });
      return labels;
    }

    function getSelectedFields(formValues, fields) {
      if (formValues.hasOwnProperty('extended_fields')) {
        return formValues['extended_fields'];
      }
      var selectedFields = [];
      _.each(formValues['fields'], function (field, key) {
        selectedFields.push({
          'title': fields[key]['title'],
          'name': key
        });
      });
      return selectedFields;
    }

    function getSelectedOrderBys(formValues, fields) {
      if (formValues.hasOwnProperty('extended_order_bys')) {
        return formValues['extended_order_bys'];
      }
      var selectedFields = [];
      _.each(formValues['order_bys'], function (field) {
        var columnName = field['column'];
        if (columnName !== '-') {
          selectedFields.push({
            'column': columnName
          });
        }
      });
      return selectedFields;
    }

    function getUnselectedFields(fieldMetadata, selectedFields) {
      var ret = [];
      _.each(fieldMetadata, function (field, key) {
        if (!selectedFields.hasOwnProperty(key)) {
          ret.push({
            'title': field.title,
            'name': key
          });
        }
      });
      return ret;
    }

    function getUnselectedSorting(fieldMetadata, selectedFields) {

      var ret = [];
      _.each(fieldMetadata, function (field, key) {
        if (!selectedFields.hasOwnProperty(key)) {
          ret.push({
            'title': field.title,
            'name': key
          });
        }
      });
      return ret;
    }

    $scope.reportFields = getSelectedFields(form_values, reportMetadata.values['metadata']);
    $scope.reportOrderByFields = getSelectedOrderBys(form_values, reportMetadata.values['metadata']);
    $scope.fieldList = getUnselectedFields(reportMetadata.values['fields'], reportFields);
    $scope.orderBysList = getUnselectedSorting(reportMetadata.values['order_bys'], reportOrderBys);

    $scope.sortableFieldOptions = {
      placeholder: "fieldItem",
      connectWith: ".fields-container",
      cancel: "input,textarea,button,select,option,a,.crm-editable-enabled,[contenteditable]",
      containment: "#extendedReportFieldsConfig"
    };

    $scope.sortableOrderByOptions = {
      placeholder: "fieldItem",
      connectWith: ".order-bys-container",
      cancel: "input,textarea,button,select,option,a,.crm-editable-enabled,[contenteditable]",
      containment: "#extendedReportSortingConfig"
    };

    $scope.selectField = function (field) {
      if (!field.hasOwnProperty('field_on_null')) {
        field['field_on_null'] = [];
      }
      if (!field.hasOwnProperty('field_on_null_usage')) {
        field['field_on_null_usage'] = 'on_null';
      }
      $scope.selectedField = field;
      $scope.selectedAlternateFields = field['field_on_null'];
    };

    $scope.selectOrderBy = function (field) {
      if (!field.hasOwnProperty('field_on_null')) {
        field['field_on_null'] = [];
      }
      if (!field.hasOwnProperty('field_on_null_usage')) {
        field['field_on_null_usage'] = 'on_null';
      }
      if (!field.hasOwnProperty('order')) {
        field['order'] = 'ASC';
      }
      $scope.selectedOrderBy = field;
      $scope.selectedAlternateOrderBys = field['field_on_null'];
    };

    $scope.selectedTab = 'fields';

    $scope.selectTab = function (tab) {
      $scope.selectedTab = tab;
    };

    $scope.save = function save() {
      form_values['extended_fields'] = $scope.reportFields;
      form_values['extended_order_bys'] = $scope.reportOrderByFields;
      return crmStatus(
        {start: ts('Saving...'), success: ts('Saved')},
        crmApi('ReportInstance', 'create', {
          id: reportID,
          form_values: form_values
        })
      );
    };
  });
  angular.module('extendedreport').directive("extendedreportEditable", function () {
    return {
      restrict: "A",
      require: "ngModel",
      link: function (scope, element, attrs, ngModel) {
        var ts = CRM.ts('extendedreport');

        function read() {
          var htmlVal = element.html();
          if (!htmlVal) {
            htmlVal = ts('Untitled');
            element.html(htmlVal);
          }
          ngModel.$setViewValue(htmlVal);
        }

        ngModel.$render = function () {
          element.html(ngModel.$viewValue || ' ');
        };
        element.on('keydown', function (e) {
          if (e.which === 13) {
            e.preventDefault();
            element.blur();
          }
          if (e.which === 27) {
            element.html(ngModel.$viewValue || ' ');
            element.blur();
          }
        });

        element.on("blur change", function () {
          scope.$apply(read);
        });

        element.attr('contenteditable', 'true').addClass('crm-editable-enabled');
      }
    };
  });

})(angular, CRM.$, CRM._);


/*!
 * jsonformatter
 * 
 * Version: 0.6.0 - 2016-08-27T12:58:03.306Z
 * License: Apache-2.0
 */
"use strict";angular.module("jsonFormatter",["RecursionHelper"]).provider("JSONFormatterConfig",function(){var n=!1,e=100,t=5;return{get hoverPreviewEnabled(){return n},set hoverPreviewEnabled(e){n=!!e},get hoverPreviewArrayCount(){return e},set hoverPreviewArrayCount(n){e=parseInt(n,10)},get hoverPreviewFieldCount(){return t},set hoverPreviewFieldCount(n){t=parseInt(n,10)},$get:function(){return{hoverPreviewEnabled:n,hoverPreviewArrayCount:e,hoverPreviewFieldCount:t}}}}).directive("jsonFormatter",["RecursionHelper","JSONFormatterConfig",function(n,e){function t(n){return n.replace('"','"')}function r(n){if(void 0===n)return"";if(null===n)return"Object";if("object"==typeof n&&!n.constructor)return"Object";if(void 0!==n.__proto__&&void 0!==n.__proto__.constructor&&void 0!==n.__proto__.constructor.name)return n.__proto__.constructor.name;var e=/function (.{1,})\(/,t=e.exec(n.constructor.toString());return t&&t.length>1?t[1]:""}function o(n){return null===n?"null":typeof n}function s(n,e){var r=o(n);return"null"===r||"undefined"===r?r:("string"===r&&(e='"'+t(e)+'"'),"function"===r?n.toString().replace(/[\r\n]/g,"").replace(/\{.*\}/,"")+"{…}":e)}function i(n){var e="";return angular.isObject(n)?(e=r(n),angular.isArray(n)&&(e+="["+n.length+"]")):e=s(n,n),e}function a(n){n.isArray=function(){return angular.isArray(n.json)},n.isObject=function(){return angular.isObject(n.json)},n.getKeys=function(){if(n.isObject())return Object.keys(n.json).map(function(n){return""===n?'""':n})},n.type=o(n.json),n.hasKey="undefined"!=typeof n.key,n.getConstructorName=function(){return r(n.json)},"string"===n.type&&("Invalid Date"!==new Date(n.json).toString()&&(n.isDate=!0),0===n.json.indexOf("http")&&(n.isUrl=!0)),n.isEmptyObject=function(){return n.getKeys()&&!n.getKeys().length&&n.isOpen&&!n.isArray()},n.isOpen=!!n.open,n.toggleOpen=function(){n.isOpen=!n.isOpen},n.childrenOpen=function(){return n.open>1?n.open-1:0},n.openLink=function(e){e&&(window.location.href=n.json)},n.parseValue=function(e){return s(n.json,e)},n.showThumbnail=function(){return!!e.hoverPreviewEnabled&&n.isObject()&&!n.isOpen},n.getThumbnail=function(){if(n.isArray())return n.json.length>e.hoverPreviewArrayCount?"Array["+n.json.length+"]":"["+n.json.map(i).join(", ")+"]";var t=n.getKeys(),r=t.slice(0,e.hoverPreviewFieldCount),o=r.map(function(e){return e+":"+i(n.json[e])}),s=t.length>=5?"…":"";return"{"+o.join(", ")+s+"}"}}return{templateUrl:"json-formatter.html",restrict:"E",replace:!0,scope:{json:"=",key:"=",open:"="},compile:function(e){return n.compile(e,a)}}}]),"object"==typeof module&&(module.exports="jsonFormatter"),angular.module("RecursionHelper",[]).factory("RecursionHelper",["$compile",function(n){return{compile:function(e,t){angular.isFunction(t)&&(t={post:t});var r,o=e.contents().remove();return{pre:t&&t.pre?t.pre:null,post:function(e,s){r||(r=n(o)),r(e,function(n){s.append(n)}),t&&t.post&&t.post.apply(null,arguments)}}}}}]),angular.module("jsonFormatter").run(["$templateCache",function(n){n.put("json-formatter.html",'<div ng-init="isOpen = open && open > 0" class="json-formatter-row"><a ng-click="toggleOpen()"><span class="toggler {{isOpen ? \'open\' : \'\'}}" ng-if="isObject()"></span> <span class="key" ng-if="hasKey"><span class="key-text">{{key}}</span><span class="colon">:</span></span> <span class="value"><span ng-if="isObject()"><span class="constructor-name">{{getConstructorName(json)}}</span> <span ng-if="isArray()"><span class="bracket">[</span><span class="number">{{json.length}}</span><span class="bracket">]</span></span></span> <span ng-if="!isObject()" ng-click="openLink(isUrl)" class="{{type}}" ng-class="{date: isDate, url: isUrl}">{{parseValue(json)}}</span></span> <span ng-if="showThumbnail()" class="thumbnail-text">{{getThumbnail()}}</span></a><div class="children" ng-if="getKeys().length && isOpen"><json-formatter ng-repeat="key in getKeys() track by $index" json="json[key]" key="key" open="childrenOpen()"></json-formatter></div><div class="children empty object" ng-if="isEmptyObject()"></div><div class="children empty array" ng-if="getKeys() && !getKeys().length && isOpen && isArray()"></div></div>')}]);
/*
 AngularJS v1.8.0
 (c) 2010-2020 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(I,b){'use strict';function z(b,h){var d=[],c=b.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)(\*\?|[?*])?/g,function(b,c,h,k){b="?"===k||"*?"===k;k="*"===k||"*?"===k;d.push({name:h,optional:b});c=c||"";return(b?"(?:"+c:c+"(?:")+(k?"(.+?)":"([^/]+)")+(b?"?)?":")")}).replace(/([/$*])/g,"\\$1");h.ignoreTrailingSlashes&&(c=c.replace(/\/+$/,"")+"/*");return{keys:d,regexp:new RegExp("^"+c+"(?:[?#]|$)",h.caseInsensitiveMatch?"i":"")}}function A(b){p&&b.get("$route")}function v(u,h,d){return{restrict:"ECA",
terminal:!0,priority:400,transclude:"element",link:function(c,f,g,l,k){function q(){r&&(d.cancel(r),r=null);m&&(m.$destroy(),m=null);s&&(r=d.leave(s),r.done(function(b){!1!==b&&(r=null)}),s=null)}function C(){var g=u.current&&u.current.locals;if(b.isDefined(g&&g.$template)){var g=c.$new(),l=u.current;s=k(g,function(g){d.enter(g,null,s||f).done(function(d){!1===d||!b.isDefined(w)||w&&!c.$eval(w)||h()});q()});m=l.scope=g;m.$emit("$viewContentLoaded");m.$eval(p)}else q()}var m,s,r,w=g.autoscroll,p=g.onload||
"";c.$on("$routeChangeSuccess",C);C()}}}function x(b,h,d){return{restrict:"ECA",priority:-400,link:function(c,f){var g=d.current,l=g.locals;f.html(l.$template);var k=b(f.contents());if(g.controller){l.$scope=c;var q=h(g.controller,l);g.controllerAs&&(c[g.controllerAs]=q);f.data("$ngControllerController",q);f.children().data("$ngControllerController",q)}c[g.resolveAs||"$resolve"]=l;k(c)}}}var D,E,F,G,y=b.module("ngRoute",[]).info({angularVersion:"1.8.0"}).provider("$route",function(){function u(d,
c){return b.extend(Object.create(d),c)}D=b.isArray;E=b.isObject;F=b.isDefined;G=b.noop;var h={};this.when=function(d,c){var f;f=void 0;if(D(c)){f=f||[];for(var g=0,l=c.length;g<l;g++)f[g]=c[g]}else if(E(c))for(g in f=f||{},c)if("$"!==g.charAt(0)||"$"!==g.charAt(1))f[g]=c[g];f=f||c;b.isUndefined(f.reloadOnUrl)&&(f.reloadOnUrl=!0);b.isUndefined(f.reloadOnSearch)&&(f.reloadOnSearch=!0);b.isUndefined(f.caseInsensitiveMatch)&&(f.caseInsensitiveMatch=this.caseInsensitiveMatch);h[d]=b.extend(f,{originalPath:d},
d&&z(d,f));d&&(g="/"===d[d.length-1]?d.substr(0,d.length-1):d+"/",h[g]=b.extend({originalPath:d,redirectTo:d},z(g,f)));return this};this.caseInsensitiveMatch=!1;this.otherwise=function(b){"string"===typeof b&&(b={redirectTo:b});this.when(null,b);return this};p=!0;this.eagerInstantiationEnabled=function(b){return F(b)?(p=b,this):p};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce","$browser",function(d,c,f,g,l,k,q,p){function m(a){var e=t.current;n=A();(x=
!B&&n&&e&&n.$$route===e.$$route&&(!n.reloadOnUrl||!n.reloadOnSearch&&b.equals(n.pathParams,e.pathParams)))||!e&&!n||d.$broadcast("$routeChangeStart",n,e).defaultPrevented&&a&&a.preventDefault()}function s(){var a=t.current,e=n;if(x)a.params=e.params,b.copy(a.params,f),d.$broadcast("$routeUpdate",a);else if(e||a){B=!1;t.current=e;var c=g.resolve(e);p.$$incOutstandingRequestCount("$route");c.then(r).then(w).then(function(g){return g&&c.then(y).then(function(c){e===t.current&&(e&&(e.locals=c,b.copy(e.params,
f)),d.$broadcast("$routeChangeSuccess",e,a))})}).catch(function(b){e===t.current&&d.$broadcast("$routeChangeError",e,a,b)}).finally(function(){p.$$completeOutstandingRequest(G,"$route")})}}function r(a){var e={route:a,hasRedirection:!1};if(a)if(a.redirectTo)if(b.isString(a.redirectTo))e.path=v(a.redirectTo,a.params),e.search=a.params,e.hasRedirection=!0;else{var d=c.path(),f=c.search();a=a.redirectTo(a.pathParams,d,f);b.isDefined(a)&&(e.url=a,e.hasRedirection=!0)}else if(a.resolveRedirectTo)return g.resolve(l.invoke(a.resolveRedirectTo)).then(function(a){b.isDefined(a)&&
(e.url=a,e.hasRedirection=!0);return e});return e}function w(a){var b=!0;if(a.route!==t.current)b=!1;else if(a.hasRedirection){var g=c.url(),d=a.url;d?c.url(d).replace():d=c.path(a.path).search(a.search).replace().url();d!==g&&(b=!1)}return b}function y(a){if(a){var e=b.extend({},a.resolve);b.forEach(e,function(a,c){e[c]=b.isString(a)?l.get(a):l.invoke(a,null,null,c)});a=z(a);b.isDefined(a)&&(e.$template=a);return g.all(e)}}function z(a){var e,c;b.isDefined(e=a.template)?b.isFunction(e)&&(e=e(a.params)):
b.isDefined(c=a.templateUrl)&&(b.isFunction(c)&&(c=c(a.params)),b.isDefined(c)&&(a.loadedTemplateUrl=q.valueOf(c),e=k(c)));return e}function A(){var a,e;b.forEach(h,function(d,g){var f;if(f=!e){var h=c.path();f=d.keys;var l={};if(d.regexp)if(h=d.regexp.exec(h)){for(var k=1,p=h.length;k<p;++k){var m=f[k-1],n=h[k];m&&n&&(l[m.name]=n)}f=l}else f=null;else f=null;f=a=f}f&&(e=u(d,{params:b.extend({},c.search(),a),pathParams:a}),e.$$route=d)});return e||h[null]&&u(h[null],{params:{},pathParams:{}})}function v(a,
c){var d=[];b.forEach((a||"").split(":"),function(a,b){if(0===b)d.push(a);else{var f=a.match(/(\w+)(?:[?*])?(.*)/),g=f[1];d.push(c[g]);d.push(f[2]||"");delete c[g]}});return d.join("")}var B=!1,n,x,t={routes:h,reload:function(){B=!0;var a={defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=!0;B=!1}};d.$evalAsync(function(){m(a);a.defaultPrevented||s()})},updateParams:function(a){if(this.current&&this.current.$$route)a=b.extend({},this.current.params,a),c.path(v(this.current.$$route.originalPath,
a)),c.search(a);else throw H("norout");}};d.$on("$locationChangeStart",m);d.$on("$locationChangeSuccess",s);return t}]}).run(A),H=b.$$minErr("ngRoute"),p;A.$inject=["$injector"];y.provider("$routeParams",function(){this.$get=function(){return{}}});y.directive("ngView",v);y.directive("ngView",x);v.$inject=["$route","$anchorScroll","$animate"];x.$inject=["$compile","$controller","$route"]})(window,window.angular);

/*
 AngularJS v1.8.0
 (c) 2010-2020 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(s,c){'use strict';function P(c){var h=[];C(h,E).chars(c);return h.join("")}var D=c.$$minErr("$sanitize"),F,h,G,H,I,q,E,J,K,C;c.module("ngSanitize",[]).provider("$sanitize",function(){function f(a,e){return B(a.split(","),e)}function B(a,e){var d={},b;for(b=0;b<a.length;b++)d[e?q(a[b]):a[b]]=!0;return d}function t(a,e){e&&e.length&&h(a,B(e))}function Q(a){for(var e={},d=0,b=a.length;d<b;d++){var k=a[d];e[k.name]=k.value}return e}function L(a){return a.replace(/&/g,"&amp;").replace(z,function(a){var d=
a.charCodeAt(0);a=a.charCodeAt(1);return"&#"+(1024*(d-55296)+(a-56320)+65536)+";"}).replace(u,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function A(a){for(;a;){if(a.nodeType===s.Node.ELEMENT_NODE)for(var e=a.attributes,d=0,b=e.length;d<b;d++){var k=e[d],g=k.name.toLowerCase();if("xmlns:ns1"===g||0===g.lastIndexOf("ns1:",0))a.removeAttributeNode(k),d--,b--}(e=a.firstChild)&&A(e);a=v("nextSibling",a)}}function v(a,e){var d=e[a];if(d&&J.call(e,d))throw D("elclob",
e.outerHTML||e.outerText);return d}var y=!1,g=!1;this.$get=["$$sanitizeUri",function(a){y=!0;g&&h(m,l);return function(e){var d=[];K(e,C(d,function(b,d){return!/^unsafe:/.test(a(b,d))}));return d.join("")}}];this.enableSvg=function(a){return I(a)?(g=a,this):g};this.addValidElements=function(a){y||(H(a)&&(a={htmlElements:a}),t(l,a.svgElements),t(r,a.htmlVoidElements),t(m,a.htmlVoidElements),t(m,a.htmlElements));return this};this.addValidAttrs=function(a){y||h(M,B(a,!0));return this};F=c.bind;h=c.extend;
G=c.forEach;H=c.isArray;I=c.isDefined;q=c.$$lowercase;E=c.noop;K=function(a,e){null===a||void 0===a?a="":"string"!==typeof a&&(a=""+a);var d=N(a);if(!d)return"";var b=5;do{if(0===b)throw D("uinput");b--;a=d.innerHTML;d=N(a)}while(a!==d.innerHTML);for(b=d.firstChild;b;){switch(b.nodeType){case 1:e.start(b.nodeName.toLowerCase(),Q(b.attributes));break;case 3:e.chars(b.textContent)}var k;if(!(k=b.firstChild)&&(1===b.nodeType&&e.end(b.nodeName.toLowerCase()),k=v("nextSibling",b),!k))for(;null==k;){b=
v("parentNode",b);if(b===d)break;k=v("nextSibling",b);1===b.nodeType&&e.end(b.nodeName.toLowerCase())}b=k}for(;b=d.firstChild;)d.removeChild(b)};C=function(a,e){var d=!1,b=F(a,a.push);return{start:function(a,g){a=q(a);!d&&w[a]&&(d=a);d||!0!==m[a]||(b("<"),b(a),G(g,function(d,g){var c=q(g),f="img"===a&&"src"===c||"background"===c;!0!==M[c]||!0===O[c]&&!e(d,f)||(b(" "),b(g),b('="'),b(L(d)),b('"'))}),b(">"))},end:function(a){a=q(a);d||!0!==m[a]||!0===r[a]||(b("</"),b(a),b(">"));a==d&&(d=!1)},chars:function(a){d||
b(L(a))}}};J=s.Node.prototype.contains||function(a){return!!(this.compareDocumentPosition(a)&16)};var z=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,u=/([^#-~ |!])/g,r=f("area,br,col,hr,img,wbr"),x=f("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),p=f("rp,rt"),n=h({},p,x),x=h({},x,f("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),p=h({},p,f("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
l=f("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),w=f("script,style"),m=h({},r,x,p,n),O=f("background,cite,href,longdesc,src,xlink:href,xml:base"),n=f("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),
p=f("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",
!0),M=h({},O,p,n),N=function(a,e){function d(b){b="<remove></remove>"+b;try{var d=(new a.DOMParser).parseFromString(b,"text/html").body;d.firstChild.remove();return d}catch(e){}}function b(a){c.innerHTML=a;e.documentMode&&A(c);return c}var g;if(e&&e.implementation)g=e.implementation.createHTMLDocument("inert");else throw D("noinert");var c=(g.documentElement||g.getDocumentElement()).querySelector("body");c.innerHTML='<svg><g onload="this.parentNode.remove()"></g></svg>';return c.querySelector("svg")?
(c.innerHTML='<svg><p><style><img src="</style><img src=x onerror=alert(1)//">',c.querySelector("svg img")?d:b):function(b){b="<remove></remove>"+b;try{b=encodeURI(b)}catch(d){return}var e=new a.XMLHttpRequest;e.responseType="document";e.open("GET","data:text/html;charset=utf-8,"+b,!1);e.send(null);b=e.response.body;b.firstChild.remove();return b}}(s,s.document)}).info({angularVersion:"1.8.0"});c.module("ngSanitize").filter("linky",["$sanitize",function(f){var h=/((s?ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
t=/^mailto:/i,q=c.$$minErr("linky"),s=c.isDefined,A=c.isFunction,v=c.isObject,y=c.isString;return function(c,z,u){function r(c){c&&l.push(P(c))}function x(c,g){var f,a=p(c);l.push("<a ");for(f in a)l.push(f+'="'+a[f]+'" ');!s(z)||"target"in a||l.push('target="',z,'" ');l.push('href="',c.replace(/"/g,"&quot;"),'">');r(g);l.push("</a>")}if(null==c||""===c)return c;if(!y(c))throw q("notstring",c);for(var p=A(u)?u:v(u)?function(){return u}:function(){return{}},n=c,l=[],w,m;c=n.match(h);)w=c[0],c[2]||
c[4]||(w=(c[3]?"http://":"mailto:")+w),m=c.index,r(n.substr(0,m)),x(w,c[0].replace(t,"")),n=n.substring(m+c[0].length);r(n);return f(l.join(""))}}])})(window,window.angular);

/**
 * angular-ui-sortable - This directive allows you to jQueryUI Sortable.
 * @version v0.19.0 - 2018-01-14
 * @link http://angular-ui.github.com
 * @license MIT
 */

!function(a,b,c){"use strict";b.module("ui.sortable",[]).value("uiSortableConfig",{items:"> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]"}).directive("uiSortable",["uiSortableConfig","$timeout","$log",function(a,d,e){return{require:"?ngModel",scope:{ngModel:"=",uiSortable:"=",create:"&uiSortableCreate",start:"&uiSortableStart",activate:"&uiSortableActivate",beforeStop:"&uiSortableBeforeStop",update:"&uiSortableUpdate",remove:"&uiSortableRemove",receive:"&uiSortableReceive",deactivate:"&uiSortableDeactivate",stop:"&uiSortableStop"},link:function(f,g,h,i){function j(a,b){var c="function"==typeof a,d="function"==typeof b;return c&&d?function(){a.apply(this,arguments),b.apply(this,arguments)}:d?b:a}function k(a){var b=a.data("ui-sortable");return b&&"object"==typeof b&&"ui-sortable"===b.widgetFullName?b:null}function l(a){a.children().each(function(){var a=b.element(this);a.width(a.width())})}function m(a,b){return b}function n(b,c){return E[b]?("stop"===b&&(c=j(c,function(){f.$apply()}),c=j(c,v)),c=j(E[b],c)):F[b]&&(c=F[b](c)),c||"items"!==b&&"ui-model-items"!==b||(c=a.items),c}function o(a,d,e){function f(a,b){b in C||(C[b]=null)}b.forEach(E,f);var g=null;if(d){var h;b.forEach(d,function(d,e){if(!(a&&e in a)){if(e in D)return void("ui-floating"===e?C[e]="auto":C[e]=n(e,c));h||(h=b.element.ui.sortable().options);var f=h[e];f=n(e,f),g||(g={}),g[e]=f,C[e]=f}})}return a=b.extend({},a),b.forEach(a,function(b,c){if(c in D){if("ui-floating"!==c||b!==!1&&b!==!0||!e||(e.floating=b),"ui-preserve-size"===c&&(b===!1||b===!0)){var d=C.helper;a.helper=function(a,b){return C["ui-preserve-size"]===!0&&l(b),(d||m).apply(this,arguments)}}C[c]=n(c,b)}}),b.forEach(a,function(a,b){b in D||(a=n(b,a),g||(g={}),g[b]=a,C[b]=a)}),g}function p(a){var c=a.sortable("option","placeholder");if(c&&c.element&&"function"==typeof c.element){var d=c.element();return d=b.element(d)}return null}function q(a,b){var c=C["ui-model-items"].replace(/[^,]*>/g,""),d=a.find('[class="'+b.attr("class")+'"]:not('+c+")");return d}function r(a,b){var c=a.sortable("option","helper");return"clone"===c||"function"==typeof c&&b.item.sortable.isCustomHelperUsed()}function s(a,b){var c=null;return r(a,b)&&"parent"===a.sortable("option","appendTo")&&(c=B),c}function t(a){return/left|right/.test(a.css("float"))||/inline|table-cell/.test(a.css("display"))}function u(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d.element[0]===b[0])return d}}function v(a,b){b.item.sortable._destroy()}function w(a){return a.parent().find(C["ui-model-items"]).index(a)}function x(){f.$watchCollection("ngModel",function(){d(function(){k(g)&&g.sortable("refresh")},0,!1)}),E.start=function(a,d){if("auto"===C["ui-floating"]){var e=d.item.siblings(),f=k(b.element(a.target));f.floating=t(e)}var h=w(d.item);d.item.sortable={model:i.$modelValue[h],index:h,source:g,sourceList:d.item.parent(),sourceModel:i.$modelValue,cancel:function(){d.item.sortable._isCanceled=!0},isCanceled:function(){return d.item.sortable._isCanceled},isCustomHelperUsed:function(){return!!d.item.sortable._isCustomHelperUsed},_isCanceled:!1,_isCustomHelperUsed:d.item.sortable._isCustomHelperUsed,_destroy:function(){b.forEach(d.item.sortable,function(a,b){d.item.sortable[b]=c})},_connectedSortables:[],_getElementContext:function(a){return u(this._connectedSortables,a)}}},E.activate=function(a,b){var c=b.item.sortable.source===g,d=c?b.item.sortable.sourceList:g,e={element:g,scope:f,isSourceContext:c,savedNodesOrigin:d};b.item.sortable._connectedSortables.push(e),A=d.contents(),B=b.helper;var h=p(g);if(h&&h.length){var i=q(g,h);A=A.not(i)}},E.update=function(a,b){if(!b.item.sortable.received){b.item.sortable.dropindex=w(b.item);var c=b.item.parent().closest("[ui-sortable], [data-ui-sortable], [x-ui-sortable]");b.item.sortable.droptarget=c,b.item.sortable.droptargetList=b.item.parent();var d=b.item.sortable._getElementContext(c);b.item.sortable.droptargetModel=d.scope.ngModel,g.sortable("cancel")}var e=!b.item.sortable.received&&s(g,b,A);e&&e.length&&(A=A.not(e));var h=b.item.sortable._getElementContext(g);A.appendTo(h.savedNodesOrigin),b.item.sortable.received&&(A=null),b.item.sortable.received&&!b.item.sortable.isCanceled()&&(f.$apply(function(){i.$modelValue.splice(b.item.sortable.dropindex,0,b.item.sortable.moved)}),f.$emit("ui-sortable:moved",b))},E.stop=function(a,c){var d="dropindex"in c.item.sortable&&!c.item.sortable.isCanceled();if(d&&!c.item.sortable.received)f.$apply(function(){i.$modelValue.splice(c.item.sortable.dropindex,0,i.$modelValue.splice(c.item.sortable.index,1)[0])}),f.$emit("ui-sortable:moved",c);else if(!d&&!b.equals(g.contents().toArray(),A.toArray())){var e=s(g,c,A);e&&e.length&&(A=A.not(e));var h=c.item.sortable._getElementContext(g);A.appendTo(h.savedNodesOrigin)}A=null,B=null},E.receive=function(a,b){b.item.sortable.received=!0},E.remove=function(a,b){"dropindex"in b.item.sortable||(g.sortable("cancel"),b.item.sortable.cancel()),b.item.sortable.isCanceled()||f.$apply(function(){b.item.sortable.moved=i.$modelValue.splice(b.item.sortable.index,1)[0]})},b.forEach(E,function(a,b){E[b]=j(E[b],function(){var a,c=f[b];"function"==typeof c&&("uiSortable"+b.substring(0,1).toUpperCase()+b.substring(1)).length&&"function"==typeof(a=c())&&a.apply(this,arguments)})}),F.helper=function(a){return a&&"function"==typeof a?function(d,e){var f=e.sortable,h=w(e);e.sortable={model:i.$modelValue[h],index:h,source:g,sourceList:e.parent(),sourceModel:i.$modelValue,_restore:function(){b.forEach(e.sortable,function(a,b){e.sortable[b]=c}),e.sortable=f}};var j=a.apply(this,arguments);return e.sortable._restore(),e.sortable._isCustomHelperUsed=e!==j,j}:a},f.$watchCollection("uiSortable",function(a,b){var c=k(g);if(c){var d=o(a,b,c);d&&g.sortable("option",d)}},!0),o(C)}function y(){i?x():e.info("ui.sortable: ngModel not provided!",g),g.sortable(C)}function z(){return f.uiSortable&&f.uiSortable.disabled?!1:(y(),z.cancelWatcher(),z.cancelWatcher=b.noop,!0)}var A,B,C={},D={"ui-floating":c,"ui-model-items":a.items,"ui-preserve-size":c},E={create:null,start:null,activate:null,beforeStop:null,update:null,remove:null,receive:null,deactivate:null,stop:null},F={helper:null};return b.extend(C,D,a,f.uiSortable),b.element.fn&&b.element.fn.jquery?(z.cancelWatcher=b.noop,void(z()||(z.cancelWatcher=f.$watch("uiSortable.disabled",z)))):void e.error("ui.sortable: jQuery should be included before AngularJS!")}}}])}(window,window.angular);

"use strict";angular.module("unsavedChanges",["lazyModel"]).provider("unsavedWarningsConfig",function(){var f=this;var e=false;var b=true;var d=["$locationChangeStart","$stateChangeStart"];var c="You will lose unsaved changes if you leave this page";var a="You will lose unsaved changes if you reload this page";Object.defineProperty(f,"navigateMessage",{get:function(){return c},set:function(g){c=g}});Object.defineProperty(f,"reloadMessage",{get:function(){return a},set:function(g){a=g}});Object.defineProperty(f,"useTranslateService",{get:function(){return b},set:function(g){b=!!(g)}});Object.defineProperty(f,"routeEvent",{get:function(){return d},set:function(g){if(typeof g==="string"){g=[g]}d=g}});Object.defineProperty(f,"logEnabled",{get:function(){return e},set:function(g){e=!!(g)}});this.$get=["$injector",function(h){function i(j){if(h.has("$translate")&&b){return h.get("$translate")(j)}else{return false}}var g={log:function(){if(console.log&&e&&arguments.length){var j=[].slice.call(arguments);if(typeof console.log==="object"){log.apply.call(console.log,console,j)}else{console.log.apply(console,j)}}}};Object.defineProperty(g,"useTranslateService",{get:function(){return b}});Object.defineProperty(g,"reloadMessage",{get:function(){return i(a)||a}});Object.defineProperty(g,"navigateMessage",{get:function(){return i(c)||c}});Object.defineProperty(g,"routeEvent",{get:function(){return d}});Object.defineProperty(g,"logEnabled",{get:function(){return e}});return g}]}).service("unsavedWarningSharedService",["$rootScope","unsavedWarningsConfig","$injector",function(j,c,k){var i=this;var a=[];var g=true;var d=[angular.noop];this.allForms=function(){return a};var f={navigate:c.navigateMessage,reload:c.reloadMessage};function h(){g=true;angular.forEach(a,function(m,l){c.log("Form : "+m.$name+" dirty : "+m.$dirty);if(m.$dirty){g=false}});return g}this.init=function(l){if(a.length===0){e()}c.log("Registering form",l);a.push(l)};this.removeForm=function(m){var l=a.indexOf(m);if(l===-1){return}a.splice(l,1);c.log("Removing form from watch list",m);if(a.length===0){b()}};function b(){c.log("No more forms, tearing down");angular.forEach(d,function(l){l()});window.onbeforeunload=null}this.confirmExit=function(){if(!h()){return f.reload}b()};function e(){c.log("Setting up");window.onbeforeunload=i.confirmExit;var l=c.routeEvent;angular.forEach(l,function(m){var n=j.$on(m,function(p,o,q){c.log("user is moving with "+m);if(!h()){c.log("a form is dirty");if(!confirm(f.navigate)){c.log("user wants to cancel leaving");p.preventDefault()}else{c.log("user doesn't care about loosing stuff")}}else{c.log("all forms are clean")}});d.push(n)})}}]).directive("unsavedWarningClear",["unsavedWarningSharedService",function(a){return{scope:true,require:"^form",priority:3000,link:function(d,c,b,e){c.bind("click",function(f){e.$setPristine()})}}}]).directive("unsavedWarningForm",["unsavedWarningSharedService",function(a){return{require:"form",link:function(d,c,b,e){a.init(e);c.bind("submit",function(f){if(e.$valid){e.$setPristine()}});d.$on("$destroy",function(){a.removeForm(e)})}}}]);angular.module("lazyModel",[]).directive("lazyModel",["$parse","$compile",function(b,a){return{restrict:"A",priority:500,terminal:true,require:"^form",scope:true,compile:function c(g,e){var f=b(e.lazyModel);var h=f.assign;g.attr("ng-model","buffer");g.removeAttr("lazy-model");return{pre:function(i,j){i.buffer=f(i.$parent);a(j)(i)},post:function d(j,l,i,m){var k=l.parent();while(k[0].tagName!=="FORM"){k=k.parent()}k.bind("submit",function(){if(m.$valid){j.$apply(function(){h(j.$parent,j.buffer)})}});k.bind("reset",function(n){n.preventDefault();j.$apply(function(){j.buffer=f(j.$parent)})})}}}}}]);