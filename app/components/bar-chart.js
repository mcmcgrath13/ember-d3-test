import Component from '@ember/component'
import layout from '../templates/components/bar-chart'
import { run } from '@ember/runloop'
import { get } from '@ember/object'

// Import the D3 packages we want to use
import { select } from 'd3-selection'
import { scaleLinear, scaleBand } from 'd3-scale'
import { extent, ascending, min, max } from 'd3-array'
import { transition } from 'd3-transition'
import { easeCubicInOut } from 'd3-ease'
import { axisBottom, axisLeft } from 'd3-axis'

export default Component.extend({
  layout,

  tagName: 'svg',
  classNames: ['awesome-d3-widget'],

  width: 600,
  height: 200,
  margin: {top: 20, right: 20, bottom: 30, left: 40},

  attributeBindings: ['width', 'height'],

  // Array of points to render as circles in a line, spaced by time.
  //  [ {x: Number, y: Number } ];
  init() {
    this._super()
    this.data = []
  },

  didReceiveAttrs() {
    // Schedule a call to our `drawChart` method on Ember's "render" queue, which will
    // happen after the component has been placed in the DOM, and subsequently
    // each time data is changed.
    run.scheduleOnce('render', this, this.drawChart)
  },

  drawChart() {
    let plot = select(this.element)
    let data = get(this, 'data')
    let margin = get(this, 'margin')
    let width = get(this, 'width') - margin.left - margin.right
    let height = get(this, 'height') - margin.top - margin.bottom

    // Create a transition to use later
    let t = transition()
      .duration(250)
      .ease(easeCubicInOut)

    // X scale to scale position on x axis
    let xScale = scaleBand()
      .domain(data.map(d => d.x).sort(ascending))
      .range([0, width])
      .padding(0.1)

    // Y scale to scale radius of circles proportional to size of plot
    let yScale = scaleLinear()
      .domain([0, max(data.map(d => d.y))])
      .range([0, height])



    // UPDATE EXISTING
    let bars = plot.selectAll('.bar').data(data)

    // EXIT
    bars
      .exit()
      .transition(t)
      .attr('y', height)
      .attr('height', 0)
      .remove()

    // ENTER
    let enterJoin = bars
      .enter()
      .append('rect')
      .attr('class','bar')

      // Set initial size to 0 so we can animate it in from 0 to actual scaled radius
      .attr('x', d => xScale(d.x))
      .attr('y', () => height)
      .attr('width', () => xScale.bandwidth())
      .attr('height', () => 0)

    // MERGE + UPDATE EXISTING
    enterJoin
      .merge(bars)
      .transition(t)
      .attr('x', d => xScale(d.x))
      .attr('y', d => height - yScale(d.y))
      .attr('width', () => xScale.bandwidth())
      .attr('height', d => yScale(d.y))

      let xAxis = plot.append('g')
        .attr('class','axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(axisBottom(xScale))
  }
})
