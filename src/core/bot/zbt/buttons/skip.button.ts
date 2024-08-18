import { Injectable } from '@nestjs/common';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Button, ButtonContext, Context } from 'necord';
import { ZbtService } from '../zbt.service';

@Injectable()
export class SkipButton {
  constructor(
    private readonly zbtService: ZbtService,
  ) {}

  private static id = `ZBT_SKIP_BUTTON`;
  public static builder = () => new ButtonBuilder()
    .setCustomId(SkipButton.id)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('Ничего не делать');

  @Button(SkipButton.id)
  public async onButton(@Context() [interaction]: ButtonContext) {
    interaction.deferUpdate();
    return this.zbtService.skipRequest(interaction.message, interaction.user);
  }
}
