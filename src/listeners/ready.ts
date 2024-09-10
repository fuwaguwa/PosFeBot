import { Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({ once: true, })
export class ReadyEvent extends Listener 
{
  public override async run() 
  {
    this.container.logger.info("Coffee is ready!");
  }
}