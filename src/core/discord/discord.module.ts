import { AppConfig } from '@app/app.config';
import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { DiscordConfig } from './discord.config';
import { DiscordService } from './discord.service';
import { ClearCommandsCommand } from './utils/clear-commands.command';
import { GetAdminService } from './utils/get-admin.service';

@Module({
  imports: [
    ConfigModule.forFeature([DiscordConfig, AppConfig]),
    NecordModule.forRootAsync({
      imports: [ConfigModule.forFeature([DiscordConfig, AppConfig])],
      useClass: DiscordConfig,
    }),
  ],
  providers: [
    DiscordService,

    // dev
    ...(ConfigModule.getConfig(AppConfig).devMode ? [
      GetAdminService,
      ClearCommandsCommand,
    ] : []),
  ],
  exports: [
    DiscordService,
  ],
})
export class DiscordModule {}
