declare module '@abux/webpack-dts/lib/WebpackDtsPlugin' {
  import type { Compiler } from 'webpack';
  import { type IPathResolver } from '@abux/paths';
  export class WebpackDtsPlugin {
    readonly path: IPathResolver;
    constructor (rootPath: string);
    apply (compiler: Compiler): void;
  }
}
declare module '@abux/webpack-dts/index' {
  export { WebpackDtsPlugin } from '@abux/webpack-dts/lib/WebpackDtsPlugin';
}
declare module '@abux/webpack-dts' {
  export * from '@abux/webpack-dts/index'
}
