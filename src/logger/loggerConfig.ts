import { LogLevel} from './logger';

export class LoggerConfig {
    public name = '';
    public level: LogLevel = LogLevel.DEBUG;
    public adapter: string[];
    public stacktrace = false;
    public enabled = true;
  
    public load(env: any) {
      // this.name = env && env.name || 'root';
      this.level = this.str2Level((env && env.level) || LogLevel.DEBUG);
      this.adapter = (env && env.adapter) || [];
      if (typeof this.adapter === 'string') {
        this.adapter = [this.adapter];
      }
      this.stacktrace = env && env.stacktrace !== undefined ? env.stacktrace : false;
      this.enabled = env && env.enabled !== undefined ? env.enabled : true;
    }
  
    private str2Level(lvl: string | LogLevel): LogLevel {
      return typeof lvl === 'number' ? lvl : LogLevel[lvl];
    }
  }