import Component from '@ember/component';

export default Component.extend({
  classNames: ['mesh-filter'],
  value: 'epilepsy',

  init() {
    this._super(...arguments);
    this.get('filter')(this.get('value')).then((allResults) => {
      this.set('results', allResults.results);
    });
  },

  actions: {
    handleFilterEntry() {
      let filterInputValue = this.get('value');
      let filterAction = this.get('filter');
      filterAction(filterInputValue).then((filterResults) => {
        if (filterResults.query === this.get('value')) {
          this.set('results', filterResults.results);
        }
      });
    }
  }
});
