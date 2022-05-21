import {
   ApplicationCommandDataResolvable,
   Client,
   ClientEvents,
   Collection,
} from 'discord.js';
import { ClientOptions, RegisterSlashCommandOptions } from '../types/Client';
import { MessageCommandType } from '../types/MessageCommand';
import { readdirSync } from 'fs';
import path from 'path';
import { Event } from '../Structures/Event';
import { FunctionType } from '../types/Function';
import colors from '../colors.json';
import ConsoleLogger from '../utils/consolelogger';
import { SlashCommandType } from '../types/SlashCommand';

export class ExtentedClient extends Client {
   public commands: Collection<string, MessageCommandType> = new Collection();
   public functions: Collection<string, FunctionType> = new Collection();
   public slashCommands: Collection<string, SlashCommandType> =
      new Collection();
   public readonly token: string;
   public prefix: string;
   public colors: typeof colors = colors;
   public footer: {
      text: string;
      iconURL: string;
   };

   constructor({ intents, token, prefix, footer }: ClientOptions) {
      super({
         intents,
      });

      this.token = token;
      this.prefix = prefix;
      this.footer = footer;
   }

   public async start() {
      this.login(this.token);
      await this.registerMessageCommands();
      await this.registerFunctions();
      await this.registerEvents();
   }

   public async importFile(filePath: string) {
      return (await import(filePath))?.default;
   }

   async registerDiscordSlashCommands({
      commands,
      guildID,
   }: RegisterSlashCommandOptions) {
      if (guildID) {
         this.guilds.cache.get(guildID)?.commands.set(commands);
         new ConsoleLogger(`Registering commands to ${guildID}`).info();
      } else {
         this.application?.commands.set(commands);
         new ConsoleLogger('Registering global commands').info();
      }
   }

   public async registerMessageCommands() {
      const commandsPath = path.resolve('dist', 'commands');
      const commandDirectorys = readdirSync(commandsPath, {
         withFileTypes: true,
      }).filter((dirent) => dirent.isDirectory());
      for (const directory of commandDirectorys) {
         const commandFiles = readdirSync(
            path.resolve(commandsPath, directory.name),
         ).filter((file) => file.endsWith('.js'));
         for (const file of commandFiles) {
            const command: MessageCommandType = await this.importFile(
               path.resolve(commandsPath, directory.name, file),
            );
            this.commands.set(command.name, command);
         }
      }
   }

   public async registerSlashCommands() {
      const slashCommands: ApplicationCommandDataResolvable[] = [];
      const slashCommandsPath = path.resolve('dist', 'slashcommands');
      const slashCommandDirectorys = readdirSync(slashCommandsPath, {
         withFileTypes: true,
      }).filter((dirent) => dirent.isDirectory());
      for (const directory of slashCommandDirectorys) {
         const slashCommandFiles = readdirSync(
            path.resolve(slashCommandsPath, directory.name),
         ).filter((file) => file.endsWith('.js'));
         for (const file of slashCommandFiles) {
            const slashCommand: SlashCommandType = await this.importFile(
               path.resolve(slashCommandsPath, directory.name, file),
            );
            if (!slashCommand.name) continue;
            this.slashCommands.set(slashCommand.name, slashCommand);
            slashCommands.push(slashCommand);
         }
      }

      this.on('ready', () => {
         this.registerDiscordSlashCommands({
            commands: slashCommands,
         });
      });
   }

   public async registerEvents() {
      const eventsPath = path.resolve('dist', 'events');
      const eventFiles = readdirSync(eventsPath, {
         withFileTypes: true,
      }).filter((dirent) => dirent.isFile());
      for (const file of eventFiles) {
         const event: Event<keyof ClientEvents> = await this.importFile(
            path.resolve(eventsPath, file.name),
         );
         this.on(event.event, event.execute);
      }
   }

   public async registerFunctions() {
      const functionsPath = path.resolve('dist', 'functions');
      const functionFiles = readdirSync(functionsPath, {
         withFileTypes: true,
      }).filter((dirent) => dirent.isFile());
      for (const file of functionFiles) {
         const functionType: FunctionType = await this.importFile(
            path.resolve(functionsPath, file.name),
         );
         this.functions.set(functionType.name, functionType);
      }
   }
}
