# Log4t - a Simple Logger for Typescript

Simple logger for Javascript/Typescript. Also tested with Ionic/Angular.

Features:
- Supports out of the box console output and loggly for remote logging. 
- Logger can be used with node & web apps. Remote access done via Axios
- You can easily add custom adapters if required. Only need to implement the actual logging method. Rest can be inherited from default. Examples available.
- Support for multiple loggers with different configs. Allows for example to only enable logging in certain sections of the app and not getting spammed by all log messages :-)
- Convience method to log entering and exiting of methods/functions
- Allows to log callee function, ie where the log message was called
- Console log supports bind which then shows exact location of call in console - like you would have used console.log etc
- Remote logging supported via Axios

Several examples and config description below should make usage easy. Also adding custom adapters for other (remote) log services should be fairly straight forward. 

ENJOY! :-)

## Example

#### Basic usage example

Basic logger without any specific configuration.

```javascript
import { LoggerService, ILogger, LogLevel } from 'log4t';
const logger: ILogger = new LoggerService().getLogger();
logger.debug('Hello world!');
logger.warn('oh oh, some wrong?');

const demo = {
    prop1: 13,
    prop2: 'tester'
  };
const err = new Error('some error');
logger.debug(demo);
logger.debug(13);
logger.debug(false);
logger.error(err);
```

#### Add extra logger

You can use different logger. Like one logger you use in general and one in your services. You can then enabled/disable etc them separately. The logger are complete separate. But you can still turn off logging globally.

```javascript
const loggerService = new LoggerService();
const logger: ILogger = loggerService.getLogger();
const logger1: ILogger = loggerService.getLogger('services');
logger.debug('main logger');
logger.debug('another logger');
```

#### Enter/Exit methods

With enter and exit you can easier log method start & end. It will default to log level DEBUG. Example below.

```javascript
function someMethod() {
  const method = 'someMethod';
  logger.enter(method);
  logger.debug('some debugging in between');
  logger.exit(method);
}
```
#### Integration into Ionic/Angular

If you want to use the logger inside a framework like Ionic or Angular rember to use the logger as singleton. Easiest is to create a new "wrapper" service. Then provide that service in app.module. Then you can use the logger in your project. 

Example for Ionic (but same/similar for Angular):
1) generate new service: ionic g service services/logger/logger (adjust directory structure to your needs)
2) add LoggerService into providers of app.module (like you would do with any self generated services)
3) add log4t into the newly generated

```javascript
import { Injectable } from '@angular/core';
import { LoggerService as LoggerS, ILogger} from 'log4t';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

public logger: ILogger = new LoggerS().getLogger();

  constructor() {
    this.logger.debug('LoggerService initialized');
  }

}
```
4) reference LoggerService within your project

```javascript
import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../services/logger/logger.service';

@Component({
  selector: 'dummy',
  templateUrl: './dummy.page.html',
  styleUrls: ['./dummy.page.scss'],
})
export class DummyPage implements OnInit {

private log = this.logger.logger;

  constructor(private logger: LoggerService) { }

  ngOnInit() {
    this.log.debug('DummyPage init');
  }

}
```
To avoid writing this.logger.logger.debug() I added a convience variable log = this.logger.logger. So you only write this.log.debug()


## Configuration

#### LoggerService
- enable: **enable**/disable ALL logger
- logger: add logger 
- adapter: add adapter settings

#### Logger
- name: your logger name -> getLogger('your logger name'). there will always be default logger ("root") that can be retrieved via getLogger()
- enable: **true**/false - enable/disable logger
- level: log level (ALL, **DEBUG**, INFO, WARN, ERROR, OFF)
- stacktrace: true/**false** - will method that called logger
- adapter: array of adapter to add to that logger

#### Usage

```javascript
const loggerService = new LoggerService();
const logger: ILogger = loggerService.getLogger();
logger.level = LogLevel.WARN;
logger.enabled = false;
logger.stacktrace = true;
```

#### Example JSON

```javascript
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
```

#### How to pass configuration


You can change settings at run time or alternatively startup with config. 

```javascript
const loggerService = new LoggerService();
const logger: ILogger = loggerService.getLogger();
logger.level = LogLevel.WARN;
logger.debug('main logger'); // won't show
```

If you want to load your own settings you will need to do that before getting the first logger. Otherwise defaults will be loaded.

```javascript
const loggerService = new LoggerService();

// optionally load some settings
loggerService.initialize(env.logging);

// now get logger
const logger: ILogger = loggerService.getLogger();

```

## Adapter

By default you will console and loggly adapter available. you can add your own adapter anytime. 

#### Console

adapter names:
- console
- consoleOnly

Console offers two different adapters. **consoleOnly** is the default adapter. It will bind console.log. This has the advantage that by default console output will include caller and row number. But because it binds console.log consoleOnly can't be combined with any other adapter.

If you want to output to two different adapters at the same time you will need to choose **console** instead. If you enabled stacktrace option the logger will try to read caller from error stacktrace.

You could have a development setup logging to consoleOnly and a production setup logging to loggly only - and switch via usual environment between both.

#### loggly

adapter name: loggly

Loggly will log to the loggly service. As minimum configuration you will need to pass your loggly token.

Options with defaults:

```javascript
  token = '';
  tag: 'logging-app';
  domain: 'logs-01.loggly.com';
  protocol: 'http' | 'https' = 'http';
```

The actual options you will need to pass in the configration to loggerService at startup (see above).


#### Custom Adapter

To add your own adapter implement ILoggerAdapter. Also feel free to extend LoggerAdapter to inherit some basic functionally. That way you can focus on the log method that does the actual logging. The method will only be called if log level hasn't be filtered out. This is done by logger. So in adapter you can focus on actual logging output.

You will receive current log level, which method was called (debug, enter, ...) and the log message

```javascript
import { LogLevel, LogType, ILoggerAdapter, LoggerAdapter } from 'log4t';


export class YourAdapter extends LoggerAdapter implements ILoggerAdapter {
  constructor() {
    super();
  }

  public log(lvl: LogLevel, type: LogType, message: string) {
    // do your logging here. 
  }
}
```

Then first register your adapter at the logger service. Afterwards you can add it to the logger you use. See example below.

```javascript
const adapter = loggerService.registerAdapter('yourname', new YourAdapter());
const logger = loggerService.getLogger().addAdapter(adapter);
```
