import { ExtentedClient } from './Structures/Client';

export const bot = new ExtentedClient({
   intents: 32767,
   token: '',
   prefix: '',
   footer: {
      text: '',
      iconURL: '',
   },
});

bot.start();
