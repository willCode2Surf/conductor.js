Conductor.card({
  consumers: {
    custom: Conductor.Oasis.Consumer.extend({
      initialize: function (port) {
        port.send('result', 'success');
      }
    })
  }
});
