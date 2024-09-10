import { type ChatInputCommandSuccessPayload, Listener, LogLevel } from "@sapphire/framework";
import type { Logger } from "@sapphire/plugin-logger";
import { logSuccessfulCommand } from "../../../lib/Utils";

export class ChatInputCommandSuccessListener extends Listener 
{
  public override async run(payload: ChatInputCommandSuccessPayload) 
  {
    logSuccessfulCommand(payload);
  }

  public override onLoad() 
  {
    this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
    return super.onLoad();
  }
}