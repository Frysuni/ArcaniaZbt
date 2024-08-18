import { CacheModule } from "@app/cache";
import { ConfigModule } from "@app/config";
import { DiscordModule } from "@app/core/discord/discord.module";
import { Module } from "@nestjs/common";
import { AcceptButton } from "./buttons/accept.button";
import { DenyButton } from "./buttons/deny.button";
import { RequestButton } from "./buttons/request.button";
import { SkipButton } from "./buttons/skip.button";
import { ZbtInitCommand } from "./commands/zbt-init.command";
import { DenyModal } from "./modals/deny.modal";
import { FormModal } from "./modals/form.modal";
import { ZbtConfig } from "./zbt.config";
import { ZbtService } from "./zbt.service";

@Module({
  imports: [
    ConfigModule.forFeature([ZbtConfig]),
    DiscordModule,
    CacheModule,
  ],
  providers: [
    ZbtService,
    ZbtInitCommand,
    FormModal,
    RequestButton,
    AcceptButton,
    SkipButton,
    DenyButton,
    DenyModal,
  ],
})
export class ZbtModule {}
