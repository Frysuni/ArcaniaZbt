import { createSignalManager } from '@app/common/signal.manager';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Events, Guild } from 'discord.js';
import { ContextOf, Once } from 'necord';

@Injectable()
export class DiscordService {
  public readonly readyClient = createSignalManager<Client<true>>();
  public readonly guild = createSignalManager<Guild>();

  constructor(
    private readonly client: Client,
  ) {}

  private readonly logger = new Logger(DiscordService.name);

  @Once(Events.ClientReady)
  protected async onReady([client]: ContextOf<Events.ClientReady>): Promise<any> {
    this.client;

    this.client.guilds.fetch().then(guilds => {
      if (guilds.size == 0) {
        this.logger.fatal('Бот должен находиться в гильдии для начала работы!');
        process.exit(1);
      }
      if (guilds.size > 1) {
        this.logger.fatal('Бот не может находиться более чем в одной гильдии!');
        process.exit(1);
      }

      this.logger.log(`Бот ${this.client.user?.tag} запущен!`);
    });

    new Logger().log(
      '\x1b[35mРазработано специально для Arcania (August 2024)\x1b[0m',
      'AuthorFrys',
    );

    this.readyClient.resolve(client);
    const guild = client.guilds.cache.first()!;
    this.guild.resolve(guild);
  }
}
