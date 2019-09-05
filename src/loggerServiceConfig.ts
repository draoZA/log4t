import { LoggerConfig } from './helper/loggerConfig';

export class LoggerServiceConfig {
  public enabled = true;
  public logger: LoggerConfig[] = [];
  public adapter = [];

  public load(env: any) {
    this.enabled = env && env.enabled !== undefined ? env.enabled : true;
    this.logger = (env && env.logger) || [];
    this.adapter = (env && env.adapter) || [];
  }
}
