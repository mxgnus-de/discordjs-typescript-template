import { Permissions } from 'discord.js';
import { bot } from '..';
import { Event } from '../Structures/Event';

export default new Event('messageCreate', (message) => {
   const { content } = message;
   if (
      message.author.bot ||
      !content.toLowerCase().startsWith(bot.prefix) ||
      message.channel.type === 'DM'
   )
      return;
   const args = content.slice(bot.prefix.length).split(' ');
   const commandName = args[0].toLowerCase();
   args.shift();

   const command =
      bot.commands.get(commandName) ||
      bot.commands.find((cmd) => {
         return cmd.aliases?.includes(commandName) ? true : false;
      });

   if (!command)
      return message.channel.send({
         embeds: [bot.functions.get('commandnotfound')?.execute({})],
      });
   if (command.isDisabled)
      return message.channel.send({
         embeds: [bot.functions.get('commanddisabled')?.execute({})],
      });

   if (command.permission) {
      const hasPermission = message.member?.permissions.has(command.permission);
      if (!hasPermission)
         return message.channel.send({
            embeds: [
               bot.functions
                  .get('nopermission')
                  ?.execute({ permission: command.permission }),
            ],
         });
   }
   command.execute({
      args,
      message,
   });
});
