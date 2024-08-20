import { CacheService } from "@app/cache";
import { hour, minute } from "@app/common/time";
import { DiscordService } from "@app/core/discord/discord.service";
import { Injectable } from "@nestjs/common";
import { codeBlock, Colors, EmbedBuilder, inlineCode, italic, Message, User } from "discord.js";
import { Rcon } from 'rcon-client';
import { inspect } from "util";
import { ZbtConfig } from "./zbt.config";

@Injectable()
export class ZbtService {
  private readonly rcon: Rcon;
  constructor(
    private readonly discordService: DiscordService,
    private readonly cacheService: CacheService,
    private readonly zbtConfig: ZbtConfig,
  ) {
    this.rcon = new Rcon({
      host: this.zbtConfig.rconHost,
      port: this.zbtConfig.rconPort,
      password: this.zbtConfig.rconPass,
    });
    this.rcon.connect().catch(() => {});
    setInterval(() => this.rcon.connect().catch(() => {}), minute());
  }

  public async acceptRequest(message: Message, author: User) {
    const userId = message.embeds[0].data.description!.split('\n')[0].replace(/<|>|@/g, '').trim();

    this.editMessageStatus(message, author, 'accepted');
    this.switchPinMessage(message);

    this.cacheService.set(`ZBT_FORMS_STATUS_${userId}`, { accepted: true }, 'INFINITY', true);

    this.sendToUser(message, 'accepted');

    const guild = await this.discordService.guild;
    const member = guild.members.cache.get(author.id)!;
    member.roles.add(this.zbtConfig.roleId);

    const nickname = message.embeds[0].fields[3].value.replace(/>|\*|`/g, '').trim();
    const command = this.zbtConfig.rconCommand.replaceAll('%nickname%', nickname);
    const result = await this.rcon.send(command).catch((e) => new Error(e));

    if (
      !result ||
      result instanceof Error ||
      !result.toString().includes('Whitelisted')
    ) {
      message.reply(
        `**Не удалось отправить команду добавления в вайт-лист на сервер!**\n` +
        `Пожалуйста, отправьте команду ниже самостоятельно:\n${codeBlock(command)}\n` +
        `Ошибка (отправьте ее Frys):\n${codeBlock(`Error handler token: ${Math.random()}\nHead swamp: ${~~(Math.random() * 10000)}kbit\n\n` + inspect(result))}`,
      );
    }
  }

  public async denyRequest(message: Message, author: User, reason?: string) {
    this.editMessageStatus(message, author, 'denied', reason);
    this.switchPinMessage(message);

    const userId = message.embeds[0].data.description!.split('\n')[0].replace(/<|>|@/g, '').trim();
    this.cacheService.set(`ZBT_FORMS_STATUS_${userId}`, { deniedUntil: Date.now() + hour(12), deniedReason: reason }, 'INFINITY', true);

    this.sendToUser(message, 'denied', reason);
  }

  public async skipRequest(message: Message, author: User) {
    this.editMessageStatus(message, author, 'skipped');
    this.switchPinMessage(message);

    const userId = message.embeds[0].data.description!.split('\n')[0].replace(/<|>|@/g, '').trim();
    this.cacheService.get(`ZBT_FORMS_STATUS_${userId}`, { withoutKeyPrefix: true, delete: true });
  }

  public async switchPinMessage(message: Message) {
    if (message.pinned) return message.unpin();
    await message.pin();
    const messages = await message.channel.messages.fetch({ limit: 1 });
    messages.last()?.delete();
    return;
  }

  private async sendToUser(message: Message, state: 'accepted' | 'denied', deniedReason?: string) {
    const userId = message.embeds[0].data.description!.split('\n')[0].replace(/<|>|@/g, '').trim();
    const guild = await this.discordService.guild;
    const member = guild.members.cache.get(userId);
    if (!member) return;

    const dm = await member.createDM(true);
    if (state === 'accepted') {
      return dm.send(
        'Твоя заявка на закрытое бета-тестирование была **одобрена** ✅.\n' +
        'Тебе была выдана роль, а так же ты добавлен в вайт-лист и можешь заходить на сервер.\n' +
        `Optifine 1.20.1 - ${inlineCode('play.arcania.world')}\n` +
        `\nЖелаем приятной игры!`,
      );
    } else if (state === 'denied') {
      return dm.send(
        'Твоя заявка на закрытое бета-тестирование была **отклонена** 🛑.\n' +
        (deniedReason ? `Причина: ${inlineCode(deniedReason)}` : 'Причина не указана.') +
        `\nТы можешь повторно подать заявку <t:${~~((Date.now() + hour(12)) / 1000)}:R>`,
      );
    }
    return;
  }

  private async editMessageStatus(message: Message, author: User, state: 'accepted' | 'denied' | 'skipped', deniedReason?: string) {
    const embed = EmbedBuilder.from(message.embeds[0]);

    let status: { text: string, color: number };
    switch (state) {
      case 'accepted': status = { text: `Статус: **\`Одобрено\`** ${author}`, color: Colors.DarkGreen }; break;
      case 'denied': status = { text: `Статус: **\`Отклонено\`** ${author}`, color: Colors.DarkRed }; break;
      case 'skipped': status = { text: `Статус: **\`Пропущено\`** ${author}`, color: Colors.Grey }; break;
    }

    const description = embed.data.description!.split('\n');
    description[3] = status.text;
    if (deniedReason) description[4] = italic(deniedReason.trim());
    embed.setDescription(description.join('\n'));
    embed.setColor(status.color);

    message.edit({ embeds: [embed], components: [] });
  }
}
