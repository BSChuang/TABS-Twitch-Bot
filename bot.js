const tmi = require('tmi.js');
const MongoClient = require('mongodb').MongoClient;
const cfg = require('./cfg');

// BOT FUNCTIONS
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function make(coll) {
  collection.insertOne({
    'uid': 'test',
    'credits': 1
  }, function (err, res) {
    if (err) throw err;
    console.log("Added");
  })
}

console.log(`${cfg.getTwitchUser()}`);

const uri = `mongodb+srv://${cfg.getDbUser()}:${cfg.getDbToken()}@tabs-hoskn.mongodb.net/test?retryWrites=true`;
MongoClient.connect(uri, function (err, monclient) {
  if (err) {
    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
  } else {
    const collection = monclient.db("TABS").collection("users");
    /* collection.insertOne({
      'uid': 'test',
      'credits': 1
    }, function (err, res) {
      if (err) throw err;
      console.log("Added");
    }) */

    // Define configuration options
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
      client.action('chil_ttv', 'hello');
    });

    function onMessageHandler(target, context, msg, self) {
      if (self) {
        return;
      } // Ignore messages from the bot

      // Remove whitespace from chat message
      const commandName = msg.trim();

      if (commandName === '!dice') {
        const num = rollDice();
        client.say(target, `You rolled a ${num}`);
        console.log(`* Executed ${commandName} command`);
    
      } else if (commandName == "!make") {
        make(coll);
        client.say(target, `Welcome`);
    
      } else {
        console.log(`* Unknown command ${commandName}`);
      }
    }

    // Called every time the bot connects to Twitch chat
    function onConnectedHandler(addr, port) {
      console.log(`* Connected to ${addr}:${port}`);
    }


    monclient.close();
  }

});