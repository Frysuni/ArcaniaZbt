import { ConfigModule } from '@app/config';
import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfig } from "./app.config";
import { AppErrorHandler } from "./app.error-handler";
import { AppLogger } from "./app.logger";
import { BotModule } from './core/bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature([AppConfig]),
    ScheduleModule.forRoot(),
    BotModule,
  ],
  providers: [
    AppLogger,
    AppErrorHandler,
  ],
})
export class AppModule { }