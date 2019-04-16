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

function unitsToSelect(arr) {
  $('#redUnit1').empty();
  $.each(arr, function(val) {
    $('#redUnit1').append($("<option></option>").atr("value", value).text(key));
  })
}

let types = {
  'Stone Age': ['clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth'],
  'Farmer': ['halfling', 'farmer', 'hay_baler', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow'],
  'Medieval': ['bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king'],
  'Viking': ['sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus'],
  'Greece': ['headbutter', 'ice_archer', 'brawler', 'berserker', 'valkyrie', 'jarl', 'longship']
}

$(function () {
  $('#cycle').prop('disabled', false);

  $('#redType1').change(function () {
    var type = "";
    $('#redType1 option:selected').each(function() {
      type += $(this).text();
    });

    unitsToSelect(types[type]);
    $("#formatted").html(str);
  });
});