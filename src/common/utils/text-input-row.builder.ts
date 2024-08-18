import { ActionRowBuilder, ModalActionRowComponentBuilder, TextInputBuilder } from "discord.js";

export const textInputRowBuilder = (cb: (textInputBuider: TextInputBuilder) => TextInputBuilder) => {
  const actionRowBuilder = new ActionRowBuilder<ModalActionRowComponentBuilder>;
  const textInputBuilder = cb(new TextInputBuilder);
  return actionRowBuilder.addComponents(textInputBuilder);
};
