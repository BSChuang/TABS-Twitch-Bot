const robot = require('robotjs');

function randPos(dict) {
    // Todo, check if random position has been chosen before
    var x = Math.floor(dict['lx'] + Math.random() * (dict['ux'] - dict['lx']));
    var y = Math.floor(dict['ly'] + Math.random() * (dict['uy'] - dict['ly']));
    return [x, y];
}

function moveClick(x, y) {
    robot.moveMouse(x, y);
    robot.mouseClick("left", true);
}

var cats = {
    'cat1': [760, 'clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth'],
    'cat2': [820, 'halfling', 'farmer', 'hay_baler', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow'],
    'cat3': [880, 'bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king'],
    'cat4': [940, 'sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus'],
    'cat5': [1000, 'headbutter', 'ice_archer', 'brawler', 'berserker', 'valkyrie', 'jarl', 'longship']
}

const units = {
    'clubber': 60,
    'protector': 80,
    'spear_thrower': 120,
    'stoner': 160,
    'bone_mage': 300,
    'chieftain': 400,
    'mammoth': 2230,
    'halfling': 60,
    'farmer': 80,
    'hay_baler': 140,
    'potionseller': 240,
    'harvester': 490,
    'wheelbarrow': 1000,
    'scarecrow': 1200,
    'bard': 60,
    'squire': 100,
    'archer': 140,
    'priest': 180,
    'knight': 900,
    'catapult': 1050,
    'the_king': 1400,
    'sarissa': 90,
    'shield_bearer': 100,
    'hoplite': 180,
    'snake_archer': 340,
    'ballista': 950,
    'minotaur': 1520,
    'zeus': 2000,
    'headbutter': 90,
    'ice_archer': 160,
    'brawler': 220,
    'berserker': 240,
    'valkyrie': 500,
    'jarl': 850,
    'longship': 1000
}

const small = [ // 0-200
    'clubber',
    'protector',
    'spear_thrower',
    'stoner',
    'halfling',
    'farmer',
    'hay_baler',
    //'bard',
    'squire',
    'archer',
    'priest',
    'sarissa',
    'shield_bearer',
    'hoplite',
    'headbutter',
    'ice_archer',
]
const medium = [ // 201-1000
    'bone_mage',
    'chieftain',
    'potionseller',
    'harvester',
    'wheelbarrow',
    'knight',
    'snake_archer',
    'ballista',
    'brawler',
    'berserker',
    'valkyrie',
    'jarl',
    'longship'
]
const large = [ // 1001+
    'mammoth',
    'scarecrow',
    'catapult',
    'the_king',
    'minotaur',
    'zeus',
]

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
    robot.setKeyboardDelay(2000);
    robot.keyToggle('w', 'down');
    robot.keyToggle('w', 'up');

}

exports.drawBattle = function (battle) {
    robot.setMouseDelay(2);
    clearBattle();
    make(true, battle['red']);
    make(false, battle['blue']);
}

function clearBattle() {
    moveClick(800, 25);
    moveClick(1100, 25);
}

var winner = -1;
exports.checkDone = function () {
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

exports.getUnits = function () {
    return units;
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

exports.randomBattle = function () {
    const max = rand(6000, 12000);
    var battle = {
        'red': makeSide(max),
        'blue': makeSide(max)
    }
    return battle;
}

function makeSide(max) {
    var side = {}
    var largeUnit = large[rand(0, large.length)];
    var largeCount = rand(0, 4);
    if (largeCount > 0) {
        side[largeUnit] = largeCount;
        max -= units[largeUnit]
    }
    if (max >= 0) {
        var mediumUnit = medium[rand(0, medium.length)];
        side[mediumUnit] = 0;
        while (max > 2000) {
            max -= units[mediumUnit]
            side[mediumUnit] = side[mediumUnit] + 1;
        }
        if (max >= 0) {
            var smallUnit = small[rand(0, small.length)];
            side[smallUnit] = 0;
            while (max > 0) {
                max -= units[smallUnit]
                side[smallUnit] = side[smallUnit] + 1;
            }
        }
    }
    return side;

}

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min));
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