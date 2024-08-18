import { Config, ConfigService } from '@app/config';

@Config('APP')
export class AppConfig {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  public readonly devMode = this.configService.get('DEV-MODE').default('false').asBoolStrict() || false;
  public readonly name = this.configService.get('NAME').required().asString().toUpperCase().replaceAll(' ', '_');
}
