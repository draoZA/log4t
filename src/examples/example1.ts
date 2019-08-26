import { LoggerService } from '../logger.service';
import { ILogger, LogLevel } from '../logger/logger';

const env = {
  logging: {
    enabled: true,
    logger: [
      {
        name: 'root',
        level: 'DEBUG',
        adapter: ['console', 'loggly'],
        stacktrace: true,
      },
      {
        name: 'test1',
        level: 'DEBUG',
        adapter: ['consoleOnly'],
      },
      {
        name: 'test2',
        level: 'WARN',
        adapter: 'loggly',
        stacktrace: false,
      },
    ],
    adapter: [
      {
        name: 'loggly',
        token: 'YOUR_TOKEN',
        tag: 'demo-logger',
      },
    ],
  },
};

const loggerService = new LoggerService();

// optionally load some settings
loggerService.initialize(env.logging);

// create some logger with different configs, config loaded via env
const logger: ILogger = loggerService.getLogger();
const logger1: ILogger = loggerService.getLogger('test1');
const logger2: ILogger = loggerService.getLogger('test2');
const logger3: ILogger = loggerService.getLogger('test3');

// this logger wasn't configured
const logger4: ILogger = loggerService.getLogger('test4');
logger4.level = LogLevel.WARN;

doSomeLogging();
someMethod();

function doSomeLogging() {
  logger.debug('here is some message ');
  logger1.info('here is some message test1 ');
  logger2.error('here is some message test2 ');
  logger3.debug('here is some message test3 ');
  logger4.debug('here is some message test4 ');
  logger4.warn('here is some message test4 ');
}

function someMethod() {
  const method = 'someMethod';
  logger.enter(method);
  logger.debug('some debugging in between');
  logger.exit(method);
}
