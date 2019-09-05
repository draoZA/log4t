import axios from 'axios';
import { LogLevel } from '../helper/logLevel';
import { LogType } from '../helper/logType';
import { ILoggerAdapter, LoggerAdapter } from './adapter';

class LogglyConfig {
  name = 'loggy';
  token = '';
  tag: 'logging-app';
  domain: 'logs-01.loggly.com';
  protocol: 'http' | 'https' = 'http';

  public load(env: any) {
    this.token = (env && env.token) || '';
    this.tag = (env && env.tag) || 'logging-app';
    this.domain = (env && env.domain) || 'logs-01.loggly.com';
    this.protocol = (env && env.protocol) || 'http';
  }
}

export class LogglyAdapter extends LoggerAdapter implements ILoggerAdapter {
  private config: LogglyConfig;
  private url = '';
  private invalidToken = false;
  // http://logs-01.loggly.com/inputs/TOKEN/tag/http/

  constructor() {
    super();
    this.config = new LogglyConfig();
  }

  public initialize(name: string, env: any) {
    super.initialize(name, env);
    this.config.load(env);
    this.url =
      this.config.protocol +
      '://' +
      this.config.domain +
      '/inputs/' +
      this.config.token +
      '/tag/' +
      this.config.tag +
      '/';
    if (this.config.token === '' || this.config.token === 'YOUR_TOKEN') {
      console.warn('WARN - Logger.Adapter.Loggly: no loggly token provided. Adapter has been disabled');
      this.invalidToken = true;
    }
  }

  public log(lvl: LogLevel, type: LogType, message: string) {
    if (!this.invalidToken) {
      axios
        .post(this.url, { level: lvl, logType: type, log: message })
        .then(function(response) {
          // handle success
          //console.log(response.status);
        })
        .catch(function(error) {
          // handle error
          //console.log(error.message);
        });
    }
  }

  public toString(): string {
    return super.toString() + ', token: ' + this.config.token + ', tag: ' + this.config.tag;
  }
}
