declare module '@abux/resolve/src/interfaces' {
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
}
declare module '@abux/resolve/src/resolveSync' {
  import type { IResolveOptions } from '@abux/resolve/src/interfaces';
  export const resolveSync: (path: string, options?: IResolveOptions) => string;
}
declare module '@abux/resolve/src/resolveModule' {
  import type { IModule, IResolveOptions } from '@abux/resolve/src/interfaces';
  export const resolveModule: (moduleOrDirPath: string, options?: IResolveOptions) => Promise<IModule>;
}
declare module '@abux/resolve/src/resolve' {
  import type { IResolveOptions } from '@abux/resolve/src/interfaces';
  export const resolve: (path: string, options?: IResolveOptions) => Promise<string>;
}
declare module '@abux/resolve/src/lib/pnp' {
  import type { PnpApi } from '@abux/resolve/src/interfaces';
  export const pnpApi: PnpApi | null;
  export const isPnpEnabled: () => boolean;
}
declare module '@abux/resolve/index' {
  export { isPnpEnabled, pnpApi } from '@abux/resolve/src/lib/pnp';
  export { resolve } from '@abux/resolve/src/resolve';
  export { resolveModule } from '@abux/resolve/src/resolveModule';
  export { resolveSync } from '@abux/resolve/src/resolveSync';
  export type { IModule, IResolveOptions } from '@abux/resolve/src/interfaces';
}
declare module '@abux/resolve' {
  export * from '@abux/resolve/index'
}
