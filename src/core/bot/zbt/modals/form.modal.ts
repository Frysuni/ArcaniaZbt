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
    nickname: 'NICKNAME',
    age: 'AGE',
    time: 'PRIME_TIME',
    os: 'OS',
    pc: 'PC',
    about: 'ABOUT',
  };

  public static builder = () => new ModalBuilder()
    .setCustomId(FormModal.id)
    .setTitle('Подача заявки на ЗБТ')
    .setComponents(
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.nickname)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Игровой никнейм')
        .setPlaceholder('_Frys_')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.age)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Возраст')
        .setPlaceholder('9 лет (с половиной)')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.time)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Время игры')
        .setPlaceholder('100-500 часов в день')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.os)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Операционная система')
        .setPlaceholder('Что это такое?')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.pc)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Характеристики ПК')
        .setPlaceholder('Надо знать! (но я забыл)')
        .setMinLength(2)
        .setMaxLength(256),
      ),
      textInputRowBuilder(b => b
        .setCustomId(FormModal.fieldIds.about)
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel('Напиши интересную историю')
        .setPlaceholder('(если хочешь)')
        .setMinLength(2)
        .setMaxLength(256),
      ),
    );

  @Modal(FormModal.id)
  public async onFormModal(@Context() [interaction]: ModalContext) {
    interaction.deferReply({ ephemeral: true });

    const field: typeof FormModal.fieldIds = {
      time: interaction.fields.getTextInputValue(FormModal.fieldIds.time),
      os: interaction.fields.getTextInputValue(FormModal.fieldIds.os),
      pc: interaction.fields.getTextInputValue(FormModal.fieldIds.pc),
      nickname: interaction.fields.getTextInputValue(FormModal.fieldIds.nickname),
      age: interaction.fields.getTextInputValue(FormModal.fieldIds.age),
      about: interaction.fields.getTextInputValue(FormModal.fieldIds.about),
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
          name: 'Игровой никнейм:',
          value: `> **\`\`\`${field.nickname}\`\`\`**`,
        }, {
          name: 'Возраст:',
          value: `> **\`\`\`${field.age}\`\`\`**`,
        }, {
          name: 'Время игры:',
          value: `> **\`\`\`${field.time}\`\`\`**`,
        }, {
          name: 'Операционная система:',
          value: `> **\`\`\`${field.os}\`\`\`**`,
        }, {
          name: 'Характеристики ПК:',
          value: `> **\`\`\`${field.pc}\`\`\`**`,
        },
      );

    if (field.about.trim().length > 0) embed.addFields({
      name: 'Интересная история:',
      value: `> **\`\`\`${field.about}\`\`\`**`,
    });

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
      .send('Твоя заявка на закрытое бета-тестирование отправлена. Ожидай подтверждения. Обычно это занимает до 4х часов в рабочее время.')
      .catch<false>(() => false);

    if (result) {
      return interaction.editReply({
        content: 'Твоя заявка на ЗБТ успешно отправлена. Проверь личные сообщения от бота, туда придет уведомление о результате заявки.',
      });
    } else {
      interaction.editReply({
        content: 'Твоя заявка на ЗБТ отправлена\n**Но тебе необходимо разблокировать бота или дать ему доступ к личным сообщениям, иначе бот не сможет прислать уведомление о результате заявки!**',
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
