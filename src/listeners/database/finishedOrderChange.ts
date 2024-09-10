import FinishedOrder from "../../schemas/FinishedOrder";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { generateMessageFinished } from "../../lib/Database";

@ApplyOptions<ListenerOptions>({
  emitter: FinishedOrder.watch(),
  event: "change",
})
export class FinishedOrderChangeListener extends Listener
{
  public override async run(data)
  {
    if (data.operationType !== "insert") return;

    const fOrder = data.fullDocument;

    const guild = await this.container.client.guilds.fetch("1084148320684998676");
    const channel = (await guild.channels.fetch("1282585708162318377")) as TextChannel;

    const componentRow = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setEmoji("⌚")
          .setLabel("Restore")
          .setCustomId(`REST-${fOrder.order_id}`)
      );

    const message = generateMessageFinished(fOrder);
    await channel.send({ content: message, components: [componentRow], });
  }
}