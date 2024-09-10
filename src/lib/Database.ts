import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  TextChannel
} from "discord.js";
import ActiveOrder from "../schemas/ActiveOrder";
import { toTitleCase } from "./Utils";
import { container } from "@sapphire/framework";
import FinishedOrder from "../schemas/FinishedOrder";
import { Order } from "../typings/Order";

/**
 * Create a new active order
 * @param order_id
 * @param name
 * @param classId
 * @param phone_number
 * @param items_total
 * @param posted
 * @param price
 * @param interaction
 */
export async function createOrder({ order_id, name, class: classId, phone_number, items_total, posted, price, }: Order, interaction?: ChatInputCommandInteraction | ButtonInteraction)
{
  const order = await ActiveOrder.create({
    order_id,
    name,
    class: classId,
    phone_number,
    items_total,
    price,
    posted,
  });

  if (interaction) await responseActive(order, interaction);

  container.logger.info(`Created new order #${order_id}`);
}

/**
 * Complete an active order
 * @param order_id
 * @param name
 * @param classId
 * @param phone_number
 * @param items_total
 * @param posted
 * @param price
 * @param interaction
 */
export async function completeOrder({ order_id, name, class: classId, phone_number, items_total, posted, price, }: Order, interaction?: ChatInputCommandInteraction | ButtonInteraction)
{
  const fOrder = await FinishedOrder.create({
    order_id,
    name,
    class: classId,
    phone_number,
    items_total,
    price,
    posted,
    status: "completed",
    completion_time: Math.floor(Date.now() / 1000),
  });

  if (interaction) await responseFinished(fOrder, interaction);
  
  container.logger.info(`Completed new order #${order_id}`);
}

/**
 * Cancel an active order
 * @param order_id
 * @param name
 * @param classId
 * @param phone_number
 * @param items_total
 * @param posted
 * @param price
 * @param interaction
 */
export async function cancelOrder({ order_id, name, class: classId, phone_number, items_total, posted, price, }: Order, interaction?: ChatInputCommandInteraction | ButtonInteraction)
{
  const fOrder = await FinishedOrder.create({
    order_id,
    name,
    class: classId,
    phone_number,
    items_total,
    price,
    posted,
    status: "cancelled",
    completion_time: Math.floor(Date.now() / 1000),
  });

  if (interaction) await responseFinished(fOrder, interaction);

  container.logger.info(`Cancelled order #${order_id}`);
}


/**
 * Send active order feedback
 * @param order
 * @param interaction
 */
export async function responseActive(order, interaction: ChatInputCommandInteraction | ButtonInteraction)
{
  if (!interaction.deferred) await interaction.deferReply();

  const message = generateMessageActive(order);
  await interaction.editReply({ content: message, });
}

/**
 * Send finished order feedback
 * @param fOrder
 * @param interaction
 */
export async function responseFinished(fOrder, interaction: ChatInputCommandInteraction | ButtonInteraction)
{
  if (!interaction.deferred) await interaction.deferReply();

  const message = generateMessageFinished(fOrder);
  await interaction.editReply({ content: message, });
}

/**
 * Generate a message for finished order
 * @param fOrder
 */
export function generateMessageFinished(fOrder)
{
  return `# Order ID: ${fOrder.order_id} | ${(fOrder.status as string).toUpperCase()}\n` +
    `**Customer**: ${fOrder.name} - ${fOrder.phone_number || "No Phone Number"}\n` +
    `**Class**: ${fOrder.class}\n` +
    `**Has to pay**: ${fOrder.price.toLocaleString()}\n\n` +
    `## Order Items\n` +
    fOrder.items_total.map((item) => 
    {
      return `x${item.number} ${item.fullName} (${toTitleCase(item.state)}) - ${item.id}`;
    }).join("\n") + "\n\n" +
    `### Time: <t:${fOrder.completion_time}:R>`;
}

/**
 * Generate a message for active order
 * @param order
 */
export function generateMessageActive(order)
{
  return `# Order ID: ${order.order_id}\n` +
    `**Customer**: ${order.name} - ${order.phone_number || "No Phone Number"}\n` +
    `**Class**: ${order.class}\n` +
    `**Has to pay**: ${order.price.toLocaleString()}\n\n` +
    `## Order Items\n` +
    order.items_total.map((item) => 
    {
      return `x${item.number} ${item.fullName} (${toTitleCase(item.state)}) - ${item.id}`;
    }).join("\n");
}

/**
 * Check all the active order in the database to make sure they are posted
 */
export async function postChecking(channel: TextChannel)
{
  const cursor = await ActiveOrder.find({}).cursor();
  cursor.on("data", async (doc) => 
  {
    if (!doc.posted)
    {
      const order = await ActiveOrder.findOne({ order_id: doc.order_id, });
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

      const message = generateMessageActive(doc);
      await channel.send({ content: message, components: [componentRow], });

      await order.updateOne({ posted: true, });
    }
  });

  cursor.on("end", () => 
  {
    container.logger.info("Finished checking all documents");
  });

  cursor.on("error", (err) =>
  {
    console.log(err);
    container.logger.error("Failed to check all documents");
  });
}