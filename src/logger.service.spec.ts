import { ILoggerAdapter } from './adapter/adapter';
import { LoggerService } from './logger.service';
import { LogLevel, LogType } from './logger/logger';

// tslint:disable-next-line: no-console

// add your loggly token here
const logglyToken = 'YOUR_TOKEN';

class DummyAdapter implements ILoggerAdapter {
  public name: string;

  public initialize(name: string, env: any): void {
    this.name = name;
  }

  public log(lvl: LogLevel, type: LogType, message: string): void {
    console.log(message);
  }

  public toString() {
    return 'LoggerAdapter: ' + this.constructor.name + ', name:' + this.name;
  }
}

const TEST_ENV_FULL = {
  enabled: true,
  logger: [
    {
      name: 'root',
      level: 'DEBUG',
      adapter: ['console', 'loggly', 'dummy'],
      stacktrace: true,
    },
    {
      name: 'test1',
      level: 'DEBUG',
      adapter: ['consoleOnly', 'console'],
    },
    {
      name: 'test2',
      level: 'WARN',
      adapter: 'console',
      stacktrace: false,
    },
    {
      name: 'test3',
      enabled: false,
      adapter: ['console', 'loggly'],
    },
  ],
  adapter: [
    {
      name: 'loggly',
      token: logglyToken,
      tag: 'demo-logger',
    },
  ],
};

const TEST_ENV_NO_CONFIG = {};

const TEST_ENV_NO_LOGGER = {
  adapter: [
    {
      name: 'loggly',
      token: logglyToken,
      tag: 'demo-logger',
    },
  ],
};

const TEST_ENV_NO_ADAPTER = {
  logger: [
    {
      name: 'root',
      level: 'DEBUG',
      adapter: ['console', 'loggly', 'dummy'],
      stacktrace: true,
    },
    {
      name: 'test1',
      level: 'DEBUG',
      adapter: ['consoleOnly', 'console'],
    },
  ],
};

describe('LoggerService: Creation', () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
  });

  afterEach(() => {
    loggerService = null;
  });

  it('LoggerService should be created', () => {
    expect(loggerService).toBeTruthy();
  });

  it('loggerService used without config and 3 default logger created', () => {
    const logger = loggerService.getLogger();
    expect(loggerService.enabled).toBeTruthy();
    expect(loggerService.listAdapter().length).toBe(3);
  });

  it('full config should be accepted and 3 default logger created', () => {
    loggerService.initialize(TEST_ENV_FULL);
    expect(loggerService.enabled).toBeTruthy();
    expect(loggerService.listAdapter().length).toBe(3);
  });

  it('empty config should be accepted and 3 default logger created', () => {
    loggerService.initialize(TEST_ENV_NO_CONFIG);
    expect(loggerService.enabled).toBeTruthy();
    expect(loggerService.listAdapter().length).toBe(3);
  });

  it('no logger config should be accepted and 3 default logger created', () => {
    loggerService.initialize(TEST_ENV_NO_LOGGER);
    expect(loggerService.enabled).toBeTruthy();
    expect(loggerService.listAdapter().length).toBe(3);
  });

  it('no adapter config should be accepted and 3 default logger created', () => {
    loggerService.initialize(TEST_ENV_NO_ADAPTER);
    expect(loggerService.enabled).toBeTruthy();
    expect(loggerService.listAdapter().length).toBe(3);
  });

  it('new custom adapter registered successfully', () => {
    loggerService.initialize(TEST_ENV_NO_ADAPTER);
    loggerService.registerAdapter('dummy', new DummyAdapter());
    const adapterList = loggerService.listAdapter();
    expect(adapterList).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          name: 'dummy',
        }),
      ]),
    );
  });
});

