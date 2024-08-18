import { CacheService } from "@app/cache";
import { formatTime } from "@app/common/format-time";
import { textInputRowBuilder } from "@app/common/utils/text-input-row.builder";
import { DiscordService } from "@app/core/discord/discord.service";
import { Injectable } from "@nestjs/common";
import { ActionRowBuilder, ButtonBuilder, Colors, EmbedBuilder, inlineCode, ModalBuilder, TextInputStyle } from "discord.js";
import { Context, Modal, ModalContext } from "necord";
import { AcceptButton } from "../buttons/accept.button";
import { DenyButton } from "../buttons/deny.button";
import { SkipButton } from "../buttons/skip.button";
import { ZbtConfig } from "../zbt.config";
import { ZbtService } from "../zbt.service";

@Injectable()
export class FormModal {

  constructor(
    private readonly discordService: DiscordService,
    private readonly zbtConfig: ZbtConfig,
    private readonly cacheService: CacheService,
    private readonly zbtService: ZbtService,
  ) {}

  private static readonly id = 'ZBT_MODAL_FORM';
  private static readonly fieldIds = {
    primeTime: 'PRIME_TIME',
    os: 'OS',
    pc: 'PC',
    nickname: 'NICKNAME',
    age: 'AGE',
  };

  public static builder = () => new ModalBuilder()
    .setCustomId(FormModal.id)
    .setTitle('Подача заявки на ЗБТ')
    .setComponents(
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.primeTime)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Прайм-тайм')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.os)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Операционная система')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.pc)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Характеристики ПК')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.nickname)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Игровой никнейм')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.age)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Возраст')
        .setMinLength(2)
        .setMaxLength(256),
      ),
    );

  @Modal(FormModal.id)
  public async onFormModal(@Context() [interaction]: ModalContext) {
    interaction.deferReply({ ephemeral: true });

    const field: typeof FormModal.fieldIds = {
      primeTime: interaction.fields.getTextInputValue(FormModal.fieldIds.primeTime),
      os: interaction.fields.getTextInputValue(FormModal.fieldIds.os),
      pc: interaction.fields.getTextInputValue(FormModal.fieldIds.pc),
      nickname: interaction.fields.getTextInputValue(FormModal.fieldIds.nickname),
      age: interaction.fields.getTextInputValue(FormModal.fieldIds.age),
    };

    const guild = await this.discordService.guild;

    const channel = guild.channels.cache.get(this.zbtConfig.resultChannelId);
    const member = guild.members.cache.get(interaction.user.id)!;
    const startTime = await this.cacheService.get(`ZBT_REQUEST_START_TIME_${member.id}`, { withoutKeyPrefix: true, delete: true });
    if (!member.joinedTimestamp || !startTime || isNaN(+startTime)) throw new Error('Something went wrong');
    if (!channel || !channel.isTextBased()) throw new Error('Wrong channel');

    const number = await this.cacheService.get<string>('REQUEST_ID');
    let targetNumber = 1;
    if (number && !isNaN(+number)) targetNumber = Number(number) + 1;
    this.cacheService.set('REQUEST_ID', targetNumber.toString(), 'INFINITY', false);

    const embed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle(`Заявка ЗБТ #${targetNumber}`)
      .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.displayName })
      .setDescription(
        `${interaction.user.toString()}\n` +
        `Анкета заполнена за ${inlineCode(formatTime(Date.now() - +startTime))}\n` +
        `Стал участником сервера <t:${~~(member.joinedTimestamp! / 1000)}:R>\n` +
        `Статус: ${inlineCode('Ожидает рассмотрения')}`,
      )
      .setFields(
        {
          name: 'Прайм-тайм:',
          value: `> **\`\`\`${field.primeTime}\`\`\`**`,
        }, {
          name: 'Операционная система:',
          value: `> **\`\`\`${field.os}\`\`\`**`,
        }, {
          name: 'Характеристики ПК:',
          value: `> **\`\`\`${field.pc}\`\`\`**`,
        }, {
          name: 'Игровой никнейм:',
          value: `> **\`\`\`${field.nickname}\`\`\`**`,
        }, {
          name: 'Возраст:',
          value: `> **\`\`\`${field.age}\`\`\`**`,
        },
      );

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        AcceptButton.builder(),
        DenyButton.builder(),
        SkipButton.builder(),
      );

    const sendedMessage = await channel.send({
      embeds: [embed],
      components: [buttons],
    });
    this.zbtService.switchPinMessage(sendedMessage);

    this.cacheService.set(`ZBT_FORMS_STATUS_${member.id}`, { sended: true }, 'INFINITY', true);

    const dm = await member.createDM(true);
    const result = await dm
      .send('Ваша заявка на закрытое бэта-тестирование отправлена. Ожидайте подтверждения. Обычно это занимает до 4х часов в рабочее время.')
      .catch<false>(() => false);

    if (result) {
      return interaction.editReply({
        content: 'Ваша заявка на ЗБТ успешно отправлена. Проверьте личные сообщения от бота, туда вам придет уведомление о результате заявки.',
      });
    } else {
      interaction.editReply({
        content: 'Ваша заявка на ЗБТ отправлена\n**Но вам необходимо разблокировать бота или дать ему доступ к личным сообщениям, иначе бот не сможет вам прислать уведомление о результате заявки!**',
      });
      channel.send(
        `Не удалось отправить сообщение пользовтелю ${member}.\n` +
        `Он не получит сообщение о результате заявки.\n` +
        `Бот сам дал ему уведомление об этом, но юзер всегда дебил\n` +
        `Справка: обычно это происходит если юзер забанил бота ИЛИ у него включены дебильные настройки конфидециальности. По сути можете не париться, сам дебил.`,
      );
      return;
    }
  }
}
