declare module '@abxvn/resolve/src/lib/interfaces' {
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
    usePnpFallback?: boolean;
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
  export type IMaybePromise<T> = T | Promise<T>;
  export type IResolveTrace = Map<string, unknown>;
}
declare module '@abxvn/resolve/src/resolveSync' {
  import type { IResolveOptions } from '@abxvn/resolve/src/lib/interfaces';
  export const resolveSync: (path: string, options?: IResolveOptions) => string;
}
declare module '@abxvn/resolve/src/resolveModule' {
  import type { IModule, IResolveOptions } from '@abxvn/resolve/src/lib/interfaces';
  export const resolveModule: (moduleOrDirPath: string, options?: IResolveOptions) => Promise<IModule>;
}
declare module '@abxvn/resolve/src/resolve' {
  import type { IResolveOptions } from '@abxvn/resolve/src/lib/interfaces';
  export const resolve: (path: string, options?: IResolveOptions) => Promise<string>;
}
declare module '@abxvn/resolve/src/lib/pnp' {
  import type { PnpApi } from '@abxvn/resolve/src/lib/interfaces';
  export const pnpApi: PnpApi | null;
  export const isPnpEnabled: () => boolean;
  export const resolvePnpPackage: PnpApi['resolveRequest'];
}
declare module '@abxvn/resolve/index' {
  export { isPnpEnabled, pnpApi } from '@abxvn/resolve/src/lib/pnp';
  export { resolve } from '@abxvn/resolve/src/resolve';
  export { resolveModule } from '@abxvn/resolve/src/resolveModule';
  export { resolveSync } from '@abxvn/resolve/src/resolveSync';
  export type { IModule, IResolveOptions } from '@abxvn/resolve/src/lib/interfaces';
}
declare module '@abxvn/resolve' {
  export * from '@abxvn/resolve/index'
}
