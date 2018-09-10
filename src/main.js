const fs = require('fs');
const tmi = require('tmi.js');
const dateManager = require('./dateManager');
const configLoader = require('./configLoader');

//! command | newcommandname | whatever you want the bot to say
const theoneandonlyregex = /^!([^\s\n]+)\s?([^\s\n]+)?(.+)?/g;
// loading the user/password/requestID etc...
const client = new tmi.Client(configLoader.getOptionsConst());

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
  if (dateManager.compareTimes()) {
    if (user.mod) { // if you are mod you can do commands and add, delet, edit
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
      } else {
        doCommand(channel, command);
      }
    } else { // if you are not mod you can do commands but not the add, delet or edit
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
