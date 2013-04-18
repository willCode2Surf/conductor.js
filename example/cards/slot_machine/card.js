/*global Handlebars*/

Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');
Conductor.require('/example/libs/jquery.jSlots.js');
Conductor.require('/example/libs/jquery.easing.1.3.js');
Conductor.requireCSS('/example/cards/slot_machine/style.css');

var dashboardTemplate = '<div id="chances"></div>{{#if coins}}<button id="play">Play Now</button>{{/if}}';
var playTemplate =  '<div id="chances"></div><div id="drawing" class="fancy"></div><input type="button" id="spin" value="Spin!"></div><div id="getCoins"><button>{{insertCoinsLabel}}</button><span>for another chance to win</span></div>';
var chancesTemplate = '{{#if coins}}You have {{coins}} chances to win.{{else}}You have no more chances left.{{/if}}';

Conductor.card({
  consumers: {
    slotMachine: function (card) {
      return Conductor.Oasis.Consumer.extend({
        events: {
          addCoin: function() {
            card.coins++;

            if( card.didInsertCoins ) {
              card.didInsertCoins();
            }
          }
        }
      });
    }
  },
  coins: 1,
  winnerNumber: 7,
  insertCoinsLabel: 'Insert coins',
  renderMode: 'dashboard',

  activate: function(data) {
    if( data ) {
      this.coins = data.coins || this.coins;
      this.insertCoinsLabel = data.insertCoinsLabel || this.insertCoinsLabel;
    }
    this.compileTemplates();
  },

  compileTemplates: function() {
    dashboardTemplate = Handlebars.compile( dashboardTemplate );
    playTemplate = Handlebars.compile( playTemplate );
    chancesTemplate = Handlebars.compile( chancesTemplate );
  },

  render: function(intent, dimensions) {
    this.resize( dimensions );

    switch( intent ) {
      case "thumbnail":
      case "small":
      case "large":
        if( this.renderMode === 'dashboard' ) {
          this.renderDashboard();
        } else {
          this.renderPlay();
        }
        break;
      default:
        $('body').html("This card does not support the " + intent + " intent.");
        break;
    }
  },

  resize: function(dimensions) {
    var width = Math.min(dimensions.width, 50);
    var height = Math.min(dimensions.height, 50);
    var size = Math.min(width, height);

    $('img').css({
      width: size,
      height: size
    });
  },

  renderDashboard: function() {
    var self = this;
    this.renderMode = 'dashboard';

    $('body').html( dashboardTemplate( this ) );
    this.renderChances();

    $('#play').click( function( event ) {
      $(this).off('click');
      self.renderPlay();
    });
  },

  renderPlay: function() {
    var self = this;
    this.renderMode = 'play';

    $('body').html( playTemplate( this ) );
    this.renderChances();
    this.renderDrawing();
    if( !this.coins ) {
      $('#spin').hide();
      $('#getCoins').show();
    }

    $('#spin button').click( function( event ) {
      self.play();
    });

    $('#getCoins').click( function(event) {
      self.consumers.slotMachine.send('getCoins');
    });
  },

  play: function() {
    this.renderDrawing();
    this.renderChances();
  },

  renderDrawing: function() {
    var $drawing = $('#drawing'),
        self = this,
        number = 7,
        numberOfSlots = 3;

    $drawing.empty();

    $drawing.append('<ul class="slot"></ul>');
    for( var i=1 ; i<=number ; i++ ) {
      $('ul.slot').append('<li>' + i + '</li>');
    }

    $('.slot').jSlots({
      number: numberOfSlots,
      winnerNumber: this.winnerNumber,
      spinner : '#spin',
      onStart: function() {
        self.coins--;
        $('.slot').removeClass('winner');
        self.didInsertCoins();
      },
      onWin: function(winCount, winners, finalNumbers) {
        $.each( winners, function() {
          this.addClass('winner');
        });
      }
    });
  },

  didInsertCoins: function() {
    this.renderChances();

    if( this.renderMode === 'play' ) {
      if( this.coins ) {
        $('#getCoins').hide();
        $('#spin').show();
      } else {
        $('#spin').hide();
        $('#getCoins').show();
      }
    }
  },

  renderChances: function() {
    $('#chances').html( chancesTemplate( this ) );
  }
});