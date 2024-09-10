import mongoose from "mongoose";
import {
  ChatInputCommandSuccessPayload,
  Command,
  container,
  ContextMenuCommandSuccessPayload,
  MessageCommandSuccessPayload,
  SapphireClient
} from "@sapphire/framework";
import { cyan } from "colorette";
import { Guild, User } from "discord.js";
import { ChatInputCommandSubcommandMappingMethod, ChatInputSubcommandSuccessPayload } from "@sapphire/plugin-subcommands";
import { OrderItemType } from "../typings/Order";
import { fullItemName } from "./Constants";

/**
 * Connect to MongoDB database
 */
export function connectToDatabase() 
{
  mongoose.connect(process.env.mongoDB).catch((err) => 
  {
    console.log(err);
  });
}

function getGuildInfo(guild: Guild): string
{
  return guild == null ? "| Direct Message" : `${guild.name} - ${cyan(guild.id)} `;
}

function getAuthorInfo(author: User): string 
{
  return `${author.username} - ${cyan(author.id)}`;
}

function getCommandInfo(command: Command): string 
{
  return cyan(command.name);
}

function getShardInfo(shardId: number) 
{
  return `${cyan(shardId.toString())}`;
}


export function getSuccessfulLoggerData(guild: Guild, user: User, command: Command)
{
  const shard = getShardInfo(guild?.shardId ?? 0);
  const commandName = getCommandInfo(command);
  const author = getAuthorInfo(user);
  const originGuild = getGuildInfo(guild);

  return { shard, commandName, author, originGuild, };
}

export function logSuccessfulCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload | ChatInputSubcommandSuccessPayload, subcommand?: ChatInputCommandSubcommandMappingMethod): void
{
  let successData: ReturnType<typeof getSuccessfulLoggerData>;

  if ("interaction" in payload) 
  {
    successData = getSuccessfulLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
  }
  else 
  {
    successData = getSuccessfulLoggerData(payload.message.guild, payload.message.author, payload.command);
  }

  let subcommandName = "";
  if (subcommand) subcommandName = ` ${subcommand.name}`;

  container.logger.debug(`[${successData.shard}]: ${successData.commandName}${subcommandName} | ${successData.author} | ${successData.originGuild}`);
}


/**
 * Starts error catching
 */
export function startCatchers(client: SapphireClient) 
{
  let connectingAttempt: number = 0;
  let connectedToDatabase: boolean = false;
  process.on("unhandledRejection", async (err: any) => 
  {
    /**
     * Unknown interaction and unknown message error
     */
    console.error("Unhandled Promise Rejection:\n" + err);
  });

  process.on("uncaughtException", async (err) => 
  {
    console.error("Uncaught Promise Exception:\n" + err);
  });

  process.on("uncaughtExceptionMonitor", async (err) => 
  {
    console.error("Uncaught Promise Exception (Monitor):\n" + err);
  });

  mongoose.connection.on("connecting", () => 
  {
    client.logger.info("Connecting to the database...");
  });

  mongoose.connection.on("connecting", () => 
  {
    connectingAttempt++;
    client.logger.info(`Connecting Attempt #${connectingAttempt}`);
  });

  mongoose.connection.on("connected", () => 
  {
    connectedToDatabase = true;
    client.logger.info("Connected to the database!");
  });

  mongoose.connection.on("disconnected", () => 
  {
    client.logger.error("Lost database connection...");

    if (connectedToDatabase) 
    {
      client.logger.info("Attempting to reconnect to the database...");
      connectToDatabase();
    }
  });

  mongoose.connection.on("reconnected", () => 
  {
    this.logger.info("Reconnected to the database!");
  });
 
  mongoose.connection.on("error", (err) => 
  {
    this.logger.error(err);
  });
}

/**
 * Get the full name of an order item
 * @param item_id
 */
export function getFullName(item_id: OrderItemType)
{
  return fullItemName[item_id];
}

/**
 * Title case a string
 * @param str string to turn into title case
 * @returns title cased str
 */
export function toTitleCase(str: string) 
{
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => 
    {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}