describe('LoggerService: Logger', () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
  });

  afterEach(() => {
    loggerService = null;
  });

  it('get root logger', () => {
    const logger = loggerService.getLogger();
    expect(logger.name).toBe('root');
  });

  it('get root logger with config', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const logger = loggerService.getLogger();
    expect(logger.name).toBe('root');
  });

  it('get custom logger ', () => {
    const logger = loggerService.getLogger('dummy');
    expect(logger.name).toBe('dummy');
  });

  it('get custom logger with config', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const logger = loggerService.getLogger('dummy');
    expect(logger.name).toBe('dummy');
  });

  it('change log level should change log level', () => {
    const logger = loggerService.getLogger();
    logger.level = LogLevel.WARN;
    expect(logger.level).toBe(LogLevel.WARN);
  });

  it('add console and loggly adapter should have both adapters attached', () => {
    const adapter1 = loggerService.getAdapter('console');
    const adapter2 = loggerService.getAdapter('loggly');
    const logger = loggerService
      .getLogger('someNewLogger')
      .addAdapter(adapter1)
      .addAdapter(adapter2);
    const adapterList = logger.getAdapterList();
    expect(adapterList).toEqual(['ConsoleAdapter', 'LogglyAdapter']);
  });

  it('logger has adapter gotten console and loggly via env', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const logger = loggerService.getLogger();
    const adapterList = logger.getAdapterList();
    expect(adapterList).toEqual(['ConsoleAdapter', 'LogglyAdapter']);
  });

  it('logger has gotten adapter console via env', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const logger = loggerService.getLogger('test2');
    const adapterList = logger.getAdapterList();
    expect(adapterList).toEqual(['ConsoleAdapter']);
  });

  it('logger has gotten adapter consoleOnly via env', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const logger = loggerService.getLogger('test1');
    const adapter = logger.getAdapterList();
    expect(adapter).toEqual(jasmine.arrayContaining(['ConsoleOnlyAdapter']));
  });

  it('logger has gotten custom adapter via adapter registration', () => {
    loggerService.initialize(TEST_ENV_FULL);
    const adapter = loggerService.registerAdapter('dummy', new DummyAdapter());
    const logger = loggerService.getLogger('someNewLogger').addAdapter(adapter);
    const adapterList = logger.getAdapterList();
    expect(adapterList).toEqual(jasmine.arrayContaining(['DummyAdapter']));
  });
});

