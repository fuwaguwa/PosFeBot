import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
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

  await interaction.editReply({ content: message, });
}