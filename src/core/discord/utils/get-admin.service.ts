import { Injectable } from "@nestjs/common";
import { Events } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Arguments, Context, ContextOf, On, TextCommand, TextCommandContext } from "necord";
import { resolve } from "path";

type Data = { roleId: string, emoji: string, messageId: string };

@Injectable()
export class GetAdminService {
  constructor() {}

  @TextCommand({
    name: 'get-admin',
    description: 'desc',
  })
  public async onGetAdminCommand(@Context() [message]: TextCommandContext, @Arguments() args: string[]): Promise<void> {
    if (!args.length) return void await message.reply('!get-admin {role} {unicode emoji} {Text}');

    const role = message.guild?.roles.cache.get(args[0].trim().replace(/<|@|&|>/g, ''));
    if (!role) return;

    const emoji = args[1].trim();
    if (!emoji) return;

    const text = args.slice(2).join(' ').trim();
    if (!text) return;

    const botMessage = await message.channel.send(text.replaceAll('\\n', '\n'));
    botMessage.react(emoji);

    writeFileSync(resolve('getadmin'), JSON.stringify({ roleId: role.id, emoji, messageId: botMessage.id }));
  }

  @On(Events.MessageReactionAdd)
  public async onReaction(@Context() [messageReaction, user]: ContextOf<Events.MessageReactionAdd>) {
    if (user.bot) return;

    if (!existsSync(resolve('getadmin'))) return;
    const data = JSON.parse(readFileSync(resolve('getadmin'), 'utf-8')) as Data;

    const { roleId, emoji, messageId } = data;

    if (messageReaction.message.id !== messageId) return;
    if (emoji !== messageReaction.emoji.name) return;

    messageReaction.users.remove(user.id);

    const member = messageReaction.message.guild?.members.cache.get(user.id)!;
    if (member.roles.cache.has(roleId)) {
      member.roles.remove(roleId);
    } else {
      member.roles.add(roleId);
    }
  }
}