import { BitFieldResolvable, IntentsString } from 'discord.js';

export interface ClientOptions {
   token: string;
   intents: BitFieldResolvable<IntentsString, number>;
   prefix: string;
   footer: {
      text: string;
      iconURL: string;
   };
}

import { ApplicationCommandDataResolvable } from 'discord.js';

export interface RegisterSlashCommandOptions {
   guildID?: string;
   commands: ApplicationCommandDataResolvable[];
}