describe('LoggerService: Message Log with runtime loggers', () => {
  let loggerService: LoggerService;
  let originalLogFunc, originalWarnFunc: any;
  let logger: any;

  beforeEach(() => {
    loggerService = new LoggerService();
    originalLogFunc = console.log;
    originalWarnFunc = console.warn;
    console.log = jasmine.createSpy('log');
    console.warn = jasmine.createSpy('warn');
  });

  afterEach(() => {
    loggerService = null;
    logger = null;
    console.log = originalLogFunc;
    console.warn = originalWarnFunc;
    originalLogFunc = undefined;
    originalWarnFunc = undefined;
  });

  it('root logger - debug: debug message shown', () => {
    logger = loggerService.getLogger();
    logger.debug('message');
    expect(console.log).toHaveBeenCalled();
  });

  it('root logger - debug: warn message shown', () => {
    logger = loggerService.getLogger();
    logger.warn('message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('root logger - warn: warn message shown', () => {
    logger = loggerService.getLogger();
    logger.level = LogLevel.WARN;
    logger.warn('message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('custom logger - debug: debug message shown', () => {
    logger = loggerService.getLogger('dummy');
    logger.debug('message');
    expect(console.log).toHaveBeenCalled();
  });
});

describe('LoggerService: Message Log with different config options ', () => {
  let loggerService: LoggerService;
  let originalLogFunc, originalWarnFunc: any;
  let logger: any;

  beforeEach(() => {
    loggerService = new LoggerService();
    loggerService.initialize(TEST_ENV_FULL);
    originalLogFunc = console.log;
    originalWarnFunc = console.warn;
    console.log = jasmine.createSpy('log');
    console.warn = jasmine.createSpy('warn');
  });

  afterEach(() => {
    loggerService = null;
    logger = null;
    console.log = originalLogFunc;
    console.warn = originalWarnFunc;
    originalLogFunc = undefined;
    originalWarnFunc = undefined;
  });

  it('console - debug: debug message shown', () => {
    logger = loggerService.getLogger();
    logger.debug('message');
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('[DEBUG]'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('console - debug: warn message shown', () => {
    logger = loggerService.getLogger();
    logger.warn('message');
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('[WARN]'));
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('object logged', () => {
    logger = loggerService.getLogger();
    const obj = {
      prop1: 1,
      prop2: 'test'
    }
    logger.debug(obj);
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('[DEBUG]'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('"prop1": 1'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('"prop2": "test"'));
  });

  it('number logged', () => {
    logger = loggerService.getLogger();
    logger.debug(1);
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('[DEBUG]'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('1'));
  });

  it('boolean logged', () => {
    logger = loggerService.getLogger();
    logger.debug(false);
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('[DEBUG]'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('false'));
  });

  it('error logged', () => {
    logger = loggerService.getLogger();
    const err = new Error('test');
    logger.debug(err);
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('[DEBUG]'));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching('Error: test'));
  });


  it('loggly - debug: debug message logged', () => {
    logger = loggerService.getLogger();
    const adapter = loggerService.getAdapter('loggly');
    const spy = spyOn(adapter, 'log');
    logger.debug('message');
    expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG, LogType.DEBUG, jasmine.stringMatching('[DEBUG]'));
    expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG, LogType.DEBUG, jasmine.stringMatching('message'));
  });

  it('console - warn: debug message not shown', () => {
    logger = loggerService.getLogger('test2');
    logger.log('message');
    expect(console.log).not.toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('console - warn: warn message shown', () => {
    logger = loggerService.getLogger('test2');
    logger.warn('message');
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('console - warn: warn message shown', () => {
    logger = loggerService.getLogger('test2');
    logger.warn('message');
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('consoleOnly - debug: debug message shown', () => {
    logger = loggerService.getLogger('test1');
    logger.warn('message');
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching('[WARN]'), jasmine.stringMatching('message'));
  });

  it('console - disabled: no message shown', () => {
    logger = loggerService.getLogger('test3');
    logger.warn('message');
    expect(console.warn).not.toHaveBeenCalledWith(jasmine.stringMatching('message'));
  });

  it('enter method called: enter message shown', () => {
    logger = loggerService.getLogger();
    const adapter = loggerService.getAdapter('console');
    const spy = spyOn(adapter, 'log');
    logger.enter('message');
    expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG, LogType.ENTER, jasmine.stringMatching('message'));
  });

  it('exit method called: enter message shown', () => {
    logger = loggerService.getLogger();
    const adapter = loggerService.getAdapter('console');
    const spy = spyOn(adapter, 'log');
    logger.exit('message');
    expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG, LogType.EXIT, jasmine.stringMatching('message'));
  });

  it('stacktrace enabled: message with stacktrace shown', () => {
    logger = loggerService.getLogger();
    const adapter = loggerService.getAdapter('console');
    const spy = spyOn(adapter, 'log');
    logger.debug('message');
    expect(logger.stackTrace).toBeTruthy();
    // regex 3x [] ... [time] [stack] [DEBUG] instead of 3x
    /*
      /^([^,]*,){3}[^,]*$/
       ^     Start of string
      (     Start of group
      [^,]* Any character except comma, zero or more times
      ,     A comma
      ){3} End and repeat the group 3 times
      [^,]* Any character except comma, zero or more times again
      $     End of string
      use \[ instead of ,]
    */
    //const regex = /^([^,]*,){3}[^,]*$/;
    const regex = /^([^\[]*\[){3}[^\[]*$/;
    expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG, LogType.DEBUG, jasmine.stringMatching(regex));
  });

  it('stacktrace disabled: message without stacktrace shown', () => {
    logger = loggerService.getLogger();
    logger.stackTrace = false;
    const adapter = loggerService.getAdapter('console');
    const spy = spyOn(adapter, 'log');
    logger.warn('message');
    expect(logger.stackTrace).toBeFalsy();
    // regex 2x [] ... [time] [DEBUG] instead of 3x as [class] is missing
    const regex = /^([^\[]*\[){2}[^\[]*$/;
    expect(spy).toHaveBeenCalledWith(LogLevel.WARN, LogType.WARN, jasmine.stringMatching(regex));
  });
});
