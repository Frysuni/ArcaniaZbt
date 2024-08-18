import { textInputRowBuilder } from "@app/common/utils/text-input-row.builder";
import { Injectable } from "@nestjs/common";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { Context, Modal, ModalContext } from "necord";
import { ZbtService } from "../zbt.service";

@Injectable()
export class DenyModal {
  constructor(
    private readonly zbtService: ZbtService,
  ) {}

  private static readonly id = 'ZBT_MODAL_FORM_DENY_INPUT_REASON';

  public static builder = (formId: string) => new ModalBuilder()
    .setCustomId(DenyModal.id)
    .setTitle(`Подтверждение отклонения заявки ${formId}`)
    .setComponents(
      textInputRowBuilder(b => b
        .setCustomId('REASON')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Причина')
        .setPlaceholder('Необязательное поле')
        .setMinLength(2)
        .setMaxLength(256),
      ),
    );

  @Modal(DenyModal.id)
  public async onDenyModal(@Context() [interaction]: ModalContext) {
    const field = interaction.fields.getTextInputValue('REASON');
    const reason = (field && field.trim()) ? field : undefined;
    interaction.deferUpdate();
    return this.zbtService.denyRequest(interaction.message!, interaction.user, reason);
  }
}
