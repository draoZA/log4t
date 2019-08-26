import { LogLevel, LogType } from '../logger/logger';
import { ILoggerAdapter, LoggerAdapter } from './adapter';

export class ConsoleAdapter extends LoggerAdapter implements ILoggerAdapter {
  constructor() {
    super();
  }

  public log(lvl: LogLevel, type: LogType, message: string) {
    let logFn: Function = console[LogType[type].toLowerCase()] || console.log;
    if (type === LogType.DEBUG) {
      logFn = console.log;
    }
    logFn(message);
  }
}
