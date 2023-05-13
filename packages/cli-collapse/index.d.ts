declare module '@abux/cli-collapse/lib/interfaces' {
  export interface ICollapser {
    write: (message: string) => void;
    expand: () => void;
    collapse: (clean?: boolean) => void;
  }
}
declare module '@abux/cli-collapse/index' {
  /// <reference types="node" />
  /// <reference types="node" />
  /// <reference types="node" />
  /// <reference types="node" />
  import type { ICollapser } from '@abux/cli-collapse/lib/interfaces';
  export const collapser: (stream?: NodeJS.WriteStream) => ICollapser;
  export const collapse: ICollapser;
}
declare module '@abux/cli-collapse' {
  export * from '@abux/cli-collapse/index'
}
