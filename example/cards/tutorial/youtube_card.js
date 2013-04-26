Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.requireCSS('/example/cards/tutorial/youtube_card.css');

var card = Conductor.card({
  videoId: null,

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);
    this.loadYouTubeAPI();
    this.videoId = data.videoId;
  },

  initializeDOM: function () {
    $('body').html('<img id="thumbnail" /><div id="player"></div>');
    $('head').append('<script src="https://www.youtube.com/iframe_api"></script>');

    $('#thumbnail').attr('src', 'http://img.youtube.com/vi/' + this.videoId + '/0.jpg');
    this.on('resize', this.resizeThumbnail);
    this.loadVideo(this.videoId);
  },

  render: function (intent, dimensions) {
    this.setDimensions(dimensions);

    switch (intent) {
      case "thumbnail":
        $('#player').hide();
        $('#thumbnail').show();
        break;
      case "small":
      case "large":
        $('#thumbnail').hide();
        $('#player').show();
        break;
      default:
        throw new Error("Unuspported intent '" + intent + "'");
    }
  },

  resizeThumbnail: function () {
    var dimensions = this.getDimensions();
    $('#thumbnail').css({ height: dimensions.height });
  },

  getDimensions: function () {
    if (!this._dimensions) { this.setDimensions(); }
    return this._dimensions;
  },

  setDimensions: function (dimensions) {
    if (dimensions !== undefined) {
      this._dimensions = dimensions;
    } else {
      this._dimensions = {
        height: window.innerHeight,
        width: window.innerWidth
      };
    }

    this.trigger('resize');
  },

  loadVideo: function (videoId) {
    var card = this;

    this.loadYouTubeAPI().then(function (YT) {
      card.loadPlayer(YT);
    });
  },

  loadYouTubeAPI: function () {
    if (!this._youtubePromise) {
      var promise = this._youtubePromise = new Conductor.Oasis.RSVP.Promise();
      if (window.YT) {
        promise.resolve(window.YT);
      } else {
        window.onYouTubeIframeAPIReady = function () {
          promise.resolve(window.YT);
        };
      }
    }

    return this._youtubePromise;
  },

  loadPlayer: function (YT) {
    if (!this._playerPromise) {
      var promise = this._playerPromise = new Conductor.Oasis.RSVP.Promise(),
          card = this;

      card.promise.then(function () {
        var dimensions = card.getDimensions();

        var player = card.player = new YT.Player('player', {
          height: dimensions.height,
          width: dimensions.width,
          videoId: card.videoId,
          playerVars: {
            rel: 0
          },
          events: {
            onReady: function() {
              promise.resolve(player);
            }
          }
        });

        card.on('resize', function () {
          var dimensions = this.getDimensions();
          this.player.setSize(dimensions.width, dimensions.height);
        });
      });
    }

    return this._playerPromise;
  }

});
