function Echonest(api_key) {
  this.init(api_key);
}

Echonest.prototype.init = function(api_key) {
  this.key = api_key;
};

Echonest.prototype.get_related = function(track, callback) {
  var self = this;
  var artists = track.artists.join(',');
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'http://developer.echonest.com/api/v4/playlist/basic',
    data: {
      api_key: self.key,
      format: 'json',
      type: 'artist-radio',
      artist: artists
    },
    success: function(data) {
      var result = [];
      data.response.songs.forEach(function(song) {
        var title = song.title,
            artist = song.artist_name,
            query = 'artist:"' + artist + '" AND title:"' + title + '"',
            search = new models.Search(query);

        search.observe(models.EVENT.CHANGE, function() {
          for (var i=0; i<search.tracks.length; i++) {
            var track = search.tracks[i];
            if (track.name === title && track.artists[0].name === artist) {
              result.push(track);
              break;
            }
          }
        });
        search.appendNext();
      });
      callback(result);
    }
  });
};
