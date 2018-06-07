import { A } from '@ember/array';
import Component from '@ember/component';
import EmberObject, { observer } from '@ember/object';
//import { observes } from '@ember-decorators/object';
import { debounce, schedule, scheduleOnce } from '@ember/runloop';

import layout from '../templates/components/my-plot-ly';

import { extend } from 'lodash';
import Plotly from 'plotly';


// TODO: Make configurable via ENV
// https://github.com/plotly/plotly.js/blob/5bc25b490702e5ed61265207833dbd58e8ab27f1/src/plot_api/plot_config.js#L22-L184
const defaultOptions = {
  staticPlot: false,
  editable: true,
  edits: {
    annotationPosition: false,
    annotationTail: false,
    annotationText: false,
    axisTitleText: false,
    colorbarPosition: false,
    colorbarTitleText: false,
    legendPosition: false,
    legendText: false,
    shapePosition: false,
    titleText: false
  },
  autosizable: false,
  queueLength: 0,
  fillFrame: false,
  frameMargins: 0,
  scrollZoom: false,
  doubleClick: 'reset+autosize',
  showTips: false,
  showAxisDragHandles: true,
  showAxisRangeEntryBoxes: true,
  showLink: false,
  sendData: true,
  linkText: 'Edit chart',
  showSources: false,
  displayModeBar: 'hover',
  modeBarButtonsToRemove: ['sendDataToCloud'],
  modeBarButtonsToAdd: [],
  modeBarButtons: false,
  displaylogo: true,
  plotGlPixelRatio: 2,
  setBackground: 'transparent',
  topojsonURL: 'https://cdn.plot.ly/',
  mapboxAccessToken: null,
  globalTransforms: [],
  locale: 'en-US',
};

//export default Component.extend({
export default class PlotlyComponent extends Component.extend({
  // TODO: Figure out how to re-write this in ES2015 class form
  init() {
    this._super(...arguments);
    this.set('layout', layout);

    this.setProperties({
      chartID: 'onlyChart',
      chartData: this.get('chartData') || A(),
      chartLayout: this.get('chartLayout') || EmberObject.create(),
      chartOptions: extend(defaultOptions, this.get('chartOptions')),
      isResponsive: !!this.get('isResponsive'),
      plotlyEvents: this.get('plotlyEvents') || [], // TODO: Get from config/env
    });

    this.set('_resizeEventHandler', () => {
      debounce(this, () => {
        scheduleOnce('afterRender', this, '_onResize');
      }, 200);  // TODO: Make throttling/debouncing/whatever more flexible/configurable
    });
  },

  _triggerUpdate: observer('chartData', function() {
    console.log("updating an old plot ", this.elementId)
    this._updateChart();
  })

}) {
  // Lifecycle hooks
  willUpdate() {
    this._unbindPlotlyEventListeners();
  }

  didRender() {
    console.log("making a new plot ", this.elementId)
    scheduleOnce('render', this, '_newPlot');
  }

  willDestroyElement() {
    this._unbindPlotlyEventListeners();
  }

  // Consumers should override this if they want to handle plotly_events
  onPlotlyEvent(eventName, ...args) {
  }

  // Private
  _onResize() {
    Plotly.Plots.resize(this.get('chartID'));
  }

  _bindPlotlyEventListeners() {
    if (this.get('isResponsive')) {
      window.addEventListener('resize', this._resizeEventHandler);
    }

    const plotlyEvents = this.get('plotlyEvents');
    plotlyEvents.forEach((eventName) => {
      // Note: Using plotly.js' 'on' method (copied from EventEmitter)
      this.element.on(eventName, (...args) => this.onPlotlyEvent(eventName, ...args));
    });
  }

  _unbindPlotlyEventListeners() {
    window.removeEventListener('resize', this._resizeEventHandler);
    const events = this.get('plotlyEvents');
    events.forEach((eventName) => {
      // Note: Using plotly.js' 'removeListener' method (copied from EventEmitter)
      if (typeof this.element.removeListener === 'function') {
        this.element.removeListener(eventName, this.onPlotlyEvent);
      }
    });
  }

  // TODO: Eventually we'd like to be smarter about when to call `newPlot` vs `restyle` / `relayout`
  _newPlot() {
    const id = this.elementId;
    const data = this.get('chartData');
    const layout = this.get('chartLayout');
    const options = this.get('chartOptions');
    this._unbindPlotlyEventListeners();
    Plotly.newPlot(id, data, layout, options).then(() => {
      this._bindPlotlyEventListeners();
    });
  }

  _updateChart() {
    const id = this.elementId;
    const thisdata = this.get('chartData');
    Plotly.animate(id,
      {data: thisdata, traces: [0]},
      { transition: {
        duration: 500,
        easing: 'cubic-in-out'
      }
    });
  }
}
