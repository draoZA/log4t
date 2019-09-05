import { LogLevel } from '../helper/logLevel';
import { LogType } from '../helper/logType';
import { Logger } from './logger';

/**
 * Default logger that sends log message to attached adapters to handle actual output.
 */
export class LoggerDefault extends Logger {
  constructor(protected loggerName: string) {
    super(loggerName);
  }

  public debug(message: any, ...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.DEBUG, message, ...args);
  }

  public info(message: any,...args: any[]) {
    this.log(LogLevel.INFO, LogType.INFO, message, ...args);
  }

  public warn(message: any,...args: any[]) {
    this.log(LogLevel.WARN, LogType.WARN, message, ...args);
  }

  public error(message: any,...args: any[]) {
    this.log(LogLevel.ERROR, LogType.ERROR, message, ...args);
  }

  public enter(message: any,...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.ENTER, message, ...args);
  }

  public exit(message: any,...args: any[]) {
    this.log(LogLevel.DEBUG, LogType.EXIT, message, ...args);
  }

  private log(lvl: LogLevel, type: LogType, message: string, ...args: any[]) {
    if (this.enabled && this.level >= lvl) {

      // convert message to string
      message = this.prepareMessage(message);

      // only use validated parameters for HTTP requests
      const validatedAdditionalParameters = this.prepareAdditionalParameters(args);
      
      // merge all into one message string
      const output = [this.formatedOutput(type), message, ...validatedAdditionalParameters].join('');
      
      this.adapterList.forEach(e => {
          e.log(lvl, type, output);
      });
    }
  }

}

