var _client_width = 0,
    sp = getSpotifyApi(1),
    models = sp.require('sp://import/scripts/api/models'),
    main = $('#mainContainer'),
    storage = new Array(),
    interval;

$('#mainContainer').bind('playerstate', function(event) {
  var player = event.data.player,
      relative_pos = nyan.relative_position(player),
      cat = $('#nyanCat'),
      cat_pos = nyan.calc_location(_client_width, relative_pos);
  nyan.move_nyan(cat, cat_pos);
});

var update_cover = function(player) {
    var cover_art = nyan.get_cover_art(player);
    if (cover_art) {
      $('#albumview').html(cover_art);
    }
};

var playstate_change = function(player) {
  return function(event) {
    console.log(interval, event);
    if (event.type !== "playerStateChanged") {
      return;
    }
    update_cover(player);
    main.trigger('playerstate', {player: player});
    if (!player.playing) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      return;
    }
    console.log('ahem');
    if (!interval) {
      interval = setInterval(function() {
        console.log('trigger lol');
        main.trigger('playerstate', {player: player});
      }, 1000);
    }
  };
};

$(window).resize(function() {
  _client_width = main.width();
});

$(document).ready(function() {
  var cat_bound = false,
      player = models.player;

  sp.core.addEventListener("argumentsChanged", function() {
    if(sp.core.getArguments()[0] == 'moar') {
      $('.rbow').show();
    } else {
      $('.rbow').hide();
    }
  });
  _client_width = main.width();

  if (!player.track) {
    // Hardcoded nyan cat yeaaaaaah
    models.Track.fromURI(
      "spotify:track:5CXfVcqBAtCAHhnGmoxBZ9",
      function(track) {
        player.play(track);
      });
  }

  // Trigger the player here, to get the cat to correct place at app start
  main.trigger('playerstate', {player:player});
  player.observe(models.EVENT.CHANGE, playstate_change(player));

  update_cover(player);

  $('#nyanCat')
    .attr('draggable', 'true')
    .bind('dragstart', function(e) {
      if (!player.track || cat_bound) {
        return;
      }

      var self = $(this),
          _end_triggered = false,
          prev = e.clientX;

      cat_bound = true;
      console.log('dragstart');

      self.removeClass('animatenyan');
      var movefun = function(e) {
        var diff = Math.abs(e.clientX - prev);
        if (diff > 10) {
          nyan.move_nyan(self, e.clientX);
        }
      };
      main.bind('mousemove', movefun);
      $(document).one('mouseup', function(e) {
        var cat_relative = nyan.cat_relative_position(self);

        main.unbind('mousemove', movefun);
        self.addClass('animatenyan');
        cat_bound = false;

        if(!_end_triggered) {
          _end_triggered = true;
          models.player.position = models.player.track.duration * cat_relative;
        }
      });
    });
});

// Read the nyan cat index.html and replace needed parts :p
var temp_html = document.createElement('html');
temp_html.innerHTML = models.readFile('css-nyan-cat/index.html');
main.html($('#mainContainer', temp_html).html());
$('#nyanCat').addClass('animatenyan');