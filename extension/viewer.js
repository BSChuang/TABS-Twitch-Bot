var token = "";
var tuid = "";

var twitch = window.Twitch.ext;

function setAuth(token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    requests[req].headers = {
      'Authorization': 'Bearer ' + token
    }
  });
}

twitch.onContext(function (context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;

  setAuth(token);
});

let teams = ['red', 'blue'];

let types = ['None', 'Stone Age', 'Farmer', 'Medieval', 'Viking', 'Greece'];

let typeUnits = {
  'None': [],
  'Stone Age': ['clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth'],
  'Farmer': ['halfling', 'farmer', 'hay_baler', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow'],
  'Medieval': ['bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king'],
  'Viking': ['sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus'],
  'Greece': ['headbutter', 'ice_archer', 'brawler', 'berserker', 'valkyrie', 'jarl', 'longship']
}

function unitsToSelect(team, index, arr) {
  $(`#${team}Unit` + index).empty();
  arr.forEach(unit => {
    $(`#${team}Unit` + index).append($('<option>', {
      value: unit,
      text: unit
    }));
  })
}

function format() {
  var formatted = "!suggest ";
  var above100 = false;
  teams.forEach(team => {
    var total = 0;
    for (var i = 0; i < 4; i++) {
      var unit = $(`#${team}Unit` + i).val();
      var count = $(`#${team}Count` + i).val();
      if (unit != null) {
        formatted += `${unit}:${count},`;
        total += parseInt(count);
        if (total > 100) {
          above100 = true;
        }
      }
    }
    formatted = `${formatted.substring(0, formatted.length - 1)} `;
  })
  formatted = `${formatted.substring(0, formatted.length - 1)}`;
  if (above100) {
    log("Total units on a side cannot exceed 100!");
  }

  $('#formatted').val(formatted);
}

function log(string) {
  $('#log').html(string);
}

function copy() {
  var copyText = document.getElementById("formatted");
  copyText.select();
  document.execCommand("copy");
  log('Copied!');
}

$(function () {
  teams.forEach(team => {
    for (var i = 0; i < 4; i++) {
      types.forEach(type => {
        $(`#${team}Type${i}`).append($('<option>', {
          value: type,
          text: type
        }));
      })

      for (var j = 1; j < 101; j++) {
        $(`#${team}Count${i}`).append($('<option>', {
          value: j,
          text: j
        }));
      }
    }
  })

  var idDict = {
    'redTypes': "",
    'redUnitsCounts': "",
    'blueTypes': "",
    'blueUnitsCounts': ""
  };
  teams.forEach(team => {
    for (var i = 0; i < 4; i++) {
      idDict[`${team}Types`] += `#${team}Type${i},`;
      idDict[`${team}UnitsCounts`] += `#${team}Unit${i},`;
      idDict[`${team}UnitsCounts`] += `#${team}Count${i},`;
    }
    idDict[`${team}Types`] = idDict[`${team}Types`].substring(0, idDict[`${team}Types`].length - 1);
    idDict[`${team}UnitsCounts`] = idDict[`${team}UnitsCounts`].substring(0, idDict[`${team}UnitsCounts`].length - 1);
  })
  
  $(`${idDict['redTypes']},${idDict['blueTypes']}`).change(function () {
    var type = this.value;
    var index = this.id.slice(-1);
    var team = this.id.slice(0,1) == 'r' ? 'red' : 'blue';
    unitsToSelect(team, index, typeUnits[type]);
    format();
  });

  $(`${idDict['redUnitsCounts']},${idDict['blueUnitsCounts']}`).change(function () {
    format();
  })

  $('#copy').click(function() {
    copy();
  })
});