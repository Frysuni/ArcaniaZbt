import { Config, ConfigService } from "@app/config";

@Config('ZBT')
export class ZbtConfig {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  public readonly resultChannelId = this.configService.get('RESULT_CHANNEL_ID').required().asString();
  public readonly roleId = this.configService.get('ROLE_ID').required().asString();
  public readonly rconHost = this.configService.get('RCON_HOST').required().asString();
  public readonly rconPort = this.configService.get('RCON_PORT').default(25575).asPortNumber();
  public readonly rconPass = this.configService.get('RCON_PASS').required().asString();
  public readonly rconCommand = this.configService.get('RCON_COMMAND').required().asString();
}
