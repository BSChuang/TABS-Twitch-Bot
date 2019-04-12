const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const robot = require('robotjs');

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
    'cat1': [760, 'clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth'],
    'cat2': [820, 'halfling', 'farmer', 'hay_baler', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow'],
    'cat3': [880, 'bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king'],
    'cat4': [940, 'sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus'],
    'cat5': [1000, 'headbutter', 'ice_archer', 'brawler', 'berseker', 'valkyrie', 'jarl', 'longship']
}

var typePosX = {
    1: 625,
    2: 735,
    3: 845,
    4: 955,
    5: 1065,
    6: 1175,
    7: 1285
}

var redBounds = {
    'lx': 60,
    'ux': 900,
    'ly': 110,
    'uy': 880
};
var blueBounds = {
    'lx': 1020,
    'ux': 1860,
    'ly': 110,
    'uy': 880
};

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

        moveClick(categoryPos, 950); // category y
        moveClick(typePos, 1025) // type y

        // Clicking the right amount of times
        for (var _ = 0; _ < team[type]; _++) {
            var pos = teamBool ? randPos(redBounds) : randPos(blueBounds);
            moveClick(pos[0], pos[1])
        }
    });
}

exports.startBattle = function () {
    moveClick(960, 40);
}

exports.drawBattle = function (battle) {
    clearBattle();
    make(true, battle['red']);
    make(false, battle['blue']);
}

function clearBattle() {
    moveClick(800, 25);
    moveClick(1100, 25);
}

var winner = -1;
exports.checkDone = function() {
    if (winner == -1) {
        if (robot.getPixelColor(1, 130) == '161c26') {
            setTimeout(checkWinner, 2000);
        }
        return null;
    } else {
        var tempWinner = winner;
        winner = -1;
        return tempWinner;
    }
}

function checkWinner() {
    if (winner == -1) {
        if (robot.getPixelColor(630, 93) == "ffffff") {
            winner = 0;
        } else {
            winner = 1;
        }
        robot.keyTap('tab');
    }
}

function getPos() {
    console.log(robot.getPixelColor(robot.getMousePos().x, robot.getMousePos().y - 10));
    console.log(robot.getMousePos());
}

function update() {
    console.log(checkDone());
}

//drawBattle();
//setInterval(getPos, 500);
//setInterval(update, 3000);
//setInterval(getPos, 500);