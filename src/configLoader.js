
const fs = require('fs');
const dateManager = require('./dateManager');

const options = {
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    // DONT EDIT THIS, ITS READ FROM THE config.json FILE (assets folder)
    username: '',
    // https://twitchapps.com/tmi/ for oath
    password: '',
    // register the app in https://glass.twitch.tv/login and get a client ID
    requestsID: '',
  },
  channels: ['#nuuls', '#axelinho95'],
};

// func to initialize lastMsgDate and commands files
(() => {
  // loads the data from config file
  const config = JSON.parse(fs.readFileSync('assets/config.json'));
  options.identity.username = config.username;
  options.identity.password = config.password;
  options.identity.requestsID = config.requestsID;
  // saves the date in lastMsgDate to avoid a NaM in the if condition for date comparison
  dateManager.saveDate();
  // writes [] (empty object) inside commands.json
  const initialObject = '[]';
  fs.writeFileSync('assets/commands.json', initialObject, 'utf8');
})();

module.exports = {

  getOptionsConst() {
    return options;
  },
  // MOVER ESTOS COMANDOS JUNTO CON EL RESTO DE COMANDOS GENERICOS
  // the channel must contain # before the name
  joinChannel(channel) {
    return options.channels.push(channel);
  },
  // the channel must contain # before the name
  partChannel(channel) {
    const index = options.channels.indexOf(channel);
    if (index > -1) {
      options.channels.splice(index, 1);
      return true;
    }
    return false;
  },

};
