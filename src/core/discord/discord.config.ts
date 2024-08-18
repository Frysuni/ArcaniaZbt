import { AppConfig } from '@app/app.config';
import { Config, ConfigService } from '@app/config';
import { ActivityType, GatewayIntentBits, Partials } from 'discord.js';
import { NecordModuleOptions } from 'necord';

@Config('DISCORD')
export class DiscordConfig {
  constructor(
    private readonly configService: ConfigService,
    private readonly appConfig: AppConfig,
  ) {}

  public readonly botToken = this.configService.get('BOT-TOKEN').required().asString();
  public readonly devGuildId = this.configService.get('DEV-GUILD-ID').asString();

  public createNecordOptions(): NecordModuleOptions | Promise<NecordModuleOptions> {
    const intents: GatewayIntentBits[] = [
      // GatewayIntentBits.AutoModerationConfiguration,
      // GatewayIntentBits.AutoModerationExecution,
      // GatewayIntentBits.DirectMessageReactions,
      // GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessages,
      // GatewayIntentBits.GuildVoiceStates,
      // GatewayIntentBits.GuildEmojisAndStickers,
      // GatewayIntentBits.GuildIntegrations,
      // GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildMembers, // Required by Privileged Intents
      // GatewayIntentBits.GuildMessageReactions,
      // GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildModeration,
      // GatewayIntentBits.GuildPresences, // Required by Privileged Intents
      // GatewayIntentBits.GuildScheduledEvents,
      // GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.Guilds,
      // GatewayIntentBits.MessageContent, // Required by Privileged Intents
    ];

    const partials: Partials[] = [
      // Partials.Channel,
      // Partials.GuildMember,
      // Partials.GuildScheduledEvent,
      // Partials.Message,
      // Partials.Reaction,
      // Partials.ThreadMember,
      // Partials.User,
    ];

    if (this.appConfig.devMode) {
      intents.push(
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      );
    }

    return {
      token: this.botToken,
      intents,
      partials,
      development: false,
      prefix: '!',
      allowedMentions: {
        parse: [
          'everyone',
          'roles',
          'users',
        ],
        repliedUser: true,
      },
      presence: this.appConfig.devMode
        ? { status: 'online', activities: [{ name: 'Im ready for tests!', type: ActivityType.Custom }] }
        : { status: 'invisible' },
    };
  }
}
