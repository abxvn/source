declare module '@abux/logger/index' {
  import type { IStyles, IUnstyler, ILoggers } from '@abux/logger/lib/styles/interfaces';
  export const unstyle: IUnstyler;
  export const styles: IStyles;
  export const loggers: ILoggers;
}
declare module '@abux/logger/lib/styles/interfaces' {
  export const Modifiers: {
    bold: string;
    underline: string;
    italic: string;
  };
  export type IModifierName = keyof typeof Modifiers;
  export type IModifier = typeof Modifiers[IModifierName];
  export interface IFormatState {
    modified?: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    bgColor: string;
    color: string;
  }
  export type IFormatStateKey = keyof IFormatState;
  export interface IStyledCssLog {
    text: string;
    css: string[];
  }
  export interface IStyles {
    (text: string): string;
    bold: IStyles;
    italic: IStyles;
    underline: IStyles;
    black: IStyles;
    bgBlack: IStyles;
    gray: IStyles;
    bgGray: IStyles;
    red: IStyles;
    redBright: IStyles;
    bgRed: IStyles;
    bgRedBright: IStyles;
    white: IStyles;
    whiteBright: IStyles;
    green: IStyles;
    greenBright: IStyles;
    yellow: IStyles;
    yellowBright: IStyles;
    blue: IStyles;
    blueBright: IStyles;
    cyan: IStyles;
    cyanBright: IStyles;
    magenta: IStyles;
    magentaBright: IStyles;
    bgGreen: IStyles;
    bgGreenBright: IStyles;
    bgYellow: IStyles;
    bgYellowBright: IStyles;
    bgBlue: IStyles;
    bgBlueBright: IStyles;
    bgCyan: IStyles;
    bgCyanBright: IStyles;
    bgMagenta: IStyles;
    bgMagentaBright: IStyles;
  }
  export type ILogger = (...items: any[]) => void;
  export type IUnstyler = (formattedText: string) => string;
  export type ILogStyler = (formattedText: string) => IStyledCssLog;
  export type ITextEffectColor = 'green' | 'greenBright' | 'yellow' | 'yellowBright' | 'blue' | 'blueBright' | 'cyan' | 'cyanBright' | 'magenta' | 'magentaBright';
  export type IBadgeEffectColor = 'bgGreen' | 'bgGreenBright' | 'bgYellow' | 'bgYellowBright' | 'bgBlue' | 'bgBlueBright' | 'bgCyan' | 'bgCyanBright' | 'bgMagenta' | 'bgMagentaBright';
  export interface ILoggers {
    log: ILogger;
    info: ILogger;
    warn: ILogger;
    progress: ILogger;
    success: ILogger;
    error: ILogger;
    color: (message: string, textColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black' | 'white' | 'whiteBright') => string;
    badge: (label: string, bgColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black', textColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black' | 'white' | 'whiteBright') => string;
  }
}
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
  /// <reference types="node" />
  import type { ICollapsible } from '@abux/logger/lib/interfaces';
  import type { ILoggers, IStyles, IUnstyler } from '@abux/logger/lib/styles/interfaces';
  export type { ICollapsible } from '@abux/logger/lib/interfaces';
  export const collapsible: (stream?: NodeJS.WriteStream, collectFromStream?: boolean) => ICollapsible;
  export const collapse: ICollapsible;
  export const unstyle: IUnstyler;
  export const styles: IStyles;
  export const loggers: ILoggers;
}
declare module '@abux/logger' {
  export * from '@abux/logger/index'
}
