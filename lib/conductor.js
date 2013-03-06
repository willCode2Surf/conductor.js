(function(globals) {
  var requiredUrls = [],
      xhrPort;

  var Conductor = globals.Conductor = function(options) {
    this.options = options || {};
  };

  Conductor.Oasis = requireModule('oasis');

  Conductor.prototype = {
    load: function(url, data) {
      var capabilities = ['xhr', 'metadata'];

      if (this.options.testing) {
        capabilities.push('assertion');
      }

      var sandbox = Conductor.Oasis.createSandbox({
        url: url,
        dependencies: ['/dist/conductor.js-0.1.0.js'],
        capabilities: capabilities,
        services: {
          xhr: Conductor.XHRService,
          metadata: Conductor.MetadataService
        }
      });

      sandbox.data = data;

      sandbox.start();

      return new Conductor.Card(sandbox);
    }
  };

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.card = function(options) {
    var metadataPromise = new Conductor.Oasis.RSVP.Promise();

    metadataPromise.then(function(data) {
      options.data = data;
    });

    var renderPromise = new Conductor.Oasis.RSVP.Promise();

    renderPromise.then(function(args) {
      options.render.apply(options, args);
    });

    var xhrPromise = new Conductor.Oasis.RSVP.Promise();

    Conductor.Oasis.connect({
      consumers: {
        xhr: Conductor.xhrConsumer(requiredUrls, xhrPromise),
        render: Conductor.renderConsumer(renderPromise),
        metadata: Conductor.metadataConsumer(metadataPromise)
      }
    });

    Conductor.Oasis.RSVP.all([ xhrPromise, metadataPromise ]).then(function() {
      options.activate();
    });
  };

})(window);