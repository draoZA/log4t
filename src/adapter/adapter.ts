import { LogLevel, LogType } from '../logger/logger';

/**
 * Logging adapters/appenders. Initialize first!
 */
export interface ILoggerAdapter {
  name: string;
  initialize(name: string, env: any): void;
  log(lvl: LogLevel, type: LogType, message: string): void;
  toString(): string;
}

export abstract class LoggerAdapter implements ILoggerAdapter {
  private _name = '';
  protected service: any;
  protected env: any;

  public initialize(name: string, env: any) {
    this._name = name;
    this.env = env;
  }

  public abstract log(lvl: LogLevel, type: LogType, message: string): void;

  public toString() {
    return 'LoggerAdapter: ' + this.constructor.name + ', name:' + this._name;
  }

  get name(): string {
    return this._name;
  }

  set name(val: string) {
    this._name = val;
  }
}
