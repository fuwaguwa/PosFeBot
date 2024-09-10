import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { postChecking } from "../lib/Database";
import { TextChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ once: true, })
export class ReadyEvent extends Listener 
{
  public override async run() 
  {
    this.container.logger.info("Coffee is ready!");

    const guild = await this.container.client.guilds.fetch("1084148320684998676");
    const channel = (await guild.channels.fetch("1282585674331066402")) as TextChannel;
    await postChecking(channel);
  }
}