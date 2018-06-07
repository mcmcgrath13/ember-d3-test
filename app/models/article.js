import DS from 'ember-data';

export default DS.Model.extend({
  pmid: DS.attr(),
  title: DS.attr(),
  authors: DS.attr(),
  pubYear: DS.attr('number')
});
