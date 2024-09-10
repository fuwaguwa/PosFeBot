import { rootDir } from "./Constants";

import { ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";
import "@sapphire/plugin-api/register";
import * as colorette from "colorette";
import { setup } from "@skyra/env-utilities";
import { join } from "path";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);
ApplicationCommandRegistries.setDefaultGuildIds(["1084148320684998676"]);

setup({ path: join(rootDir, ".env"), });

colorette.createColors({ useColor: true, });