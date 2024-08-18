import { CacheService } from '@app/cache';
import { Injectable } from '@nestjs/common';
import { ButtonBuilder, ButtonStyle, inlineCode } from 'discord.js';
import { Button, ButtonContext, Context } from 'necord';
import { FormModal } from '../modals/form.modal';

@Injectable()
export class RequestButton {

  constructor(
    private readonly cacheService: CacheService,
  ) {}

  private static id = `ZBT_REQUEST_BUTTON`;
  public static builder = () => new ButtonBuilder()
    .setCustomId(RequestButton.id)
    .setEmoji('🤖')
    .setStyle(ButtonStyle.Success)
    .setLabel('Подать заявку');

  @Button(RequestButton.id)
  public async onButton(@Context() [interaction]: ButtonContext) {
    const status = await this.cacheService.get<
      { sended?: boolean, accepted?: boolean, deniedUntil?: boolean, deniedReason?: string }
    >(`ZBT_FORMS_STATUS_${interaction.user.id}`, { withoutKeyPrefix: true });

    if (status && status.accepted) return interaction.reply({
      ephemeral: true,
      content: `Ваша заявка уже была одобрена.`,
    });
    if (status && status.deniedUntil) return interaction.reply({
      ephemeral: true,
      content:
        `Ваша заявка была отклонена.` +
        `${status.deniedReason ? '\nПричина: ' + inlineCode(status.deniedReason) : '\nПричина не указана.'}` +
        `\nВы можете повторно подать заявку <t:${~~(+status.deniedUntil / 1000)}:R>`,
    });
    if (status && status.sended) return interaction.reply({
      ephemeral: true,
      content: `Ваша заявка уже была отправлена, ожидайте.`,
    });

    await this.cacheService.set(`ZBT_REQUEST_START_TIME_${interaction.user.id}`, Date.now().toString(), '1d', true);

    return interaction.showModal(FormModal.builder());
  }
}