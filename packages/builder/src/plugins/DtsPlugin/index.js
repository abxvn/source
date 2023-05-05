(()=>{"use strict";var e={559:function(e,o,t){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(o,"__esModule",{value:!0}),o.logEntries=o.logSuccess=o.logError=o.logWarn=o.logProgress=o.logInfo=o.log=void 0;const i=r(t(22)),{bold:s,red:n,gray:l}=i.default;o.log=console.log.bind(console),o.logInfo=(...e)=>{console.info(s.blueBright("ℹ"),...e)},o.logProgress=(...e)=>{console.info(l("➤"),...e)},o.logWarn=(...e)=>{console.info(n("△"),...e)},o.logError=(...e)=>{e.forEach((e=>{console.error(s.underline.redBright("✘"),e)}))},o.logSuccess=(...e)=>{console.info(s.greenBright("✔"),...e)},o.logEntries=e=>{(0,o.logInfo)(s.cyanBright("Building entries:")),e.forEach((({name:e,target:t,entry:r})=>{(0,o.log)(`   ${e} (${i.default.italic(t)}):`),Object.keys(r).forEach((e=>{(0,o.log)(`     ${e}`)}))}))}},584:(e,o,t)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.removeExt=o.merge=o.resolve=o.resolver=o.getName=o.getDir=o.normalize=o.PathResolver=void 0;const r=t(17);class i{constructor(e){this.rootPath=(0,o.normalize)((0,r.resolve)(e))}relative(e){return(0,o.normalize)((0,r.relative)(this.rootPath,(0,o.normalize)(e)))}relativeList(e){return e.map((e=>this.relative(e)))}includes(e){return 0===(0,o.normalize)(e).indexOf(this.rootPath)}resolve(...e){return(0,o.normalize)((0,r.resolve)(this.rootPath,...e.filter(Boolean).map((e=>e.replace(/^\/+/,"")))))}resolveList(e){return e.map((e=>this.resolve(e)))}dir(){return(0,o.resolver)((0,o.getDir)(this.rootPath))}res(...e){return(0,o.resolver)(this.resolve(...e))}}o.PathResolver=i,o.normalize=e=>(null==e?void 0:e.replace(/\\/g,"/"))||"",o.getDir=e=>(0,o.normalize)(e).replace(/\/[^/]+\/?$/,""),o.getName=e=>(0,r.basename)((0,o.normalize)(e)),o.resolver=e=>new i(e),o.resolve=e=>(0,o.normalize)((0,r.resolve)(e)),o.merge=(...e)=>(0,o.normalize)((0,r.join)(...e)),o.removeExt=e=>null==e?void 0:e.replace(/\.([^/]+)$/,"")},163:function(e,o,t){var r=this&&this.__awaiter||function(e,o,t,r){return new(t||(t=Promise))((function(i,s){function n(e){try{a(r.next(e))}catch(e){s(e)}}function l(e){try{a(r.throw(e))}catch(e){s(e)}}function a(e){var o;e.done?i(e.value):(o=e.value,o instanceof t?o:new t((function(e){e(o)}))).then(n,l)}a((r=r.apply(e,o||[])).next())}))};Object.defineProperty(o,"__esModule",{value:!0});const i=t(470),s=t(644),n=t(559),l=t(584),a=/([^/]+\/[^/]+)/;o.default=class{constructor(e){this.rootPath=e,this.path=(0,l.resolver)(e)}apply(e){let o=[];e.hooks.beforeCompile.tapPromise("[dts] start collecting built modules",(()=>r(this,void 0,void 0,(function*(){o=[]})))),e.hooks.compilation.tap("[dts] setup compilation",(e=>{e.hooks.succeedModule.tap("[dts] collect built module",(e=>{if("NormalModule"!==e.constructor.name)return;const t=this.path.relative(e.context||""),r=!t.includes("node_modules")&&!t.includes(".yarn")&&t.match(a);r&&!o.includes(r[0])&&o.push(r[0])}))})),e.hooks.afterCompile.tapPromise("[dts] generate definitions",(()=>r(this,void 0,void 0,(function*(){yield Promise.all(o.map((e=>r(this,void 0,void 0,(function*(){try{const o=yield(0,i.readJSON)(this.path.resolve(e,"package.json")),t=o.types,r=o.name,a=this.path.resolve(e),c=this.path.resolve(e,t),u=o.main||"index";if(!t)return;let d=this.path.resolve(e,"tsconfig.json");if((yield(0,i.pathExists)(d))||(d=this.path.resolve("tsconfig.json")),!(yield(0,i.pathExists)(d)))return void(0,n.logWarn)("[dts]",r," generation ignored, required tsconfig");const h=new s.Dts;h.on("log",(e=>{(0,n.logProgress)(e)})),(0,n.logInfo)("[dts]",r,"generation started"),yield h.generate({projectPath:d,name:r,inputDir:a,outputPath:c,main:(0,l.removeExt)(u.replace(/^(\.\/?)+/,""))}),(0,n.logSuccess)("[dts]",r,"declaration at",t)}catch(e){(0,n.logError)(`[dts] ${e.message}`)}})))))}))))}}},22:e=>{e.exports=require("chalk")},470:e=>{e.exports=require("fs-extra")},644:e=>{e.exports=require("../../lib/dts/index.js")},17:e=>{e.exports=require("path")}},o={},t=function t(r){var i=o[r];if(void 0!==i)return i.exports;var s=o[r]={exports:{}};return e[r].call(s.exports,s,s.exports,t),s.exports}(163);module.exports=t})();