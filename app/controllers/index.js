import Controller from '@ember/controller';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartLayout: {
        // Layout options
        // See https://plot.ly/javascript/reference/#layout
      },
      chartOptions: {
        // Override default options from config/environment.js & plotly.js
        // See https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js
      },
      // Component will listen for these events and forward them via onPlotlyEvent
      plotlyEvents: ['plotly_restyle']
    });
  },

  actions: {
    filterByMeSH(param) {
      if (param !== '') {
        return this.get('store').query('article', { mesh: param }).then((results) => {
          this.set('model',results);
          return { query: param, results: results };
        });
      } else {
        return this.get('store').findAll('article').then((results) => {
          this.set('model',results);
          return { query: param, results: results };
        });
      }
    }
  },

  columns: [
    {propertyName: "id", title: "PMID"},
    {propertyName: "title", title: "Article Title"},
    {propertyName: "authors", title: "Authors"},
    {propertyName: "pubYear", title: "Publication Year"}
  ],

  groupCount: computed('model' ,function() {
    if (this.get('model') !== null) {
      var cnts = _.countBy(this.get('model').getEach('pubYear'))
      var vals = []
      _.forEach(cnts, function(value, key) {
        vals.push({x: key, y: value})
      })
      return vals
    }
  })
})
