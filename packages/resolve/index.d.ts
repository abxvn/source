declare module '@teku/resolve/.internal/interfaces' {
	export interface IModule {
	    exists: boolean;
	    query: string;
	    path: string;
	    main: string;
	    name: string;
	    version: string;
	    dependencies: string[];
	    error?: Error;
	}
	export type IResolvedFileType = 'file' | 'directory' | null;
	export interface IFsPathType {
	    path: string;
	    type: IResolvedFileType;
	}
	export interface IResolveOptions {
	    callerPath?: string;
	    moduleDirs?: string[];
	}
	interface PnpResolveToUnqualifiedOptions {
	    considerBuiltins?: boolean;
	}
	interface PnpResolveUnqualifiedOptions {
	    extensions?: string[];
	    conditions?: Set<string>;
	}
	type PnpResolveRequestOptions = PnpResolveToUnqualifiedOptions & PnpResolveUnqualifiedOptions;
	export interface PnpApi {
	    resolveRequest: (request: string, issuer: string | null, options?: PnpResolveRequestOptions) => string | null;
	}
	export {};

}
declare module '@teku/resolve/.internal/lib/packages' {
	export { isBuiltin } from 'module';
	export const npmGlobalPackageDir: string;
	export const yarnGlobalPackageDir: string;
	export const isGlobal: (path: string) => Promise<boolean>;
	export const isLocalMatch: (path: string) => boolean;
	export const listModuleDirs: (fullPath: string) => any[];

}
declare module '@teku/resolve/.internal/lib/pnp' {
	import type { PnpApi } from '@teku/resolve/.internal/interfaces';
	export const pnpApi: PnpApi;
	export const isPnpEnabled: () => boolean;

}
declare module '@teku/resolve/.internal/lib/asyncFs' {
	import type { IFsPathType } from '@teku/resolve/.internal/interfaces';
	export const resolveFromFsPath: (fsPath: string, callerPath: string) => Promise<string>;
	export const getFsPathType: (fsPath: string, callerPath: string) => Promise<IFsPathType>;
	export const getJsonData: (jsonFilePath: string, key: string) => Promise<string>;

}
declare module '@teku/resolve/.internal/lib/syncFs' {
	import type { IFsPathType } from '@teku/resolve/.internal/interfaces';
	export const resolveFromFsPathSync: (fsPath: string, callerPath: string) => string;
	export const getFsPathTypeSync: (fsPath: string, callerPath: string) => IFsPathType;

}
declare module '@teku/resolve/.internal/lib' {
	export { pathExists, readJSON } from 'fs-extra';
	export * from '@teku/resolve/.internal/lib/packages';
	export * from '@teku/resolve/.internal/lib/pnp';
	export * from '@teku/resolve/.internal/lib/asyncFs';
	export * from '@teku/resolve/.internal/lib/syncFs';
	export const getDirPath: (path: string) => string;
	export const getCallerPath: () => string;
	export const getCallers: () => string[];

}
declare module '@teku/resolve/.internal/resolve' {
	import type { IResolveOptions } from '@teku/resolve/.internal/interfaces';
	export const resolve: (path: string, options?: IResolveOptions) => Promise<string>;

}
declare module '@teku/resolve/.internal/resolveModule' {
	import type { IModule, IResolveOptions } from '@teku/resolve/.internal/interfaces';
	export const resolveModule: (moduleOrDirPath: string, options?: IResolveOptions) => Promise<IModule>;

}
declare module '@teku/resolve/.internal/resolveSync' {
	import type { IResolveOptions } from '@teku/resolve/.internal/interfaces';
	export const resolveSync: (path: string, options?: IResolveOptions) => string;

}
declare module '@teku/resolve' {
	export { resolve } from '@teku/resolve/.internal/resolve';
	export { resolveModule } from '@teku/resolve/.internal/resolveModule';
	export { resolveSync } from '@teku/resolve/.internal/resolveSync';
	export type { IModule, IResolveOptions } from '@teku/resolve/.internal/interfaces';

}
declare module '@teku/resolve/cli' {
	export {};

}
declare module '@teku/resolve' {
	export * from '/index';
}
