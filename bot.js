const tmi = require('tmi.js');
//const https = require('https');
var XMLHttpRequest = require('xhr').XMLHttpRequest;
//const MongoClient = require('mongodb').MongoClient;
const cfg = require('./cfg');
const game = require('./tabs');
const uri = `mongodb+srv://${cfg.getDbUser()}:${cfg.getDbToken()}@tabs-hoskn.mongodb.net/test?retryWrites=true`;

var bets = {};
var suggested = {};
var votes = {};

const units = [
  'clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth',
  'halfling', 'farmer', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow',
  'bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king',
  'sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus',
  'headbutter', 'ice_archer', 'brawler', 'berserker', 'valkyrie', 'jarl', 'longship'
]


function vote(name, votee) {
  var response = "";
  if (votee == null) {
    Object.keys(suggested).forEach(suggester => {
      response += `${suggester}: ${suggestionToString(suggester)}\n`;
    })
  } else {
    if (Object.keys(suggested).includes(votee)) {
      votes[name] = votee;
      response = `@${name}, you have voted for ${votee}.`;
    } else {
      response = `@${name}, invalid name.`;
    }
  }
  return response;
}

function chooseSuggestion() {
  var winner;
  if (Object.keys(votes).length == 0) {
    winner = Object.keys(suggested)[Math.floor(Math.random() * Object.keys(suggested).length)];
  } else {
    winner = Object.keys(votes).reduce((a, b) => obj[a] > obj[b] ? a : b);
  }
  client.say("#chil_ttv", `${winner} won with ${suggestionToString(winner)}!`);
  return suggested[winner];
}

async function done(teamWinner) {
  var betters = Object.keys(bets);
  var sum = betSum();
  var reds = sum[0];
  var blues = sum[1];
  if (reds != 0 && blues != 0) {
    var winnerPool = teamWinner ? reds : blues;
    var loserPool = teamWinner ? blues : reds;
    for (var i = 0; i < betters.length; i++) {
      var bet = bets[betters[i]]['bet'];
      var teamBet = bets[betters[i]]['team'];
      var betterInfo = await readFromDb("users", {
        'name': name
      });
      var credits = betterInfo[0]['credits'];
      if (teamBet == teamWinner) {
        var sum = bet / winnerPool * loserPool;
        updateDb("users", {
          'name': name
        }, {
          'credits': credits + sum,
          'wins': betterInfo[0]['wins'] + 1
        })
        client.whisper(name, `You won ${sum} credits!`)
      } else {
        updateDb("users", {
          'name': name
        }, {
          'credits': credits - bet,
          'losses': betterInfo[0]['losses'] + 1
        });
        client.whisper(name, `You lost ${bet} credits.`)
      }
    }
    client.say('#chil_ttv', `Credits distributed!`)
  } else {
    client.say('#chil_ttv', 'One team was not bet on. No credits given!')
  }
  bets = {};
}

function betSum() {
  var betters = Object.keys(bets);
  var reds = 0;
  var blues = 0;
  betters.forEach(name => {
    (bets[name]['team'] == "red") ? (reds += bets[name]['bet']) : (blues += bets[name]['bet']);
  });
  return [reds, blues];
}

function suggest(name, reds, blues) {
  if (reds == null && blues == null) {
    if (Object.keys(suggested).includes(name)) {
      return `@${name}, you suggested ${suggestionToString(name)}.`;
    } else {
      return `@${name}, you have not submit a suggestion!`;
    }
  }

  var redDict = createTeam(reds);
  var blueDict = createTeam(blues);

  if (redDict == null || blueDict == null) {
    return `@${name}, your battle was formatted incorrectly or the total units on a side exceeded 100.`;
  }

  suggested[name] = {
    'red': redDict,
    'blue': blueDict
  }

  return `@${name}, thank you for your suggestion!`;
}

function createTeam(team) { //clubber:5,protector:3
  var dict = {};
  var arr = team.split(",");
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    var split = arr[i].split(":");
    if (!units.includes(split[0]) || isNaN(split[1]) || parseInt(split[1]) < 1 || parseInt(split[1]) > 100) {
      return null;
    }
    dict[split[0]] = parseInt(split[1]);
    total += parseInt(split[1]);
  }
  if (total > 100) {
    return null;
  }
  return dict;
}

function suggestionToString(name) {
  return `${dictToString(suggested[name]['red'])} vs. ${dictToString(suggested[name]['blue'])}`
}

function dictToString(dict) {
  var str = "";
  Object.keys(dict).forEach(key => {
    str += `${dict[key]} ${key}s, `
  })
  return str.substring(0, str.length - 2)
}

