import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import FinishedOrder from "../../schemas/FinishedOrder";
import ActiveOrder from "../../schemas/ActiveOrder";
import { createOrder } from "../../lib/Database";
import { OrderItemAll } from "../../typings/Order";

@ApplyOptions<InteractionHandlerOptions>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RestoreOrderButton extends InteractionHandler 
{
  public override parse(interaction: ButtonInteraction) 
  {
    if (interaction.customId.split("-")[0] !== "REST") return this.none();
    return this.some();
  }

  public override async run(interaction: ButtonInteraction) 
  {
    await interaction.deferReply({ ephemeral: true, });

    const orderId = interaction.customId.split("-")[1];
    const fOrder = await FinishedOrder.findOne({ order_id: orderId, });
    let order = await ActiveOrder.findOne({ order_id: orderId, });
    if (!fOrder || order)
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | Error, something wrong has happened!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await createOrder({
      order_id: fOrder.order_id,
      name: fOrder.name,
      class: fOrder.class,
      phone_number: fOrder.phone_number,
      items_total: fOrder.items_total as OrderItemAll[],
      price: fOrder.price,
      posted: false,
    }, interaction);

    await fOrder.deleteOne();

    await interaction.message.delete();
  }
}