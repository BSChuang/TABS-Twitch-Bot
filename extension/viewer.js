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

  // enable the button
  $('#cycle').removeAttr('disabled');

  setAuth(token);
});

function updateBlock(hex) {
  $('#color').css('background-color', hex);
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function unitsToSelect(index, arr) {
  $('#redUnit' + index).empty();
  arr.forEach(unit => {
    $('#redUnit' + index).append($('<option>', {
      value: unit,
      text: unit
    }));
  })
}

function format() {
  var formatted = "!suggest ";
  
  for (var i = 0; i < 5; i++) {
    var unit = $('#redUnit' + i).val();
    var count = $('#redCount' + i).val();
    if (unit != null) {
      formatted += `${unit}:${count},`;
    }
  }
  $('#formatted').html(`${formatted.substring(0, formatted.length - 1)}`);
}

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

$(function () {
  teams.forEach(team => {
    for (var i = 0; i < 5; i++) {
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
    for (var i = 0; i < 5; i++) {
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

    unitsToSelect(index, typeUnits[type]);
    format();
  });

  $(idDict['redUnitsCounts']).change(function () {
    format();
  })
});