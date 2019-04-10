const tmi = require('tmi.js');
const MongoClient = require('mongodb').MongoClient;
const cfg = require('./cfg');
const uri = `mongodb+srv://${cfg.getDbUser()}:${cfg.getDbToken()}@tabs-hoskn.mongodb.net/test?retryWrites=true`;

// BOT FUNCTIONS
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function make(name) {
  writeToDb("users", {
    'uid': name,
    'credits': 500
  })
  return "Welcome, " + name + "! 500 credits have been added to your account";
}

async function getCredits(name) {
  credits = await readFromDb("users", {'uid': name});
  return new Promise(resolve => {
    resolve(name + " has " + parseInt(credits['credits']) + " credits.");
  })
}

function writeToDb(coll, dict) {
  MongoClient.connect(uri, function (err, monclient) {
    if (err) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
    } else {
      monclient.db("TABS").collection(coll).insertOne(dict, function (err, res) {
        if (err) {
          console.log('Error occurred while making account\n', err);
        }
      })
      monclient.close();
    }
  });
}

async function readFromDb(coll, dict) {
  return new Promise(resolve => {
    MongoClient.connect(uri, function (err, monclient) {
      if (err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
      } else {
        monclient.db("TABS").collection(coll).findOne(dict, function (err2, res) {
          if (err2) {
            console.log('Error occurred while making account\n', err2);
          } else {
            console.log(res);
            resolve(res);
            //monclient.close();
          }
        })
      }
    });
  })
  
}

const opts = {
  identity: {
    username: cfg.getTwitchUser(),
    password: cfg.getTwitchToken()
  },
  connection: {
    cluster: 'aws',
    reconnect: true,
  },
  channels: [
    cfg.getTwitchChannel()
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

client.on('connected', (address, port) => {
  //client.action('chil_ttv', 'hello');
});

async function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  var username = context['username'];
  // Remove whitespace from chat message
  const commandName = msg.trim().split(" ");

  if (commandName[0] === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);

  } else if (commandName[0] == "!make") {
    client.say(target, make(username));
  } else if (commandName[0] == "!credits") {
    response = await getCredits(username);
    client.say(target, response);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}