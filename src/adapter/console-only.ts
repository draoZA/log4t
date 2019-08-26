import { LogLevel, LogType } from '../logger/logger';
import { ILoggerAdapter, LoggerAdapter } from './adapter';

export class ConsoleOnlyAdapter extends LoggerAdapter implements ILoggerAdapter {
  constructor() {
    super();
  }

  public log(lvl: LogLevel, type: LogType, message: string) {
    // not used, implemented directly in loggerConsoleOnly class as special case
  }
}
