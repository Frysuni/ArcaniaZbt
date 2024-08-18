import { Injectable } from '@nestjs/common';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Button, ButtonContext, Context } from 'necord';
import { DenyModal } from '../modals/deny.modal';

@Injectable()
export class DenyButton {
  private static id = `ZBT_DENY_BUTTON`;
  public static builder = () => new ButtonBuilder()
    .setCustomId(DenyButton.id)
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🛑')
    .setLabel('Отклонить');

  @Button(DenyButton.id)
  public async onButton(@Context() [interaction]: ButtonContext) {
    const formId = interaction.message.embeds[0].data.title?.split(' ')[2];
    interaction.showModal(DenyModal.builder(formId || '#NotFound'));
  }
}
