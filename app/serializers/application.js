import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  primaryKey: 'pmid',
  attrs: {
    pubYear: 'pub_year'
  }
});
