import { MessageCommand } from '../../Structures/MessageCommand';

export default new MessageCommand({
   name: 'test',
   description: 'test',
   category: 'fun',
   permission: 'ADMINISTRATOR',
   execute: async ({ args, message }) => {
      return message.channel.send('test');
   },
});
