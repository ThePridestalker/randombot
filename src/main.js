var fs = require('fs')
var tmi = require('tmi.js')
var dateManager = require('./dateManager')

var msgDateFileLength = fs.readFileSync('assets/lastMsgDate.txt').toString().length

//!command | newcommandname | whatever you want the bot to say
const theoneandonlyregex = /^!([^\s\n]+)\s?([^\s\n]+)?(.+)?/g

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "randomnoname",
        password: "oauth:rnlawakbaon6pi7h6w65f1xlp7gxli"
    },
    channels: ["#nuuls", "#axelinho95"]
}
var client = new tmi.client(options)

// Connect the client to the server..
client.connect().then(function (data) {
    console.log(client.getOptions())
    listen()
}).catch(function (err) {

})

function listen() {
    //here you can use var mods
    client.on("message", function (channel, user, message, self) {
        // Don't listen to my own messages..
        if (self) return
        // Handle different message types..
        switch (user["message-type"]) {
            case "action":
                //actions are /me <message>
                break
            case "chat":
                handleMsg(channel, message, user)
                break
            case "whisper":
                // This is a whisper..
                break
            default:
                // Something else ?
                break
        }
    })
}

function handleMsg(channel, msg, user) {
    return msg.replace(theoneandonlyregex, (_, command, firstArg, secArg) => {
        return executeCommand(channel, user, command, firstArg, secArg)
    })
}

function executeCommand(channel, user, command, firstArg, secArg) {

    if (msgDateFileLength == 0 | dateManager.compareTimes()) {
        dateManager.saveDate()
        console.log("SOY MOD? " + user.mod)
        if (user.mod) {
            if (command == "addcmd" | command == "deletecmd" | command == "editcmd") {
                switch (command) {
                    case "addcmd":
                        addCommand(channel, firstArg, secArg)
                    case "deletecmd":
                        deleteCommand(channel, firstArg)
                    case "editcmd":
                        editCommand(channel, firstArg, secArg)
                }
            } else {
                doCommand(channel, command)
            }
        }
    }
}

function doCommand(channel, command) {

    let commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'))
    for (let index = 0; index < commandListJsonObj.length; index++) {
        if (command == commandListJsonObj[index].commandName) {
            client.say(channel, commandListJsonObj[index].reply)
        }
    }

}

function addCommand(channel, newCommandName, reply) {

    let commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'))

    for (let index = 0; index < commandListJsonObj.length; index++) {
        if (newCommandName == commandListJsonObj[index].commandName) {
            client.say(channel, "the command " + newCommandName + " already exists")
            return
        }
    }

    commandListJsonObj.push(
        {
            "commandName": newCommandName,
            "reply": reply
        }
    )

    let commandListString = JSON.stringify(commandListJsonObj)
    //save the file
    fs.writeFileSync('assets/commands.json', commandListString, 'utf8')
    client.say(channel, "the command " + newCommandName + " has been added to the list")
}

function deleteCommand(channel, commandName) {

    let commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'))
    let commandListString = JSON.stringify(commandListJsonObj)

    for (let index = 0; index < commandListJsonObj.length; index++) {
        if (commandName == commandListJsonObj[index].commandName)
            commandListString = JSON.stringify(commandListJsonObj.splice(index, 1))
    }
    //save the file
    fs.writeFileSync('assets/commands.json', commandListString, 'utf8')
    client.say(channel, "the command " + commandName + " has been deleted from the list")
}

function editCommand(channel, commandToEdit, reply) {

    let commandListJsonObj = JSON.parse(fs.readFileSync('assets/commands.json'))

    for (let index = 0; index < commandListJsonObj.length; index++) {
        if (commandToEdit == commandListJsonObj[index].commandName) {
            //si el comando existe, se reemplaza el reply por el nuevo reply

            commandListJsonObj[index].reply = reply

            let commandListString = JSON.stringify(commandListJsonObj)
            fs.writeFileSync('assets/commands.json', commandListString, 'utf8')
            client.say(channel, "the command " + commandToEdit + " has been updated in the list")
            return
        }
    }
    client.say(channel, "the command " + commandToEdit + " doesn't exist in the list")
}

function checkDateFile() {
    let msgDateFile = fs.readFileSync('assets/lastMsgDate.txt')
    if (msgDateFile.toString().length == 0)
        fs.writeFileSync('assets/lastMsgDate.txt', "Mon Aug 13 2018 17:03:00 GMT+0100 (Hora de verano GMT)", 'utf8')
}