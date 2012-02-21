var _client_width = 0,
    sp = getSpotifyApi(1),
    models = sp.require('sp://import/scripts/api/models'),
    main = $('#mainContainer'),
    EN = new Echonest('UEIQAUFH8LWHXFXZL'),
    storage = new Array(),
    interval;

$('#mainContainer').bind('playerstate', function(event) {
  var player = event.data.player,
      relative_pos = nyan.relative_position(player),
      cat = $('#nyanCat'),
      cat_pos = nyan.calc_location(_client_width, relative_pos);
  nyan.move_nyan(cat, cat_pos);
});

var play_next = function(player) {
  if (storage) {
    player.play(storage.shitf());
  } else {
    populate_playlist(player, function() {
      play_next();
    });
  }
};

var update_cover = function(player) {
    var cover_art = nyan.get_cover_art(player);
    if (cover_art) {
      $('#albumview').html(cover_art);
    }
};

var populate_playlist = function(player, callback) {
  if (storage.length > 1 || !player.track) {
    return;
  }
  EN.get_related(player.track, function(result) {
    storage = result;
    if (callback) callback();
  });
};

var playstate_change = function(player) {
  return function(event) {
    if (event.type !== "playerStateChanged") {
      return;
    }
    update_cover(player);
    main.trigger('playerstate', {player: player});
    if (!event.data.playstate) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      return;
    } else {
      if (!player.track) {
        player.play(storage.shift());
      }
    }
    populate_playlist(player);
    if (!interval) {
      interval = setInterval(function() {
        main.trigger('playerstate', {player: player});
      }, 1000);
    }
  };
};

$(window).resize(function() {
  _client_width = main.width();
});

$(document).ready(function() {
  sp.core.addEventListener("argumentsChanged", function() {
    if(sp.core.getArguments()[0] == 'moar') {
      $('.rbow').show();
    } else {
      $('.rbow').hide();
    }
  });
  _client_width = main.width();
  var player = models.player;

  if (player.track) {
    populate_playlist(player);
  } else {
    // Hardcoded nyan cat yeaaaaaah
    models.Track.fromURI(
      "spotify:track:5CXfVcqBAtCAHhnGmoxBZ9",
      function(track) {
        player.play(track);
        populate_playlist(player);
      });
  }
  // Trigger the player here, to get the cat to correct place at app start
  main.trigger('playerstate', {player:player});
  player.observe(models.EVENT.CHANGE, playstate_change(player));

  update_cover(player);

  $('#nextbutton').bind('click', function() {
    play_next();
  });
  $('#prevbutton').bind('click', function() {
    player.previous();
  });
});

// Read the nyan cat index.html and replace needed parts :p
var temp_html = document.createElement('html');
temp_html.innerHTML = models.readFile('css-nyan-cat/index.html');
main.html($('#mainContainer', temp_html).html());
