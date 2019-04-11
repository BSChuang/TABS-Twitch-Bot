const tmi = require('tmi.js');
const MongoClient = require('mongodb').MongoClient;
const cfg = require('./cfg');
const uri = `mongodb+srv://${cfg.getDbUser()}:${cfg.getDbToken()}@tabs-hoskn.mongodb.net/test?retryWrites=true`;

var battling;
const tb = {
  'red': true,
  'RED': true,
  'blue': false,
  'BLUE': false
}
// BOT FUNCTIONS
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

async function done(teamWinner) {
  var betters = await readFromDb("bets", {});
  var reds = 0;
  var blues = 0;
  betters.forEach(better => {
    (better['team']) ? (reds += better['bet']) : (blues += better['bet']);
  });
  if (reds != 0 && blues != 0) {
    var winnerPool = teamWinner ? reds : blues;
    var loserPool = teamWinner ? blues : reds;
    for (var i = 0; i < betters.length; i++) {
      var name = betters[i]['name'];
      var bet = betters[i]['bet'];
      var teamBet = betters[i]['team'];
      var credits = await getCredits(name);
      if (teamBet == teamWinner) {
        var sum = bet / winnerPool * loserPool;
        updateDb("users", {
          'name': name
        }, {
          'credits': credits + sum
        })
        //client.whisper(name, `You won ${sum} credits!`)
      } else {
        updateDb("users", {
          'name': name
        }, {
          'credits': credits - bet
        });
        //client.whisper(name, `You lost ${bet} credits.`)
      }

      deleteDb('bets', {
        'name': name
      });
    }
    client.say('#chil_ttv', `Credits distributed!`)
  } else {
    client.say('#chil_ttv', 'One team was not bet on. No credits given!')
  }

}

async function bet(name, bet, team) {
  if (bet == null && team == null) {
    var credits = await readFromDb("bets", {
      'name': name
    });
    if (credits.length == 0) {
      return new Promise(resolve => {
        resolve(`@${name}, you have not bet!`);
      });
    } else {
      return new Promise(resolve => {
        resolve(`@${name}, you have ${credits[0]['bet']} credits bet.`);
      });
    }
  }

  if (isNaN(bet)) {
    return new Promise(resolve => {
      resolve(`@${name}, you must include a bet amount!`);
    });
  }

  bet = parseInt(bet);
  if (bet < 1) {
    return new Promise(resolve => {
      resolve(name + ", bets cannot be less than one!");
    });
  }
  if (team == null) {
    return new Promise(resolve => {
      resolve(`@${name}, you must include a team name!`);
    });
  }
  if (team != "red" && team != "blue") {
    return new Promise(resolve => {
      resolve(`@${name}, invalid team name!`);
    });
  }

  var credits = await getCredits(name);

  if (credits == null) {
    return new Promise(resolve => {
      resolve(`Welcome, ${name}! 500 credits have been added to your account.`);
    });
  }
  if (credits < bet) {
    return new Promise(resolve => {
      resolve(name + ", you do not have enough credits!");
    });
  }

  var betInfo = await readFromDb("bets", {
    'name': name
  });
  if (betInfo.length == 0) {
    writeToDb("bets", {
      'name': name,
      'bet': bet,
      'team': tb[team]
    });
  } else {
    updateDb("bets", {
      'name': name
    }, {
      'name': name,
      'bet': bet,
      'team': tb[team]
    });
  }

  return new Promise(resolve => {
    resolve(`${name} has bet ${bet} on ${team} team.`);
  });
}

async function getCredits(name) {
  var info = await readFromDb("users", {
    'name': name
  });
  if (info == null) {
    writeToDb("users", {
      'name': name,
      'credits': 500,
      'wins': 0,
      'losses': 0
    })
    return new Promise(resolve => {
      resolve(null);
    })
  } else {
    return new Promise(resolve => {
      resolve(parseInt(info[0]['credits']));
    })
  }


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

function updateDb(coll, doc, dict) {
  MongoClient.connect(uri, function (err, monclient) {
    if (err) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
    } else {
      monclient.db("TABS").collection(coll).updateOne(doc, {
        $set: dict
      }, function (err, res) {
        if (err) {
          console.log('Error occurred while making account\n', err);
        }
      });
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
        monclient.db("TABS").collection(coll).find(dict).toArray(function (err2, res) {
          if (err2) {
            console.log('Error occurred while making account\n', err2);
          } else {
            resolve(res);
          }
        })
      }
    });
  })
}

function deleteDb(coll, doc) {
  MongoClient.connect(uri, function (err, monclient) {
    if (err) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
    } else {
      monclient.db("TABS").collection(coll).deleteOne(doc, function (err, res) {
        if (err) {
          console.log('Error occurred while making account\n', err);
        }
      });
      monclient.close();
    }
  });
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
  var username = context['username'];
  const commandName = msg.trim().split(" ");

  if (username == "chil_bot" && commandName[0] == "BATTLE" && commandName[1] == "START") {
    battling = true;
    console.log("battling...")
  }
  if (username == "chil_bot" && commandName[1] == "WINS") {
    battling = false;
    done(tb[commandName[0]]);
  }

  switch (commandName[0]) {
    case "!dice":
      const num = rollDice();
      client.say(target, `You rolled a ${num}`);
      break;
    case "!credits":
      var credits = await getCredits(username);
      if (credits == null) {
        client.say(target, `Welcome, ${name}! 500 credits have been added to your account.`);
      } else {
        client.say(target, `@${username}, you have ${credits} credits.`);
      }

      break;
    case "!bet":
      if (battling) {
        client.say(target, `@${username}, you cannot bet mid-battle!`);
      } else {
        var response = await bet(username, commandName[1], commandName[2]);
        client.say(target, response);
      }
      break;
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}