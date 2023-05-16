declare module '@abux/logger/lib/interfaces' {
  /// <reference types="node" />
  /// <reference types="node" />
  import type { Writable } from 'stream';
  export type IWriteParams = [
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ];
  export type IWrite = (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) => void;
  export interface IWritable {
    on: (...args: any[]) => void;
    _write: IWrite;
  }
  export type IWatchCallback = (data: Buffer) => void;
  export interface ICollapsible extends Writable {
    expand: () => void;
    collapse: (clean?: boolean) => void;
    isCollapsible: boolean;
    width: number;
    count: number;
  }
}
declare module '@abux/logger/cli' {
  /// <reference types="node" />
  /// <reference types="node" />
  /// <reference types="node" />
  /// <reference types="node" />
  import type { ICollapsible } from '@abux/logger/lib/interfaces';
  export type { ICollapsible } from '@abux/logger/lib/interfaces';
  export const collapsible: (stream?: NodeJS.WriteStream, collectFromStream?: boolean) => ICollapsible;
  export const collapse: ICollapsible;
}
declare module '@abux/logger/lib/loggers' {
  export { bold, italic, underline, unstyle } from 'ansi-colors';
  export const log: any;
  export const logInfo: (...items: any[]) => void;
  export const logProgress: (...items: any[]) => void;
  export const logWarn: (...items: any[]) => void;
  export const logError: (...items: any[]) => void;
  export const logSuccess: (...items: any[]) => void
  const TextColors: {
    green: any;
    yellow: any;
    blue: any;
    magenta: any;
    cyan: any;
    greenBright: any;
    yellowBright: any;
    blueBright: any;
    magentaBright: any;
    cyanBright: any;
  }
  const BadgeColors: {
    green: any;
    yellow: any;
    blue: any;
    magenta: any;
    cyan: any;
    greenBright: any;
    yellowBright: any;
    blueBright: any;
    magentaBright: any;
    cyanBright: any;
    red: any;
    redBright: any;
  };
  type ITextColorName = keyof typeof TextColors;
  export const color: (message: string, textColor?: ITextColorName | number) => string;
  type IBadgeColorName = keyof typeof BadgeColors;
  export const badge: (label: string, bgColor?: IBadgeColorName | number, textColor?: ITextColorName | 'white' | 'whiteBright' | 'black' | number) => string;
}
declare module '@abux/logger/index' {
  export * from '@abux/logger/lib/loggers';
}
declare module '@abux/logger' {
  export * from '@abux/logger/index'
}
