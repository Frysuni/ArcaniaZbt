import { Injectable } from '@nestjs/common';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Button, ButtonContext, Context } from 'necord';
import { ZbtService } from '../zbt.service';

@Injectable()
export class AcceptButton {
  constructor(
    private readonly zbtService: ZbtService,
  ) {}

  private static id = `ZBT_ACCEPT_BUTTON`;
  public static builder = () => new ButtonBuilder()
    .setCustomId(AcceptButton.id)
    .setStyle(ButtonStyle.Success)
    .setEmoji('✅')
    .setLabel('Принять');

  @Button(AcceptButton.id)
  public async onButton(@Context() [interaction]: ButtonContext) {
    interaction.deferUpdate();
    return this.zbtService.acceptRequest(interaction.message, interaction.user);
  }
}