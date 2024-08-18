import { ConfigService } from "../config.service";

export interface ConfigType<T = any> extends Function {
  new (configService: ConfigService | never, ...args: any[]): T;
  readonly [key: string]: any;
}
