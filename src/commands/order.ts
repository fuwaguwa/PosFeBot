import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { getFullName } from "../lib/Utils";
import ActiveOrder from "../schemas/ActiveOrder";
import FinishedOrder from "../schemas/FinishedOrder";
import { EmbedBuilder } from "discord.js";
import { OrderItemAll } from "../typings/Order";
import { cancelOrder, completeOrder, createOrder, responseActive, responseFinished } from "../lib/Database";

@ApplyOptions<SubcommandOptions>({
  description: "Order commands",
  preconditions: ["OwnerOnly"],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
  subcommands: [
    {
      name: "active",
      type: "group",
      entries: [
        { name: "create", chatInputRun: "orderActiveCreate", },
        { name: "complete", chatInputRun: "orderActiveComplete", },
        { name: "check", chatInputRun: "orderActiveCheck", },
        { name: "cancel", chatInputRun: "orderActiveCancel", }
      ],
    },
    {
      name: "finished",
      type: "group",
      entries: [
        { name: "make-active", chatInputRun: "orderFinishedMakeActive", },
        { name: "check", chatInputRun: "orderFinishedCheck", },
        { name: "remove", chatInputRun: "orderFinishedRemove", }
      ],
    }
  ],
})
export class OrderCommand extends Subcommand 
{
  public override registerApplicationCommands(registry: Subcommand.Registry) 
  {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommandGroup(group =>
          group
            .setName("active")
            .setDescription("Order commands - Active group")
            .addSubcommand(command =>
              command
                .setName("create")
                .setDescription("Create a new order - Active group")
            )
            .addSubcommand(command =>
              command
                .setName("complete")
                .setDescription("Complete an order - Active group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
            .addSubcommand(command =>
              command
                .setName("cancel")
                .setDescription("Cancel an order - Active group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
            .addSubcommand(command =>
              command
                .setName("check")
                .setDescription("Check the status of an order - Active group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(group =>
          group
            .setName("finished")
            .setDescription("Order processing - Finished group")
            .addSubcommand(command =>
              command
                .setName("make-active")
                .setDescription("Make a finished order active again - Finished group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
            .addSubcommand(command =>
              command
                .setName("check")
                .setDescription("Check out a finished order - Finished group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
            .addSubcommand(command =>
              command
                .setName("remove")
                .setDescription("Delete a finished order - Finished group")
                .addStringOption(option =>
                  option
                    .setName("order_id")
                    .setDescription("Order ID")
                    .setRequired(true)
                )
            )
        )
    );
  }

  /**
   * /order active create
   * @param interaction
   */
  public async orderActiveCreate(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const itemsTotal: OrderItemAll[] = [
      {
        id: "cpn",
        fullName: getFullName("cpn"),
        state: "hot",
        number: 2,
      },
      {
        id: "cpd",
        fullName: getFullName("cpd"),
        state: "cold",
        number: 4,
      }
    ];
    const price = 300000;
    const order_id = `${Math.floor(Math.random() * 999999) + 1}`;
    const name = "Tester";
    const classId = "19B1";
    const phoneNumber = "911";
    const posted = false;

    await createOrder({ order_id, name, class: classId, phone_number: phoneNumber, items_total: itemsTotal, price, posted, }, interaction);
  }

  /**
   * /order active check
   * @param interaction
   */
  public async orderActiveCheck(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");
    const order = await ActiveOrder.findOne({ order_id: orderId, });

    if (!order) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await responseActive(order, interaction);
  }

  /**
   * /order active complete
   * @param interaction
   */
  public async orderActiveComplete(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");

    const order = await ActiveOrder.findOne({ order_id: orderId, });
    if (!order) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    let fOrder = await FinishedOrder.findOne({ order_id: order.order_id, });
    if (fOrder) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | An order with that `order_id` has already been completed");
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
  }

  public async orderActiveCancel(interaction: Subcommand.ChatInputCommandInteraction)
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");

    const order = await ActiveOrder.findOne({ order_id: orderId, });
    if (!order)
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    let fOrder = await FinishedOrder.findOne({ order_id: order.order_id, });
    if (fOrder)
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | An order with that `order_id` has already been completed");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await cancelOrder({
      order_id: order.order_id,
      name: order.name,
      class: order.class,
      phone_number: order.phone_number,
      items_total: order.items_total as OrderItemAll[],
      price: order.price,
      posted: order.posted,
    }, interaction);

    await order.deleteOne();
  }

  /**
   * /order finished make-active
   * @param interaction
   */
  public async orderFinishedMakeActive(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");
    const fOrder = await FinishedOrder.findOne({ order_id: orderId, });
    if (!fOrder) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No finished order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    let order = await ActiveOrder.findOne({ order_id: fOrder.order_id, });
    if (order) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | An order with that `order_id` is already active!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await fOrder.deleteOne();

    await createOrder({
      order_id: fOrder.order_id,
      name: fOrder.name,
      class: fOrder.class,
      phone_number: fOrder.phone_number,
      items_total: fOrder.items_total as OrderItemAll[],
      price: fOrder.price,
      posted: false,
    }, interaction);
  }

  /**
   * /order finished check
   * @param interaction
   */
  public async orderFinishedCheck(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");
    const fOrder = await FinishedOrder.findOne({ order_id: orderId, });

    if (!fOrder) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No finished order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await responseFinished(fOrder, interaction);
  }

  /**
   * /order finished delete
   * @param interaction
   */
  public async orderFinishedRemove(interaction: Subcommand.ChatInputCommandInteraction) 
  {
    if (!interaction.deferred) await interaction.deferReply();

    const orderId = interaction.options.getString("order_id");
    const fOrder = await FinishedOrder.findOne({ order_id: orderId, });

    if (!fOrder) 
    {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("❌ | No finished order with that `order_id` found!");
      return interaction.editReply({ embeds: [errorEmbed], });
    }

    await fOrder.deleteOne();

    const successEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ | Deleted the finished order with the \`order_id\` of ${orderId}`);
    await interaction.editReply({ embeds: [successEmbed], });
  }
}