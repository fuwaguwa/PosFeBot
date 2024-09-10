import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import ActiveOrder from "../../schemas/ActiveOrder";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { generateMessageActive } from "../../lib/Database";

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

    const message = generateMessageActive(order);

    await channel.send({ content: message, components: [componentRow], });

    if (!order.posted)
    {
      const order_db = await ActiveOrder.findOne({ order_id: order.order_id, });
      await order_db.updateOne({ posted: true, });
    }
  }
}