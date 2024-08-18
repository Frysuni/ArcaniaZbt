import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { Injectable } from "@nestjs/common";
import { Colors, PermissionFlagsBits } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";
import { RequestButton } from "../buttons/request.button";

@Injectable()
export class ZbtInitCommand {

  @SlashCommand({
    name: 'zbt-init',
    description: 'Создает сообщение для подачи заявки',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    nsfw: false,
  })
  public async onZbtInit(@Context() [interaction]: SlashCommandContext) {
    const embed = new EmbedBuilder()
      .setColor(Colors.DarkerGrey)
      .setTitle(`Заявка на Закрытый Бета-Тест`)
      .setDescription(`Став участником ЗБТ, ты поможешь нам стать лучше, а мы в ответ наградим тебя по заслугам на открытии!`)
      .setFooter({ text: 'Arcania' });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(RequestButton.builder());

    await interaction.channel?.send({
      embeds: [embed],
      components: [buttons],
    });

    await interaction.reply({
      ephemeral: true,
      content: 'ты гей',
    });
  }
}
