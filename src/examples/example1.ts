import { LogLevel } from '../helper/logLevel';
import { LoggerService } from '../logger.service';
import { ILogger} from '../logger/logger';


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


// this logger wasn't configured
const logger4: ILogger = loggerService.getLogger('test4');
logger4.level = LogLevel.WARN;

doSomeLogging(logger);
doSomeLogging(logger1);
doSomeLogging(logger2);
someMethod(logger);
enhancedLogging(logger);
enhancedLogging(logger1);

function doSomeLogging(logger: ILogger) {
  console.log(`logger: ${logger.name}, current log level: ${LogLevel[logger.level]}, logger enabled: ${logger.enabled}, adapter: ${logger.getAdapterList()}`);
  logger.debug('debug message');
  logger.info('info message');
  logger.warn('warn message');
  logger.error('error message');
}

function someMethod(logger: ILogger) {
  const method = 'someMethod';
  logger.enter(method);
  logger.debug('some debugging in between');
  logger.exit(method);
}

function enhancedLogging(logger: ILogger) {
  const demo = {
    prop1: 13,
    prop2: 'tester'
  };
  const err = new Error('some error');
  logger.debug(demo);
  logger.debug(13);
  logger.debug(false);
  logger.error(err);
  logger.debug(err.message);
}
