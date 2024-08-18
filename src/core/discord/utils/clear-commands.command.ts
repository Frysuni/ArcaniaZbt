import { Injectable } from "@nestjs/common";
import { PermissionFlagsBits } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

@Injectable()
export class ClearCommandsCommand {
  @SlashCommand({
    name: 'clear-commands',
    description: 'dev-only, do not use if it`s not necessary',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onClearCommandsCommand(@Context() [interaction]: SlashCommandContext) {
    await interaction.client.application.commands.set([]);
    await interaction.guild?.commands.set([]);

    interaction.reply({ ephemeral: true, content: 'success' });
  }
}