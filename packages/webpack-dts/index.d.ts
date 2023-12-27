declare module '@abxvn/webpack-dts/lib/WebpackDtsPlugin' {
  import type { Compiler } from 'webpack';
  import { type IPathResolver } from '@abxvn/paths';
  export class WebpackDtsPlugin {
    readonly path: IPathResolver;
    constructor (rootPath: string);
    apply (compiler: Compiler): void;
  }
}
declare module '@abxvn/webpack-dts/index' {
  export { WebpackDtsPlugin } from '@abxvn/webpack-dts/lib/WebpackDtsPlugin';
}
declare module '@abxvn/webpack-dts' {
  export * from '@abxvn/webpack-dts/index'
}
