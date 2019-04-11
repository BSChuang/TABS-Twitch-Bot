const tmi = require('tmi.js');
const cfg = require('./cfg');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const robot = require('robotjs');
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

async function onMessageHandler(target, context, msg, self) {}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

function randPos(dict) {
    // Todo, check if random position has been chosen before
    var x = Math.floor(dict['lx'] + Math.random() * (dict['ux'] - dict['lx']));
    var y = Math.floor(dict['ly'] + Math.random() * (dict['uy'] - dict['ly']));
    return [x, y];
}

function moveClick(x, y) {
    robot.moveMouse(x, y);
    robot.mouseClick();
}

var cats = {
    'cat1': [813, 'clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth'],
    'cat2': [873, 'halfling', 'farmer', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow'],
    'cat3': 933,
    'cat4': 993,
    'cat5': 1053
}

var typePosX = {
    1: 666,
    2: 786,
    3: 906,
    4: 1026,
    5: 1146,
    6: 1266,
    7: 1386
}

var redBounds = {
    'lx': 110,
    'ux': 860,
    'ly': 120,
    'uy': 900
};
var blueBounds = {
    'lx': 1334,
    'ux': 1884,
    'ly': 120,
    'uy': 900
};
var reds = {
    'clubber': 15
};
var blues = {
    'clubber': 5,
    'harvester': 5
}

function make(teamBool, team) {
    Object.keys(team).forEach(type => {
        // Choosing the correct type
        var categoryPos;
        var typePos;
        Object.keys(cats).forEach(cat => {
            var done;
            for (var i = 0; i < 8; i++) {
                if (done) {
                    break;
                }

                if (cats[cat][i] == type) {
                    categoryPos = cats[cat][0];
                    typePos = typePosX[i];
                    done = true;
                    break;
                }
            }
        });

        moveClick(categoryPos, 1020);
        moveClick(typePos, 1100)

        // Clicking the right amount of times
        for (var _ = 0; _ < team[type]; _++) {
            var pos = teamBool ? randPos(redBounds) : randPos(blueBounds);
            moveClick(pos[0], pos[1])
        }
    });
}

function drawBattle() {
    clearBattle();
    make(true, reds);
    make(false, blues);
}

function clearBattle() {
    moveClick(850, 25);
    moveClick(1200, 25);
}

function getPos() {
    console.log(robot.getMousePos());
}


drawBattle();
//setInterval(getPos, 500);