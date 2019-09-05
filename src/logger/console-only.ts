import { LogLevel } from '../helper/logLevel';
import { LogType } from '../helper/logType';
import { Logger } from './logger';

const noop = (): any => undefined;

/**
 * LoggerConsoleOnly binds console to log methods debug, info etc.
 * Can only log to console. Additional adapters will be ignored.
 * The log method debug returns console and therefore console will output original class and line.
 * But because of that method will never ever see input and therefore can't attach further adapters to it.
 */
export class LoggerConsoleOnly extends Logger {
  constructor(protected loggerName: string) {
    super(loggerName);
  }

  get debug() {
    return this.log(LogLevel.DEBUG, LogType.DEBUG);
  }

  get info() {
    return this.log(LogLevel.INFO, LogType.INFO);
  }

  get warn() {
    return this.log(LogLevel.WARN, LogType.WARN);
  }

  get error() {
    return this.log(LogLevel.ERROR, LogType.ERROR);
  }

  get enter() {
    return this.log(LogLevel.DEBUG, LogType.ENTER);
  }

  get exit() {
    return this.log(LogLevel.DEBUG, LogType.EXIT);
  }

  /**
   * it binds console therefore never received message & can't prepare it
   * @param lvl
   * @param type 
   */
  private log(lvl: LogLevel, type: LogType) {
    if (this.enabled && this.level >= lvl) {
      const output = this.formatedOutput(type);
      let logFn: Function = console[LogType[type].toLowerCase()] || console.log;
      if (type === LogType.DEBUG) {
        logFn = console.log;
      }
      return logFn.bind(console, output);
    }
    return noop;
  }
}
