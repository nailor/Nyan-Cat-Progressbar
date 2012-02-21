var nyan = (function() {
  var NYAN_START_POS = -155;
  var ns = {};

  ns.relative_position = function(player) {
    if (!player.track) {
      return 0;
    }
    return player.position / player.track.duration;
  };

  ns.calc_location = function(maxwidth, modifier) {
    return maxwidth * modifier;
  };

  ns.tail_width = function(catpos) {
    return catpos / 4 + 2;
  };

  ns.tail_left = function(tail_width, tail_number) {
    return -((tail_width - 1) * tail_number - 5);
  };

  ns.move_nyan = function(cat, position) {
    var tail_width = nyan.tail_width(position),
        tail_update_fn =  function() {
          $('.rainbow', cat).each(function(i) {
            var left = nyan.tail_left(tail_width, i+1);
            $(this).css({left: left + 'px', width: tail_width + 'px'});
          });
        };
    if (position > cat.offset().left) {
      tail_update_fn();
    } else {
      cat.bind('webkitTransitionEnd', function transitionend() {
        tail_update_fn();
        cat.unbind('webkitTransitionEnd', transitionend);
      });
    }
    cat.css('left', position + 'px');
  };

  ns.get_cover_art = function(player) {
    if (!player.track) {
      return false;
    }
    var cover = player.track.image;
    var image = $('<img>').attr('src', cover);
    return image;
  };

  return ns;
})();