async function bet(name, bet, team) {
  if (state != "bet") {
    return new Promise(resolve => {
      resolve(`@${name}, you can only bet during the betting phase!`);
    });
  }
  if (bet == null && team == null) {
    if (!Object.keys(bets).includes(name)) {
      return new Promise(resolve => {
        resolve(`@${name}, you have nothing bet!`);
      });
    } else {
      return new Promise(resolve => {
        resolve(`@${name}, you have ${bets[name]['bet']} credits bet on ${bets[name]['team']} team.`);
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

  bets[name] = {
    'bet': bet,
    'team': team
  };

  return new Promise(resolve => {
    resolve(`${name} has bet ${bet} on ${team} team.`);
  });
}

async function getCredits(name) {
  var info = await readFromDb("users", {
    'name': name
  });
  if (info.length == 0) {
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

async function updateWrite(coll, doc, dict) {
  MongoClient.connect(uri, function (err, monclient) {
    if (err) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
    } else {
      monclient.db("TABS").collection(coll).updateOne(doc, {
        $set: dict
      }, {
        upsert: true
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

async function leaderboard() {
  return new Promise(resolve => {
    MongoClient.connect(uri, function (err, monclient) {
      if (err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
      } else {
        monclient.db("TABS").collection("users").find().sort({
          'credits': -1
        }).toArray(function (err2, res) {
          if (err2) {
            console.log('Error occurred while making account\n', err2);
          } else {
            var len = res.length < 5 ? res.length : 5;
            var response = "";
            for (var i = 0; i < len; i++) {
              response += `${i+1}: ${res[i]['name']} with ${res[i]['credits']} credits | `;
            }
            resolve(response.substring(0, response.length - 2));
          }
        })
      }
    });
  })
}

async function standing(name) {
  return new Promise(resolve => {
    MongoClient.connect(uri, function (err, monclient) {
      if (err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
      } else {
        monclient.db("TABS").collection("users").find().sort({
          'credits': -1
        }).toArray(function (err2, res) {
          if (err2) {
            console.log('Error occurred while making account\n', err2);
          } else {
            var response = "";
            for (var i = 0; i < res.length; i++) {
              if (res[i]['name'] == name) {
                response = `@${name}, you are ${i+1} out of ${res.length} betters with ${res[i]['credits']} credits.`;
                break;
              }
            }
            resolve(response);
          }
        })
      }
    });
  })
}

// 
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
  test();
});

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

async function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  }
  var username = context['username'];
  const commandName = msg.trim().split(" ");

  switch (commandName[0]) {
    case "!leaderboard":
      var response = await leaderboard(username);
      client.say(target, response);
      break;
    case "!standing":
      var response = await standing(username);
      client.say(target, response);
      break;
    case "!credits":
      var credits = await getCredits(username);
      if (credits == null) {
        client.say(target, `Welcome, ${username}! 500 credits have been added to your account.`);
      } else {
        client.say(target, `@${username}, you have ${credits} credits.`);
      }
      break;
    case "!vote":
      if (state == "vote") {
        var response = vote(username, commandName[1]);
        client.say(target, response);
      } else {
        client.say(target, `@${username}, you can only vote during the voting phase.`);
      }
      break;
    case "!bet":
      if (state == "vote") {
        client.say(target, `@${username}, you can only vote during the voting phase.`);
      } else {
        var response = await bet(username, commandName[1], commandName[2]);
        client.say(target, response);
      }
      break;
    case "!suggest": // "!battle clubber:5 clubber:10"
      var response;
      if (state == "vote") {
        response = `@${username}, you cannot suggest during the voting phase!`;
      } else if (commandName.length != 3 && commandName.length != 1) {
        response = `@${username}, incorrect battle format!`
      } else {
        response = await suggest(username, commandName[1], commandName[2]);
      }
      client.say(target, response);
      break;
  }
}

var suggestLen = 31;
var voteLen = 16;
var betLen = 16;
var battleLen = 241;
var timer = suggestLen;
var state;

function update() {
  switch (state) {
    case "suggest":
      if (timer <= 0) {
        if (Object.keys(suggested).length == 0) {
          timer = suggestLen;
          client.say('#chil_ttv', `No suggestions given! Restarting suggestion phase.`);
        } else {
          timer = voteLen;
          state = "vote";
          client.say('#chil_ttv', `${vote()}`)
        }
      } else if (timer == 30 || timer == 10 || timer <= 3) {
        var response = `${timer} seconds left to suggest a battle!`
        if (timer == 30) {
          response += ' (you can also suggest any time except the voting phase)'
        }
        client.say('#chil_ttv', response);
      }
      break;
    case "vote":
      if (timer <= 0) {
        timer = betLen;
        state = "bet";
        game.drawBattle(chooseSuggestion());
        suggested = {};
      } else if (timer == 15 || timer <= 3) {
        client.say('#chil_ttv', `${timer} seconds left to vote!`);
      }
      break;
    case "bet":
      if (timer <= 0) {
        timer = battleLen;
        state = "battle";
        var sum = betSum();
        client.say('#chil_ttv', `${sum[0]} credits on red and ${sum[1]} credits on blue!`);
        client.say('#chil_ttv', `BATTLE BEGIN`);
        game.startBattle();
      } else if (timer == 15 || timer <= 3) {
        client.say('#chil_ttv', `${timer} seconds left to bet!`);
      }
      break;
    case "battle":
      if (timer <= 0) {
        client.say('#chil_ttv', `Battle has ended in a draw!`);
        timer = suggestLen;
        state = "suggest";
      } else if (timer == 60 || timer == 30 || timer == 10 || timer <= 3) {
        client.say('#chil_ttv', `${timer} seconds left until draw!`);
      }
      if (timer < 238 && timer % 3) {
        var winner = game.checkDone();
        if (winner != null) {
          done(winner);
          timer = suggestLen;
          state = "suggest";
        }
      }
      break;
  }
  timer--;
}

state = "suggest";
setInterval(update, 1000);