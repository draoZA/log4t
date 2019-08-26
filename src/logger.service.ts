import { ILoggerAdapter } from './adapter/adapter';
import { ConsoleAdapter } from './adapter/console';
import { ConsoleOnlyAdapter } from './adapter/console-only';
import { LogglyAdapter } from './adapter/loggly';

import { LoggerConsoleOnly } from './logger/console-only';
import { LoggerDefault } from './logger/default';
import { ILogger } from './logger/logger';
import { LoggerConfig } from './logger/loggerConfig'
import { LoggerServiceConfig } from './loggerServiceConfig'


export class LoggerService {
  private loggerList: ILogger[] = new Array();
  private initialized = false;
  private config = new LoggerServiceConfig();
  private adapterList: ILoggerAdapter[] = new Array();
  private CONSOLE_ONLY = 'consoleOnly';

  public initialize(env?: any) {
    this.initialized = true;

    // load config
    this.config.load(env);

    // register some standard adpater (ie make them available)
    this.registerAdapter('console', new ConsoleAdapter());
    this.registerAdapter(this.CONSOLE_ONLY, new ConsoleOnlyAdapter());
    this.registerAdapter('loggly', new LogglyAdapter());

    // check config for any predefined logger & create those
    this.config.logger.forEach(item => {
      this.loggerList.push(this.createLogger(item.name));
    });

    // console.log(this.adapterList);
    // console.log(this.loggerList);
  }

  public getAdapter(name: string): ILoggerAdapter {
    if (!this.initialized) {
      this.initialize();
    }
    const adapter: ILoggerAdapter | undefined = this.adapterList.find(adapt => adapt.name === name);
    if (adapter) {
      return adapter;
    } else {
      throw new Error('LoggerService.getAdapter(' + name + ') - LoggerAdapter not found');
    }
  }

  public registerAdapter(name: string, adapter: ILoggerAdapter): ILoggerAdapter {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.adapterList.find(item => item.name === name) !== undefined) {
      console.log(`LoggerService.registerAdapter -> $(adapter.name) already registered`);
      return adapter;
    }
    adapter.initialize(name, this.config.adapter.find(item => item.name === name));
    console.log('LoggerService.registerAdapter -> ' + adapter.toString());
    this.adapterList.push(adapter);
    return adapter;
  }

  public listAdapter(): Array<ILoggerAdapter> {
    return this.adapterList;
  }

  private createDefaultLogger(name: string): ILogger {
    const logger = new LoggerConsoleOnly(name);
    return logger;
  }

  private createConfiguredLogger(name: string, loggerConfig: LoggerConfig): ILogger {
    if (typeof loggerConfig.adapter === 'string') {
      loggerConfig.adapter = [loggerConfig.adapter];
    }

    // does the adapter list for this logger contain console only?
    const consoleOnly: boolean = loggerConfig.adapter.find(item => item === this.CONSOLE_ONLY) ? true : false;

    // for console only take special class otherwise default is fine
    const logger = consoleOnly ? new LoggerConsoleOnly(name) : new LoggerDefault(name);

    if (consoleOnly) {
      logger.addAdapter(this.getAdapter(this.CONSOLE_ONLY));
    } else {
      loggerConfig.adapter.forEach(x => {
        try {
          logger.addAdapter(this.getAdapter(x));
        } catch (err) {
          // console.warn(err.message);
          let errMsg = 'LoggerService.getLogger(' + name + '): Adapter [' + x + '] ';
          errMsg += 'not registered and can not be added to logger [' + name + ']';
          console.warn(errMsg);
        }
      });
    }
    logger.initialize(loggerConfig);
    return logger;
  }

  private createLogger(name: string): ILogger {
    // find config for this logger name
    const loggerConfig = this.config.logger.find(item => item.name === name);

    const logger = loggerConfig ? this.createConfiguredLogger(name, loggerConfig) : this.createDefaultLogger(name);

    // deactive logger if globally deactived
    if (!this.config.enabled) {
      logger.enabled = false;
    }
    return logger;
  }

  /**
   * Get logger. If logger doesn't exist yet, create new logger.
   * Make sure adpater are registered first.
   * @param name of logger
   */
  public getLogger(name?: string): ILogger {
    if (!this.initialized) {
      this.initialize();
    }

    if (!name) {
      name = 'root';
    }

    // only add logger if not yet exists, otherwise return existing logger
    const logger = this.loggerList.find(item => item.name === name);
    if (logger) {
      return logger;
    } else {
      const newLogger = this.createLogger(name);
      this.loggerList.push(newLogger);
      return newLogger;
    }
  }

  set enabled(val: boolean) {
    this.config.enabled = val;
    this.loggerList.forEach(logger => (logger.enabled = this.config.enabled));
  }

  get enabled() {
    return this.config.enabled;
  }
}
