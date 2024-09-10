import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import ActiveOrder from "../../schemas/ActiveOrder";
import FinishedOrder from "../../schemas/FinishedOrder";
import { completeOrder } from "../../lib/Database";
import { OrderItemAll } from "../../typings/Order";

@ApplyOptions<InteractionHandlerOptions>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class CompleteOrderButton extends InteractionHandler 
{
  public override parse(interaction: ButtonInteraction) 
  {
    if (interaction.customId.split("-")[0] !== "COMP") return this.none();
    return this.some();
  }

  public override async run(interaction: ButtonInteraction) 
  {
    await interaction.deferReply({ ephemeral: true, });

    const orderId = interaction.customId.split("-")[1];
    const order = await ActiveOrder.findOne({ order_id: orderId, });
    let fOrder = await FinishedOrder.findOne({ order_id: orderId, });
    if (!order || fOrder)
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | Error, something wrong has happened!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }
    
    await completeOrder({
      order_id: order.order_id,
      name: order.name,
      class: order.class,
      phone_number: order.phone_number,
      items_total: order.items_total as OrderItemAll[],
      price: order.price,
      posted: order.posted,
    }, interaction);

    await order.deleteOne();

    await interaction.message.delete();
  }
}