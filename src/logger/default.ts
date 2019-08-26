import { LogLevel, LogType } from './logger';
import { Logger } from './logger';

/**
 * Default logger that sends log message to attached adapters to handle actual output.
 */
export class LoggerDefault extends Logger {
  constructor(protected loggerName: string) {
    super(loggerName);
  }

  public debug(...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.DEBUG, ...args);
  }

  public info(...args: any[]) {
    this.log(LogLevel.INFO, LogType.INFO, ...args);
  }

  public warn(...args: any[]) {
    this.log(LogLevel.WARN, LogType.WARN, ...args);
  }

  public error(...args: any[]) {
    this.log(LogLevel.ERROR, LogType.ERROR, ...args);
  }

  public enter(...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.ENTER, ...args);
  }

  public exit(...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.EXIT, ...args);
  }

  private log(lvl: LogLevel, type: LogType, ...args) {
    if (this.enabled && this.level >= lvl) {
      const output = [this.formatedOutput(type), ...args].join('');
      this.adapterList.forEach(e => {
        e.log(lvl, type, output);
      });
    }
  }
}
