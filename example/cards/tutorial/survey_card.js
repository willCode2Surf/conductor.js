/*global Handlebars*/

Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');

var template = '{{message}}';

Conductor.card({

  activate: function( data ) {
    this.compileTemplates();
  },

  compileTemplates: function() {
    template = Handlebars.compile(template);
  },

  render: function () {
    $('body').html(template({ message: "Hello again, world!" }));
  }
});
