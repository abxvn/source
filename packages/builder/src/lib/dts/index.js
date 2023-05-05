
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./packages/builder/src/lib/dts/index.ts":
/*!***********************************************!*\
  !*** ./packages/builder/src/lib/dts/index.ts ***!
  \***********************************************/
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DtsFilterWriter = exports.DtsWriter = exports.Dts = void 0;
const typescript_1 = __webpack_require__(/*! typescript */ "typescript");
const minimatch_1 = __webpack_require__(/*! minimatch */ "minimatch");
const events_1 = __importDefault(__webpack_require__(/*! events */ "events"));
const fs_extra_1 = __webpack_require__(/*! fs-extra */ "fs-extra");
const paths_1 = __webpack_require__(/*! ../paths */ "./packages/builder/src/lib/paths.ts");
const EOL = '\n';
const DTSLEN = '.d.ts'.length;
class Dts extends events_1.default {
    generate({ name, main, inputDir, projectPath, outputPath, files = [], references = [], filePatterns = [] }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let compilerOptions = {};
            const inDir = (0, paths_1.resolver)(inputDir);
            const outDir = outputPath ? (0, paths_1.resolver)(outputPath).dir() : inDir;
            outputPath = outputPath || inDir.resolve('index.d.ts');
            this.emit('log', `[dts] generate for ${inputDir} > ${outputPath}`);
            if (!files.length || projectPath) {
                const tsConfig = yield this.getTsConfig(inputDir, projectPath);
                files = tsConfig.fileNames;
                compilerOptions = tsConfig.compilerOptions;
            }
            compilerOptions.declaration = true;
            compilerOptions.target = compilerOptions.target || typescript_1.ScriptTarget.Latest;
            compilerOptions.outDir = compilerOptions.outDir || outDir.rootPath;
            const writeInputDirPath = inDir.rootPath || compilerOptions.rootDir || projectPath;
            if (!writeInputDirPath) {
                throw Error('[dts] input dir path is required');
            }
            const writeInputDir = (0, paths_1.resolver)(writeInputDirPath);
            const writeOutputDir = outDir.rootPath || compilerOptions.outDir;
            const generatedFiles = files;
            const params = [
                `baseDir = "${writeInputDir.rootPath}"`,
                `target = ${compilerOptions.target.toString()}`,
                `outDir = ${writeOutputDir || ''}`,
                `rootDir = ${compilerOptions.rootDir || ''}`,
                `moduleResolution = ${((_a = compilerOptions.moduleResolution) === null || _a === void 0 ? void 0 : _a.toString()) || ''}`,
                'files =',
                ...generatedFiles.map(file => `  ${file}`)
            ];
            this.emit('log:verbose', '[dts] params:\n' + params.map(p => `  ${p}`).join('\n'));
            yield (0, fs_extra_1.mkdirp)((0, paths_1.getDir)(outputPath));
            const writer = new DtsFilterWriter({
                outputPath,
                name,
                main,
                references
            }, {
                filePatterns
            });
            writer.on('log', msg => this.emit('log', msg));
            writer.on('log:verbose', msg => this.emit('log:verbose', msg));
            yield writer.write(writeInputDir.rootPath, compilerOptions, generatedFiles);
        });
    }
    getTsConfig(inputDir, projectPath) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const inDir = (0, paths_1.resolver)(inputDir);
            const tsconfigFiles = [
                projectPath && (0, paths_1.resolver)(projectPath).resolve('tsconfig.json'),
                projectPath,
                inDir.resolve('tsconfig.json')
            ].filter(Boolean);
            try {
                for (var _d = true, tsconfigFiles_1 = __asyncValues(tsconfigFiles), tsconfigFiles_1_1; tsconfigFiles_1_1 = yield tsconfigFiles_1.next(), _a = tsconfigFiles_1_1.done, !_a;) {
                    _c = tsconfigFiles_1_1.value;
                    _d = false;
                    try {
                        const tsconfigFile = _c;
                        if (yield (0, fs_extra_1.pathExists)(tsconfigFile)) {
                            this.emit('log', `[dts] tsconfig from ${tsconfigFile}`);
                            return yield parseTsConfig(tsconfigFile);
                        }
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = tsconfigFiles_1.return)) yield _b.call(tsconfigFiles_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            throw Error(`Can't find tsconfig in ${projectPath || inDir.rootPath}`);
        });
    }
}
exports.Dts = Dts;
class DtsWriter extends events_1.default {
    constructor(options) {
        super();
        this.ident = '  ';
        this.mainModuleId = '';
        this.externalModules = [];
        this.options = Object.assign({ references: [], excludedPatterns: [
                '**/node_modules/**/*.d.ts',
                '**/.yarn/**/*.d.ts'
            ] }, options);
        if (!this.options.main) {
            this.options.main = 'index';
        }
        this.on('done', () => { this.dispose(); });
    }
    write(inputDir, compilerOptions, filePaths) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.mainModuleId = '';
            this.externalModules = [];
            this.emit('start');
            this.emit('log', '[dtsw] start');
            const host = (0, typescript_1.createCompilerHost)(compilerOptions);
            const program = (0, typescript_1.createProgram)(filePaths, compilerOptions, host);
            const sourceFiles = program.getSourceFiles();
            const inDir = (0, paths_1.resolver)(inputDir);
            const main = `${this.options.name}/${((_a = this.options.main) === null || _a === void 0 ? void 0 : _a.replace(/^\/+/, '')) || 'index'}`;
            let mainExports = [];
            this.listExternals(sourceFiles);
            this.inDir = inDir;
            this.emit('log', '[dtsw] process files');
            this.writeReferences();
            sourceFiles.some(sourceFile => {
                var _a;
                const filePath = (0, paths_1.normalize)(sourceFile.fileName);
                if (!inDir.includes(filePath)) {
                    this.emit('log:verbose', `[dtsw] process: ignored library ${filePath}`);
                    return false;
                }
                if ((_a = this.options.excludedPatterns) === null || _a === void 0 ? void 0 : _a.some(pattern => (0, minimatch_1.minimatch)(filePath, pattern))) {
                    this.emit('log:verbose', `[dtsw] process: excluded ${filePath}`);
                    return false;
                }
                if (filePath.slice(-DTSLEN) === '.d.ts') {
                    this.emit('log:verbose', `[dtsw] process: d.ts ${filePath}`);
                    this.writeDeclaration(sourceFile);
                    return false;
                }
                const resolvedModuleId = this.resolveModule({
                    currentModule: inDir.relative(removeExtension(filePath))
                });
                if (main === resolvedModuleId) {
                    this.mainModuleId = resolvedModuleId;
                    this.emit('log:verbose', `[dtsw] main found ${main}`);
                    mainExports = this.getModuleExports(sourceFile);
                }
                const emitOutput = program.emit(sourceFile, (emittedPath, data) => {
                    if (emittedPath.slice(-DTSLEN) !== '.d.ts') {
                        this.emit('log:verbose', `[dtsw] process: ignored d.ts ${filePath}`);
                        return;
                    }
                    this.emit('log:verbose', `[dtsw] process: ts ${filePath}`);
                    this.writeDeclaration((0, typescript_1.createSourceFile)(filePath, data, compilerOptions.target, true));
                });
                if (emitOutput.emitSkipped || emitOutput.diagnostics.length > 0) {
                    this.emit('log:verbose', `[dtsw] process: ts ${filePath} error`);
                    throw getTsError(emitOutput.diagnostics
                        .concat(program.getSemanticDiagnostics(sourceFile))
                        .concat(program.getSyntacticDiagnostics(sourceFile))
                        .concat(program.getDeclarationDiagnostics(sourceFile)));
                }
                return false;
            });
            this.writeMainDeclaration(compilerOptions.target, mainExports);
            this.done();
        });
    }
    listExternals(declarationFiles) {
        this.emit('log', '[dtsw] list externals');
        declarationFiles.forEach(sourceFile => {
            processTree(sourceFile, (node) => {
                if (NodeKinds.isModuleDeclaration(node)) {
                    const name = node.name;
                    if (NodeKinds.isStringLiteral(name)) {
                        this.externalModules.push(name.text);
                    }
                }
                return undefined;
            });
        });
        if (!this.externalModules.length) {
            this.emit('log:verbose', '[dtsw] list externals: no externals found');
        }
        else {
            this.emit('log:verbose', [
                '[dtsw] list externals:',
                ...this.externalModules.map(name => `  - ${name}`)
            ].join('\n'));
        }
    }
    writeReferences() {
        var _a;
        const pathRefRegex = /^\./;
        (_a = this.options.references) === null || _a === void 0 ? void 0 : _a.forEach((ref) => {
            if (pathRefRegex.test(ref)) {
                this.emit('log', `[dtsw] ref.path ${ref}`);
                this.writeOutput(`/// <reference path="${ref}" />`);
            }
            else {
                this.emit('log', `[dtsw] ref.types ${ref}`);
                this.writeOutput(`/// <reference types="${ref}" />`);
            }
        });
    }
    writeDeclaration(declarationFile) {
        var _a, _b;
        const filePath = (0, paths_1.resolve)(declarationFile.fileName);
        const currentModule = removeExtension(((_a = this.inDir) === null || _a === void 0 ? void 0 : _a.relative(filePath)) || '');
        if (!currentModule) {
            throw Error(`[dtsw] unable to resolve current module for ${currentModule}`);
        }
        if (declarationFile.externalModuleIndicator) {
            this.writeExternalDeclaration(declarationFile, currentModule);
        }
        else if (filePath !== ((_b = this.output) === null || _b === void 0 ? void 0 : _b.path)) {
            this.emit('log:verbose', `[dtsw] declare ${currentModule} from text`);
            this.writeOutputModule(currentModule, declarationFile.text);
            this.emit('log:verbose', `[dtsw] declare ${currentModule} done`);
        }
        else {
            this.emit('log:verbose', `[dtsw] declare ignored ${currentModule}`);
        }
    }
    writeMainDeclaration(buildTarget, mainExports = []) {
        const main = this.mainModuleId;
        const declarations = [];
        if (!mainExports.length) {
            return;
        }
        if (!main) {
            return;
        }
        this.emit('log:verbose', `[dtsw] declare:main ${main}`);
        if (!buildTarget || buildTarget < typescript_1.ScriptTarget.ES2015) {
            this.emit('log:verbose', '[dtsw] declare:main require');
            declarations.push(`import main = require('${main}');`);
            declarations.push('export = main;');
        }
        else {
            if (mainExports.includes('default')) {
                this.emit('log:verbose', '[dtsw] declare:main export default');
                declarations.push(`export { default } from '${main}';`);
            }
            const hasOtherExports = mainExports.some(e => e !== 'default');
            if (hasOtherExports) {
                this.emit('log:verbose', '[dtsw] declare:main export *');
                declarations.push(`export * from '${main}';`);
            }
        }
        if (!declarations.length) {
            this.emit('log:verbose', '[dtsw] declare:main no valid exports');
        }
        this.writeOutputModule(this.options.name, declarations.join(EOL));
    }
    getModuleExports(sourceFile) {
        const exportedNames = [];
        (0, typescript_1.forEachChild)(sourceFile, node => {
            var _a;
            if (NodeKinds.isExportAssignment(node)) {
                exportedNames.push('default');
            }
            else if (NodeKinds.isExportDeclaration(node)) {
                exportedNames.push('*');
            }
            else if (NodeKinds.isNamedExports(node)) {
                node.elements.forEach(element => {
                    var _a;
                    exportedNames.push(((_a = element.propertyName) === null || _a === void 0 ? void 0 : _a.getText()) || element.name.getText());
                });
            }
            else if (NodeKinds.isVariableStatement(node) &&
                ((_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some(m => m.kind === typescript_1.SyntaxKind.ExportKeyword)) &&
                node.declarationList.declarations.length) {
                exportedNames.push('*');
            }
        });
        return exportedNames;
    }
    writeExternalDeclaration(declarationFile, currentModule) {
        const resolvedModuleId = this.resolveModule({ currentModule });
        this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId} (${declarationFile.fileName})`);
        const content = processTree(declarationFile, (node) => {
            if (NodeKinds.isExternalModuleReference(node)) {
                const expression = node.expression;
                const resolvedImportedModule = this.resolveImport({
                    importedModule: expression.text,
                    currentModule
                });
                this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: require ${resolvedImportedModule}`);
                return ` require('${resolvedImportedModule}')`;
            }
            else if (NodeKinds.isDeclareKeyWord(node)) {
                this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: ignored declare keyword`);
                return '';
            }
            else if (NodeKinds.isStringLiteral(node) && node.parent &&
                (NodeKinds.isExportDeclaration(node.parent) || NodeKinds.isImportDeclaration(node.parent))) {
                const text = node.text;
                const resolvedImportedModule = this.resolveImport({
                    importedModule: text,
                    currentModule
                });
                if (resolvedImportedModule) {
                    this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: import ${resolvedImportedModule}`);
                    return ` '${resolvedImportedModule}'`;
                }
            }
            return undefined;
        });
        this.writeOutputModule(resolvedModuleId, content.join(''));
        this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId} done`);
    }
    writeOutput(message) {
        this.output.write(message + EOL);
    }
    writeOutputModule(moduleId, contents) {
        const lines = this.filterOutput(contents);
        if (!lines.length) {
            return;
        }
        this.emit('log', `[dtsw] declared module ${moduleId}`);
        this.writeOutput(`declare module '${moduleId}' {`);
        this.writeOutput(lines.join(EOL));
        this.writeOutput('}');
    }
    filterOutput(contents) {
        return contents.split(/[\r\n]+|; |;$/)
            .filter(line => line && line !== 'export {};')
            .map(line => line.replace(/\t/g, this.ident))
            .map(line => `${this.ident}${line}`.replace(/\s{4}/g, this.ident)
            .replace(/ (\w+)\(/, (all, name) => name !== 'import' ? ` ${name} (` : all)
            .replace(/^\s+(private|protected) .+$/, ''))
            .filter(Boolean);
    }
    resolveModule(resolution) {
        let resolvedId = resolution.currentModule;
        if (this.options.resolvedModule) {
            resolvedId = this.options.resolvedModule(resolution) || resolvedId;
        }
        else {
            resolvedId = resolvedId.replace(/^.+\/src/, 'src');
        }
        resolvedId = `${this.options.name}/${resolvedId}`;
        this.emit('log:verbose', `[dtsw] resolve ${resolvedId} (${resolution.currentModule})`);
        return resolvedId;
    }
    resolveImport(resolution) {
        const isExternal = this.externalModules.includes(resolution.importedModule) ||
            !/^\./.test(resolution.importedModule);
        const importedModule = !isExternal
            ? (0, paths_1.merge)((0, paths_1.getDir)(resolution.currentModule), resolution.importedModule)
            : resolution.importedModule;
        let resolvedId = importedModule;
        if (this.options.resolvedImport) {
            resolvedId = this.options.resolvedImport({
                currentModule: resolution.currentModule,
                importedModule,
                isExternal
            }) || resolvedId;
        }
        else {
            resolvedId = resolvedId.replace(/^.+\/src/, 'src');
        }
        resolvedId = !isExternal
            ? `${this.options.name}/${resolvedId}`
            : resolvedId;
        this.emit('log:verbose', `[dtsw] resolve:import ${resolvedId}${isExternal ? ' (external)' : ''} (${resolution.currentModule}, ${resolution.importedModule})`);
        return resolvedId;
    }
    get output() {
        if (!this._output) {
            this._output = (0, fs_extra_1.createWriteStream)(this.options.outputPath, { mode: parseInt('644', 8) });
        }
        return this._output;
    }
    dispose() {
        var _a;
        (_a = this.output) === null || _a === void 0 ? void 0 : _a.close();
    }
    done() {
        this.emit('log', '[dtsw] done');
        this.emit('done');
    }
}
exports.DtsWriter = DtsWriter;
class DtsFilterWriter extends DtsWriter {
    constructor(options, filters) {
        super(options);
        this.filters = filters;
        this.modulePathMap = {};
        this.moduleDepsMap = {};
        this.cachedOutputs = {};
        this.collectModuleDeps = (resolvedModuleId) => {
            const path = this.modulePathMap[resolvedModuleId];
            if (!path) {
                return [];
            }
            const deps = this.moduleDepsMap[path] || [];
            const depDeps = deps.map(depModuleId => this.collectModuleDeps(depModuleId)).flat();
            return deps.concat(depDeps);
        };
    }
    done() {
        this.emitOutput();
        super.done();
    }
    emitOutput() {
        var _a;
        const filePatterns = ((_a = this.filters.filePatterns) === null || _a === void 0 ? void 0 : _a.map(p => `**/${removeExtension(p)}`)) || [];
        const moduleIds = Object.keys(this.cachedOutputs);
        const modulePaths = moduleIds.map(id => this.modulePathMap[id]);
        let emittedModuleIds = moduleIds;
        if (filePatterns.length) {
            emittedModuleIds = [];
            modulePaths.forEach((path, idx) => {
                if (path && filePatterns.some(pattern => (0, minimatch_1.minimatch)(path, pattern))) {
                    emittedModuleIds.push(moduleIds[idx]);
                }
            });
            emittedModuleIds = emittedModuleIds.map(id => [id].concat(this.collectModuleDeps(id)))
                .flat()
                .filter((id, idx, ids) => ids.indexOf(id) === idx &&
                moduleIds.includes(id))
                .reverse();
        }
        const main = this.mainModuleId;
        if (main && !emittedModuleIds.includes(this.options.name)) {
            emittedModuleIds.push(this.options.name);
        }
        emittedModuleIds.forEach(moduleId => {
            this.emit('log', `[dtsw] declared module ${moduleId}`);
            this.writeOutput(this.cachedOutputs[moduleId]);
        });
    }
    writeOutputModule(moduleId, contents) {
        var _a;
        const lines = this.filterOutput(contents);
        if (!lines.length) {
            return;
        }
        const output = [
            `declare module '${moduleId}' {`,
            lines.join(EOL),
            '}'
        ].join(EOL);
        if ((_a = this.filters.filePatterns) === null || _a === void 0 ? void 0 : _a.length) {
            this.cachedOutputs[moduleId] = output;
            return;
        }
        this.writeOutput(output);
    }
    resolveModule(resolution) {
        const resolvedModuleId = super.resolveModule(resolution);
        this.modulePathMap[resolvedModuleId] = resolution.currentModule;
        return resolvedModuleId;
    }
    resolveImport(resolution) {
        const resolvedModuleId = super.resolveImport(resolution);
        if (!this.moduleDepsMap[resolution.currentModule]) {
            this.moduleDepsMap[resolution.currentModule] = [];
        }
        this.moduleDepsMap[resolution.currentModule].push(resolvedModuleId);
        return resolvedModuleId;
    }
}
exports.DtsFilterWriter = DtsFilterWriter;
const NodeKinds = {
    isDeclareKeyWord(node) {
        return node && node.kind === typescript_1.SyntaxKind.DeclareKeyword;
    },
    isImportDeclaration(node) {
        return node && node.kind === typescript_1.SyntaxKind.ImportDeclaration;
    },
    isExternalModuleReference(node) {
        return node && node.kind === typescript_1.SyntaxKind.ExternalModuleReference;
    },
    isStringLiteral(node) {
        return node && node.kind === typescript_1.SyntaxKind.StringLiteral;
    },
    isExportDeclaration(node) {
        return node && node.kind === typescript_1.SyntaxKind.ExportDeclaration;
    },
    isExportAssignment(node) {
        return node && node.kind === typescript_1.SyntaxKind.ExportAssignment;
    },
    isNamedExports(node) {
        return node && node.kind === typescript_1.SyntaxKind.NamedExports;
    },
    isVariableStatement(node) {
        return node && node.kind === typescript_1.SyntaxKind.VariableStatement;
    },
    isModuleDeclaration(node) {
        return node && node.kind === typescript_1.SyntaxKind.ModuleDeclaration;
    }
};
const processTree = (sourceFile, replacer) => {
    const codes = [];
    let cursorPosition = 0;
    function skip(node) {
        cursorPosition = node.end;
    }
    function readThrough(node) {
        codes.push(sourceFile.text.slice(cursorPosition, node.pos));
        cursorPosition = node.pos;
    }
    function visit(node) {
        readThrough(node);
        const replacement = replacer(node);
        if (replacement !== undefined) {
            codes.push(replacement);
            skip(node);
        }
        else {
            (0, typescript_1.forEachChild)(node, visit);
        }
    }
    visit(sourceFile);
    codes.push(sourceFile.text.slice(cursorPosition));
    return codes.filter(Boolean);
};
const parseTsConfig = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const configText = yield (0, fs_extra_1.readFile)(fileName, { encoding: 'utf8' });
    const result = (0, typescript_1.parseConfigFileTextToJson)(fileName, configText);
    if (result.error) {
        throw getTsError([result.error]);
    }
    const configObject = result.config;
    const configParseResult = (0, typescript_1.parseJsonConfigFileContent)(configObject, typescript_1.sys, (0, paths_1.getDir)(fileName));
    if ((_a = configParseResult.errors) === null || _a === void 0 ? void 0 : _a.length) {
        throw getTsError(configParseResult.errors);
    }
    return {
        fileNames: configParseResult.fileNames,
        compilerOptions: configParseResult.options
    };
});
const getTsError = (diagnostics) => {
    const messages = ['Declaration generation failed'];
    diagnostics.forEach(diagnostic => {
        const messageText = typeof diagnostic.messageText === 'string'
            ? diagnostic.messageText
            : diagnostic.messageText.messageText;
        if (diagnostic.file) {
            const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
            messages.push(`${diagnostic.file.fileName}(${position.line + 1},${position.character + 1}): ` +
                `error TS${diagnostic.code}: ${messageText}`);
        }
        else {
            messages.push(`error TS${diagnostic.code}: ${messageText}`);
        }
    });
    const error = new Error(messages.join('\n'));
    error.name = 'EmitterError';
    return error;
};
const removeExtension = (filePath) => filePath.replace(/(\.d)?\.ts|\.js$/, '');


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

/***/ "fs-extra":
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("fs-extra");

/***/ }),

/***/ "minimatch":
/*!****************************!*\
  !*** external "minimatch" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("minimatch");

/***/ }),

/***/ "typescript":
/*!*****************************!*\
  !*** external "typescript" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("typescript");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./packages/builder/src/lib/dts/index.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;