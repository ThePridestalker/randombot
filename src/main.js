const fs = require('fs');
const tmi = require('tmi.js');
const dateManager = require('./dateManager');

const msgDateFileLength = fs.readFileSync('assets/lastMsgDate.txt').toString().length;

//! command | newcommandname | whatever you want the bot to say
const theoneandonlyregex = /^!([^\s\n]+)\s?([^\s\n]+)?(.+)?/g;

const options = {
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    // TODO: READ THIS FROM CONFIG FILE
    username: 'randomnoname',
    // https://twitchapps.com/tmi/ for oath
    password: 'oauth:XXXXXX', // changed to upload to github
  },
  channels: ['#nuuls', '#axelinho95'],
};
const client = new tmi.Client(options);

// func to initialize lastMsgDate and commands files
(() => {
  // saves the date in lastMsgDate to avoid a NaM in the if condition for date comparison
  dateManager.saveDate();
  // writes [] (empty object) inside commands.json
  const initialObject = '[]';
  fs.writeFileSync('assets/commands.json', initialObject, 'utf8');
})();

function doCommand(channel, command) {
  const commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'));
  for (let index = 0; index < commandListJsonObj.length; index++) {
    if (command === commandListJsonObj[index].commandName) {
      client.say(channel, commandListJsonObj[index].reply);
    }
  }
}

function addCommand(channel, newCommandName, reply) {
  const commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'));

  for (let index = 0; index < commandListJsonObj.length; index++) {
    if (newCommandName === commandListJsonObj[index].commandName) {
      client.say(channel, `the command ${newCommandName} already exists`);
      return;
    }
  }

  commandListJsonObj.push(
    {
      commandName: newCommandName,
      reply,
    },
  );

  const commandListString = JSON.stringify(commandListJsonObj);
  // save the file
  fs.writeFileSync('assets/commands.json', commandListString, 'utf8');
  client.say(channel, `the command ${newCommandName} has been added to the list`);
}

function deleteCommand(channel, commandName) {
  const cmdListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'));
  let commandListString = JSON.stringify(cmdListJsonObj);

  for (let index = 0; index < cmdListJsonObj.length; index++) {
    if (commandName === cmdListJsonObj[index].commandName) {
      commandListString = JSON.stringify(cmdListJsonObj.splice(index, 1));
    }
  }
  // save the file
  fs.writeFileSync('assets/commands.json', commandListString, 'utf8');
  client.say(channel, `the command ${commandName} has been deleted from the list`);
}

function editCommand(channel, commandToEdit, reply) {
  const commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'));

  for (let index = 0; index < commandListJsonObj.length; index++) {
    if (commandToEdit === commandListJsonObj[index].commandName) {
      // si el comando existe, se reemplaza el reply por el nuevo reply

      commandListJsonObj[index].reply = reply;

      const commandListString = JSON.stringify(commandListJsonObj);
      fs.writeFileSync('assets/commands.json', commandListString, 'utf8');
      client.say(channel, `the command ${commandToEdit} has been updated in the list`);
      return;
    }
  }
  client.say(channel, `the command ${commandToEdit} doesn't exist in the list`);
}


function executeCommand(channel, user, command, firstArg, secArg) {
  if (msgDateFileLength === 0 || dateManager.compareTimes()) {
    console.log(`SOY MOD? ${user.mod}`);
    if (user.mod) {
      if (command === 'addcmd' || command === 'deletecmd' || command === 'editcmd') {
        switch (command) {
          case 'addcmd':
            addCommand(channel, firstArg, secArg);
            break;
          case 'deletecmd':
            deleteCommand(channel, firstArg);
            break;
          case 'editcmd':
            editCommand(channel, firstArg, secArg);
            break;
          default:
            break;
        }
      } else { // if you are mod you can do commands
        doCommand(channel, command);
      }
    } else { // if you are not mod you can do commands but not the add delet or edit
      doCommand(channel, command);
    }
  }
}

function handleMsg(channel, msg, user) {
  return msg.replace(theoneandonlyregex, (_, cmd, firstArg, secArg) => {
    executeCommand(channel, user, cmd, firstArg, secArg);
  });
}

function listen() {
  // here you can use var mods
  client.on('message', (channel, user, message, self) => {
    // Don't listen to my own messages..
    if (self) return;
    // Handle different message types..
    switch (user['message-type']) {
      case 'action':
        // actions are /me <message>
        break;
      case 'chat':
        handleMsg(channel, message, user);
        break;
      case 'whisper':
        // This is a whisper..
        break;
      default:
        // Something else ?
        break;
    }
  });
}

// Connect the client to the server..
client.connect().then(() => {
  console.log(client.getOptions());
  listen();
}).catch((err) => {
  console.log(err);
});
