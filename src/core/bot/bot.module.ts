import { Module } from "@nestjs/common";
import { ZbtModule } from "./zbt/zbt.module";

@Module({
  imports: [
    ZbtModule,
  ],
})
export class BotModule {}
