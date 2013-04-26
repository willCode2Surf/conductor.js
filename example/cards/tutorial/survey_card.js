/*global Handlebars*/

Conductor.card({
  activate: function( data ) {
    this.message = "hello world";
  },

  render: function () {
    document.body.innerHTML = this.message;
  }
});
