import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import ActiveOrder from "../../schemas/ActiveOrder";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { toTitleCase } from "../../lib/Utils";

@ApplyOptions<ListenerOptions>({
  emitter: ActiveOrder.watch(),
  event: "change",
})
export class ActiveOrderChange extends Listener
{
  public override async run(data)
  {
    if (data.operationType !== "insert") return;

    const order = data.fullDocument;

    const guild = await this.container.client.guilds.fetch("1084148320684998676");
    const channel = (await guild.channels.fetch("1282585674331066402")) as TextChannel;

    const componentRow = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅")
          .setLabel("Completed/Shipped!")
          .setCustomId(`COMP-${order.order_id}`),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setEmoji("❌")
          .setLabel("Cancelled")
          .setCustomId(`CANC-${order.order_id}`)
      );

    const message =
      `# Order ID: ${order.order_id}\n` +
      `**Customer**: ${order.name} - ${order.phone_number || "No Phone Number"}\n` +
      `**Class**: ${order.class}\n` +
      `**Has to pay**: ${order.price.toLocaleString()}\n\n` +
      `## Order Items\n` +
      order.items_total.map((item) =>
      {
        return `x${item.number} ${item.fullName} (${toTitleCase(item.state)}) - ${item.id}`;
      }).join("\n");

    await channel.send({ content: message, components: [componentRow], });
  }
}