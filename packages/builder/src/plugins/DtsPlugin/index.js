
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./packages/builder/src/lib/logger.ts":
/*!********************************************!*\
  !*** ./packages/builder/src/lib/logger.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logEntries = exports.logSuccess = exports.logError = exports.logWarn = exports.logProgress = exports.logInfo = exports.log = void 0;
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
const { bold, red, gray } = chalk_1.default;
exports.log = console.log.bind(console);
const logInfo = (...items) => {
    console.info(bold.blueBright('ℹ'), ...items);
};
exports.logInfo = logInfo;
const logProgress = (...items) => {
    console.info(gray('➤'), ...items);
};
exports.logProgress = logProgress;
const logWarn = (...items) => {
    console.info(red('△'), ...items);
};
exports.logWarn = logWarn;
const logError = (...items) => {
    items.forEach(item => {
        console.error(bold.underline.redBright('✘'), item);
    });
};
exports.logError = logError;
const logSuccess = (...items) => {
    console.info(bold.greenBright('✔'), ...items);
};
exports.logSuccess = logSuccess;
const logEntries = (configs) => {
    (0, exports.logInfo)(bold.cyanBright('Building entries:'));
    configs.forEach(({ name, target, entry }) => {
        (0, exports.log)(`   ${name} (${chalk_1.default.italic(target)}):`);
        Object.keys(entry).forEach(entryName => { (0, exports.log)(`     ${entryName}`); });
    });
};
exports.logEntries = logEntries;


/***/ }),

/***/ "./packages/builder/src/lib/paths.ts":
/*!*******************************************!*\
  !*** ./packages/builder/src/lib/paths.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeExt = exports.merge = exports.resolve = exports.resolver = exports.getName = exports.getDir = exports.normalize = exports.PathResolver = void 0;
const path_1 = __webpack_require__(/*! path */ "path");
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

/***/ "./packages/builder/src/plugins/DtsPlugin/index.ts":
/*!*********************************************************!*\
  !*** ./packages/builder/src/plugins/DtsPlugin/index.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs_extra_1 = __webpack_require__(/*! fs-extra */ "fs-extra");
const index_js_1 = __webpack_require__(/*! @teku/builder/src/lib/dts/index.js */ "@teku/builder/src/lib/dts/index.js");
const logger_1 = __webpack_require__(/*! ../../lib/logger */ "./packages/builder/src/lib/logger.ts");
const paths_1 = __webpack_require__(/*! ../../lib/paths */ "./packages/builder/src/lib/paths.ts");
const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/;
let counterId = 0;
class DtsPlugin {
    constructor(rootPath) {
        this.path = (0, paths_1.resolver)(rootPath);
    }
    apply(compiler) {
        let builtModulePaths = [];
        compiler.hooks.beforeCompile.tapPromise('[dts] start collecting built modules', () => __awaiter(this, void 0, void 0, function* () {
            builtModulePaths = [];
        }));
        compiler.hooks.compilation.tap('[dts] setup compilation', (compilation) => {
            compilation.hooks.succeedModule.tap('[dts] collect built module', (module) => {
                if (module.constructor.name !== 'NormalModule') {
                    return;
                }
                const fileSubPath = this.path.relative(module.context || '');
                const matches = !fileSubPath.includes('node_modules') && !fileSubPath.includes('.yarn') && fileSubPath.match(MODULE_PATH_REGEX);
                if (matches && !builtModulePaths.includes(matches[0])) {
                    builtModulePaths.push(matches[0]);
                }
            });
        });
        compiler.hooks.afterCompile.tap('[dts] generate definitions', () => {
            void Promise.all(builtModulePaths.map((p) => __awaiter(this, void 0, void 0, function* () {
                const id = counterId += 1;
                try {
                    const packageInfo = yield (0, fs_extra_1.readJSON)(this.path.resolve(p, 'package.json'));
                    const typesFile = packageInfo.types;
                    const packageName = packageInfo.name;
                    const projectPath = this.path.resolve(p);
                    const typesFilePath = this.path.resolve(p, typesFile);
                    const packageMain = packageInfo.main || 'index';
                    const packageFiles = packageInfo.files || '';
                    if (!typesFile) {
                        return;
                    }
                    let tsconfigPath = this.path.resolve(p, 'tsconfig.json');
                    if (!(yield (0, fs_extra_1.pathExists)(tsconfigPath))) {
                        tsconfigPath = this.path.resolve('tsconfig.json');
                    }
                    if (!(yield (0, fs_extra_1.pathExists)(tsconfigPath))) {
                        (0, logger_1.logWarn)(`[dts ${id}]`, packageName, ' generation ignored, required tsconfig');
                        return;
                    }
                    const dts = new index_js_1.Dts();
                    const filePatterns = packageFiles.map(f => (0, paths_1.resolver)(projectPath).relative(this.path.resolve(p, f)));
                    dts.on('log', message => { (0, logger_1.logProgress)(message.replace(/^\[(dtsw?)\]/, `[$1 ${id}]`)); });
                    (0, logger_1.logInfo)(`[dts ${id}]`, packageName, 'generation started');
                    yield dts.generate({
                        projectPath: tsconfigPath,
                        name: packageName,
                        inputDir: projectPath,
                        outputPath: typesFilePath,
                        main: (0, paths_1.removeExt)(packageMain.replace(/^(\.\/?)+/, '')),
                        filePatterns
                    });
                    (0, logger_1.logSuccess)(`[dts ${id}]`, packageName, 'declaration at', typesFile);
                }
                catch (err) {
                    (0, logger_1.logError)(`[dts ${id}] ${err.message}`);
                }
            })));
        });
    }
}
exports["default"] = DtsPlugin;


/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/***/ ((module) => {

module.exports = require("chalk");

/***/ }),

/***/ "fs-extra":
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("fs-extra");

/***/ }),

/***/ "@teku/builder/src/lib/dts/index.js":
/*!*****************************************************!*\
  !*** external "@teku/builder/src/lib/dts/index.js" ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = require("@teku/builder/src/lib/dts/index.js");

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	var __webpack_exports__ = __webpack_require__("./packages/builder/src/plugins/DtsPlugin/index.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;