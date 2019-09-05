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
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  enter(message: any, ...args: any[]): void;
  exit(message: any, ...args: any[]): void;
  initialize(env: any): void;
  addAdapter(adapter: ILoggerAdapter): ILogger;
  getAdapterList(): string[];
  resetAdapter(): void;
}

export abstract class Logger implements ILogger {

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
  // private dateTimeFormat = '[yyyy-MM-dd HH:mm:ss:SSS]';
  protected config: LoggerConfig;

  protected adapterList: ILoggerAdapter[];

  constructor(protected loggerName: string) {
    this.config = new LoggerConfig();
    this.config.name = loggerName;
    this.adapterList = new Array();
  }

  public abstract debug(message: any, ...args: any[]): void;
  public abstract info(message: any, ...args: any[]): void;
  public abstract warn(message: any, ...args: any[]): void;
  public abstract error(message: any, ...args: any[]): void;
  public abstract enter(message: any, ...args: any[]): void;
  public abstract exit(message: any, ...args: any[]): void;

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

  /**
   * inspired by ngx-logger
   * @param message 
   */
  protected prepareMessage(message:any): string {

    message = typeof message === 'function' ? message() : message;
    message = message instanceof Error ? message.stack : message;
    // message = message instanceof Error ? message.message : message;

    try {
      if (typeof message !== 'string' && !(message instanceof Error)) {
        message = JSON.stringify(message, null, 2);
      }
    } catch (e) {
      // additional = [message, ...additional];
      message = 'The provided "message" value could not be parsed with JSON.stringify().';
    }

    return message;
  }
  
  
  /**
   * inspired by ngx-logger
   * @param message 
   */
  protected prepareAdditionalParameters(additional: any[]) {
    if (additional === null || additional === undefined) {
      return null;
    }

    return additional.map((next, idx) => {
      try {
        // We just want to make sure the JSON can be parsed, we do not want to actually change the type
        if (typeof next === 'object') {
          JSON.stringify(next);
        }

        return next;
      } catch (e) {
        return `The additional[${idx}] value could not be parsed using JSON.stringify().`;
      }
    });
  }

  /**
   * 
   * @param type add timestamp and deub level plus optional caller
   */
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
