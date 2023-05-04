
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./packages/builder/src/lib/paths/index.ts":
/*!*************************************************!*\
  !*** ./packages/builder/src/lib/paths/index.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeExt = exports.merge = exports.resolve = exports.resolver = exports.getName = exports.getDir = exports.normalize = exports.PathResolver = exports.resolvePath = void 0;
const path_1 = __webpack_require__(/*! path */ "path");
var path_2 = __webpack_require__(/*! path */ "path");
Object.defineProperty(exports, "resolvePath", ({ enumerable: true, get: function () { return path_2.resolve; } }));
class PathResolver {
    constructor(rootPath) {
        this.rootPath = (0, exports.normalize)((0, path_1.resolve)(rootPath));
    }
    relative(fullPath) {
        return (0, exports.normalize)((0, path_1.relative)(this.rootPath, (0, exports.normalize)(fullPath)));
    }
    relativeList(fullPaths) {
        return fullPaths.map(fullPath => this.relative(fullPath));
    }
    includes(fullPath) {
        return (0, exports.normalize)(fullPath).indexOf(this.rootPath) === 0;
    }
    resolve(...paths) {
        return (0, exports.normalize)((0, path_1.resolve)(this.rootPath, ...paths.filter(Boolean).map(p => p.replace(/^\/+/, ''))));
    }
    resolveList(paths) {
        return paths.map(path => this.resolve(path));
    }
    dir() {
        return (0, exports.resolver)((0, exports.getDir)(this.rootPath));
    }
    res(...paths) {
        return (0, exports.resolver)(this.resolve(...paths));
    }
}
exports.PathResolver = PathResolver;
const normalize = (path) => (path === null || path === void 0 ? void 0 : path.replace(/\\/g, '/')) || '';
exports.normalize = normalize;
const getDir = (path) => (0, exports.normalize)(path).replace(/\/[^/]+\/?$/, '');
exports.getDir = getDir;
const getName = (path) => (0, path_1.basename)((0, exports.normalize)(path));
exports.getName = getName;
const resolver = (rootPath) => new PathResolver(rootPath);
exports.resolver = resolver;
const resolve = (path) => (0, exports.normalize)((0, path_1.resolve)(path));
exports.resolve = resolve;
const merge = (...paths) => (0, exports.normalize)((0, path_1.join)(...paths));
exports.merge = merge;
const removeExt = (path) => path === null || path === void 0 ? void 0 : path.replace(/\.([^/]+)$/, '');
exports.removeExt = removeExt;


/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./packages/builder/src/lib/paths/index.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;