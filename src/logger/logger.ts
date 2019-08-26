import * as stackTraceParser from 'stacktrace-parser';
import { ILoggerAdapter } from '../adapter/adapter';
import { LoggerConfig } from './loggerConfig';

/**
 * The possible log levels.
 */
export enum LogLevel {
  OFF,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  ALL,
}

export enum LogType {
  ERROR,
  WARN,
  INFO,
  DEBUG,
  ENTER,
  EXIT,
}

export interface ILogger {
  name: string;
  enabled: boolean;
  stackTrace: boolean;
  level: LogLevel;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  enter(message: string): void;
  exit(message: string): void;
  initialize(env: any): void;
  addAdapter(adapter: ILoggerAdapter): ILogger;
  getAdapterList(): string[];
  resetAdapter(): void;
}

export abstract class Logger implements ILogger {
  // private dateTimeFormat = '[yyyy-MM-dd HH:mm:ss:SSS]';
  protected config: LoggerConfig;

  protected adapterList: ILoggerAdapter[];

  constructor(protected loggerName: string) {
    this.config = new LoggerConfig();
    this.config.name = loggerName;
    this.adapterList = new Array();
  }

  public abstract debug(): void;
  public abstract info(): void;
  public abstract warn(): void;
  public abstract error(): void;
  public abstract enter(): void;
  public abstract exit(): void;

  get name(): string {
    return this.config.name;
  }

  get enabled(): boolean {
    return this.config.enabled;
  }

  set enabled(val: boolean) {
    this.config.enabled = val;
  }

  get level(): LogLevel {
    return this.config.level;
  }

  set level(lvl: LogLevel) {
    this.config.level = lvl;
  }

  get stackTrace(): boolean {
    return this.config.stacktrace;
  }

  set stackTrace(val: boolean) {
    this.config.stacktrace = val;
  }

  public initialize(env: any) {
    this.config.load(env);
  }

  public toString(): string {
    let result = 'Logger -> name: ' + this.name;
    result += ', implementation: ' + this.constructor.name;
    result += ', logger enabled: ' + this.enabled;
    result += ', stackTrace: ' + this.stackTrace;
    result += ', level: ' + this.level;
    result += ', adapter: ' + this.getAdapterList();
    return result;
  }

  public addAdapter(adapter: ILoggerAdapter): ILogger {
    if (adapter && adapter !== undefined) {
      this.adapterList.push(adapter);
    }
    return this;
  }

  public resetAdapter() {
    this.adapterList = [];
  }

  public getAdapterList(): string[] {
    const result: string[] = [];
    this.adapterList.forEach(x => {
      result.push(x.constructor.name);
    });
    return result;
  }

  protected formatedOutput(type: LogType): string {
    let loggerID = '';
    if (this.config.name !== 'root') {
      loggerID = ' [' + this.config.name + ']';
    }
    let stacktrace = '';
    if (this.stackTrace) {
      stacktrace = ' [' + this.getStack() + ']';
    }
    const now = '[' + new Date().toISOString() + ']';
    return now + loggerID + stacktrace + ' [' + LogType[type] + '] ';
  }

  private getStack(): string {
    // stack index defines the first function outside of logger class- could be done dynamical but ...
    const stackIndex = 4;
    const stack = stackTraceParser.parse(new Error().stack);
    return stack[stackIndex].methodName;
  }

  private convertLogLevel(lvl: string): LogLevel {
    return LogLevel[lvl];
  }
}
