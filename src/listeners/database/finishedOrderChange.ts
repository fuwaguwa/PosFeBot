import FinishedOrder from "../../schemas/FinishedOrder";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { toTitleCase } from "../../lib/Utils";

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

    const message =
      `# Order ID: ${fOrder.order_id} | ${(fOrder.status as string).toUpperCase()}\n` +
      `**Customer**: ${fOrder.name} - ${fOrder.phone_number || "No Phone Number"}\n` +
      `**Class**: ${fOrder.class}\n` +
      `**Has to pay**: ${fOrder.price.toLocaleString()}\n\n` +
      `## Order Items\n` +
      fOrder.items_total.map((item) =>
      {
        return `x${item.number} ${item.fullName} (${toTitleCase(item.state)}) - ${item.id}`;
      }).join("\n") + "\n\n" +
      `### Time: <t:${fOrder.completion_time}:R>`;

    await channel.send({ content: message, components: [componentRow], });
  }
}