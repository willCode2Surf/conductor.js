Conductor.renderConsumer = function(promise, card) {
  var options = Object.create(card.options);
  var domInitialized = false;

  function resetCSS() {
    var newScript = document.createElement('style');

    var css = "";
    css += "html, body {";
    css += "  margin: 0;";
    css += "  padding: 0;";
    css += "}";

    css += "iframe {";
    css += "  display: block;";
    css += "}";

    newScript.innerHTML = css;

    document.head.appendChild( newScript );
  };

  options.events.render = function(args) {
    if(!domInitialized) {
      resetCSS();

      if(card.initializeDOM) {
        card.initializeDOM();
      }

      domInitialized = true;
    }
    card.render.apply(card, args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};
