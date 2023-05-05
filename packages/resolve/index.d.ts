declare module '@teku/resolve/src/interfaces' {
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
declare module '@teku/resolve/src/resolveSync' {
  import type { IResolveOptions } from '@teku/resolve/src/interfaces';
  export const resolveSync: (path: string, options?: IResolveOptions) => string;
}
declare module '@teku/resolve/src/resolveModule' {
  import type { IModule, IResolveOptions } from '@teku/resolve/src/interfaces';
  export const resolveModule: (moduleOrDirPath: string, options?: IResolveOptions) => Promise<IModule>;
}
declare module '@teku/resolve/src/resolve' {
  import type { IResolveOptions } from '@teku/resolve/src/interfaces';
  export const resolve: (path: string, options?: IResolveOptions) => Promise<string>;
}
declare module '@teku/resolve/src/lib/pnp' {
  import type { PnpApi } from '@teku/resolve/src/interfaces';
  export const pnpApi: PnpApi | null;
  export const isPnpEnabled: () => boolean;
}
declare module '@teku/resolve/index' {
  export { isPnpEnabled, pnpApi } from '@teku/resolve/src/lib/pnp';
  export { resolve } from '@teku/resolve/src/resolve';
  export { resolveModule } from '@teku/resolve/src/resolveModule';
  export { resolveSync } from '@teku/resolve/src/resolveSync';
  export type { IModule, IResolveOptions } from '@teku/resolve/src/interfaces';
}
declare module '@teku/resolve' {
  export * from '@teku/resolve/index'
}
