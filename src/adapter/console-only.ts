import { LogLevel } from '../helper/logLevel';
import { LogType } from '../helper/logType';
import { ILoggerAdapter, LoggerAdapter } from './adapter';

export class ConsoleOnlyAdapter extends LoggerAdapter implements ILoggerAdapter {
  constructor() {
    super();
  }

  public log(lvl: LogLevel, type: LogType, message: string) {
    // not used, implemented directly in loggerConsoleOnly class as special case
  }
}
