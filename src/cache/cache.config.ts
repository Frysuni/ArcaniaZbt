import { AppConfig } from "@app/app.config";
import { Config, ConfigService } from "@app/config";
import { CacheModuleOptions } from "./types/cache-module-options.type";

@Config('REDIS')
export class CacheConfig implements CacheModuleOptions {
  constructor(
    private readonly configService: ConfigService,
    private readonly appConfig: AppConfig,
  ) { }

  public readonly host = this.configService.get('HOST').required().asString();
  public readonly port = this.configService.get('PORT').default(6379).asPortNumber();
  public readonly username = this.configService.get('USERNAME').asString();
  public readonly password = this.configService.get('PASSWORD').asString();
  public readonly db = this.configService.get('DATABASE').asInt();
  public readonly connectionName = this.appConfig.name;
  public readonly keyPrefix = this.appConfig.name.toUpperCase() + '_' as CacheModuleOptions['keyPrefix'];
  public readonly retryStrategy = () => 5000;
  public readonly reconnectOnError = (): 2 => 2;
  public readonly commandQueue = true;
}
