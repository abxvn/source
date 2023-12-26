declare module '@abux/paths/index' {
  export interface IPathResolver {
    rootPath: string;
    resolve: (...paths: string[]) => string;
    relative: (fullPath: string) => string;
    includes: (fullPath: string) => boolean;
    resolveList: (paths: string[]) => string[];
    dir: () => IPathResolver;
    res: (...paths: string[]) => IPathResolver;
  }
  export class PathResolver implements IPathResolver {
    readonly rootPath: string;
    constructor (rootPath: string);
    relative (fullPath: string): string;
    relativeList (fullPaths: string[]): string[];
    includes (fullPath: string): boolean;
    resolve (...paths: string[]): string;
    resolveList (paths: string[]): string[];
    dir (): IPathResolver;
    res (...paths: string[]): IPathResolver;
  }
  export const normalize: (path: string) => string;
  export const getDir: (path: string) => string;
  export const getName: (path: string) => any;
  export const resolver: (rootPath: string) => IPathResolver;
  export const resolve: (path: string) => string;
  export const merge: (...paths: string[]) => string;
  export const removeExt: (path: string) => string;
  export const getLocalPackagePath: (relativePath: string) => string;
}
declare module '@abux/paths' {
  export * from '@abux/paths/index'
}
