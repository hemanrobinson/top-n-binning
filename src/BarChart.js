import React, { useEffect, useRef, useState }  from 'react';
import * as d3 from 'd3';
import Data from './Data';
import Graph from './Graph';
import './Graph.css';

/**
 * Bar chart in an SVG element.
 *
 * The X domain is stored as a state.  The Y domain is calculated from the X domain.
 *
 * The X aggregate factor, which determines how the bars are aggregated, is also stored as a state.
 *
 * @param  {Object}  props  properties
 * @return component
 */
const BarChart = ( props ) => {
    
    // Initialization.
    const width = 650,
        height = 400,
        padding = { top: 20, right: 20, bottom: 0, left: 20 },
        margin = { top: 0, right: 0, bottom: 120, left: 50 };
    let ref = useRef(),
        { dataSet } = props,
        xLabel = Data.getColumnNames( dataSet )[ 0 ],
        yLabel = Data.getColumnNames( dataSet )[ 1 ],
        data = Data.getValues( dataSet ),
        xDomain0,
        yDomain0,
        xScale,
        yScale,
        bars;
        
    // Get the X scale.
    const [ xDomain, setXDomain ] = useState([]);
    xScale = d3.scaleBand().domain( xDomain ).range([ margin.left + padding.left, width - margin.right - padding.right ]).padding( 0.2 );
    
    // Assign the X aggregate factor.
    const [ xAggregate, setXAggregate ] = useState( 0 );
    let onXAggregate = ( event, value ) => {
        setXDomain( xScale.domain());
        setXAggregate( value );
    };

    // Calculate the bars.
    bars = Array.from( d3.rollup( data, v => v.length, d => d[ 0 ]));
    bars.sort(( a, b ) => ( b[ 1 ] - a[ 1 ]));
    
    // Combine bars if requested.
    let n = Math.round( xAggregate * bars.length );
    if( 0 < n ) {
        let total = 0;
        for( let i = 0; ( i < n ); i++ ) {
            total += bars[ bars.length - i - 1 ][ 1 ];
        }
        bars.splice( bars.length - n, n );
        bars.push([ "Other", total ]);
    }
    
    // Set the X domain.
    xDomain0 = bars.map( x => x[ 0 ]);
    xScale.domain( xDomain0 );

    // Get the Y scale.
    yDomain0 = [ 0, 1.05 * d3.max( bars, d => d[ 1 ])];     // a 5% margin
    yScale = d3.scaleLinear()
        .domain( yDomain0 )
        .range([ height - margin.bottom - padding.bottom, margin.top + padding.top ]);
        
    // Zoom in two dimensions.
    let onZoom2D = ( isIn ) => {
        Graph.onZoom2D( isIn, xScale, yScale, xDomain0, yDomain0, false, true );
        BarChart.draw( ref, width, height, margin, padding, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bars );
    };
    
    // Zoom in one dimension.
    let onMouseDown = ( event ) => {
        Graph.onMouseDown( event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
    },
    onMouseUp = ( event ) => {
        if( Graph.downLocation.isX || Graph.downLocation.isY ) {
            Graph.onMouseUp( ref, event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
            BarChart.draw( ref, width, height, margin, padding, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bars );
        }
    };
    
    // Show or hide the controls.
    let onMouseOver = ( event ) => {
        Graph.drawControls( ref, width, height, margin, padding, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    let onMouseOut = ( event ) => {
        let xUp = event.nativeEvent.offsetX,
            yUp = event.nativeEvent.offsetY,
            isBinning = (( 0 <= xUp ) && ( xUp < width ) && ( 0 <= yUp ) && ( yUp < height ));
        Graph.drawControls( ref, width, height, margin, padding, false, isBinning, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    
    // Set hook to draw on mounting or any state change.
    useEffect(() => {
        BarChart.draw( ref, width, height, margin, padding, false, Graph.isXBinning( ref ), Graph.isYBinning( ref ), xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bars );
    });
    
    // Return the component.
    return <Graph width={width} height={height} margin={margin} padding={padding}
        onZoom={onZoom2D} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseOver={onMouseOver} onMouseOut={onMouseOut}  onXAggregate={onXAggregate} ref={ref} />
};

/**
 * Length of "Other" bar, as a percentage of maximum bar length, >1.
 *
 * @const {number}
 */
BarChart.otherLength = 1.3;

/**
 * Draws the bar chart.
 *
 * @param  {Object}   ref          reference to DIV
 * @param  {number}   width        width, in pixels
 * @param  {number}   height       height, in pixels
 * @param  {Box}      margin       margin
 * @param  {Box}      padding      padding
 * @param  {boolean}  isZooming    true iff drawing zoom controls
 * @param  {boolean}  isXBinning   true iff drawing bin controls in X dimension
 * @param  {boolean}  isYBinning   true iff drawing bin controls in Y dimension
 * @param  {D3Scale}  xScale       X scale
 * @param  {D3Scale}  yScale       Y scale
 * @param  {Array}    xDomain0     Initial X domain
 * @param  {Array}    yDomain0     Initial Y domain
 * @param  {string}   xLabel       X axis label
 * @param  {string}   yLabel       Y axis label
 * @param  {Array}    bars         bars
 */
BarChart.draw = ( ref, width, height, margin, padding, isZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bars ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]);
    svg.selectAll( "*" ).remove();

    // If the "Other" bar is long, shorten it.
    let newBars = bars.concat();
    let yScale1 = yScale;
    const k = BarChart.otherLength;
    const n = bars.length;
    let maxLength = d3.max( bars.slice( 0, n - 1 ), d => d[ 1 ]);
    const isOtherLong = ( n > 1 ) && ( bars[ n - 1 ][ 0 ] === "Other" ) && ( bars[ n - 1 ][ 1 ] > k * maxLength );
    if( isOtherLong ) {
        newBars[ n - 1 ][ 1 ] = k * maxLength;
        let yDomain1 = [ 0, 1.05 * d3.max( newBars, d => d[ 1 ])];     // a 5% margin
        yScale1 = d3.scaleLinear()
            .domain( yDomain1 )
            .range([ height - margin.bottom - padding.bottom, margin.top + padding.top ]);
    }
    
    // Draw the bars.
    svg.selectAll( "rect" )
        .data( newBars )
        .enter()
        .append( "rect" )
        .attr( "x", ( d ) => xScale( d[ 0 ]))
        .attr( "y", ( d ) => yScale1( d[ 1 ]))
        .attr( "width", xScale.bandwidth())
        .attr( "height", ( d ) => (( xScale.domain().indexOf( d[ 0 ]) >= 0 ) ? Math.max( 0, height - yScale1( d[ 1 ])) : 0 ))
        .style( "fill", "#99bbdd" );
    
    // Draw the axes and the controls.
    Graph.drawAxes(     ref, width, height, margin, padding, xScale, yScale1, xDomain0, yDomain0, xLabel, yLabel );
    if( isOtherLong ) {
        
        // Clear the margin.
        const d = 10,
            y = yScale1( maxLength ) - 2 * d,
            colorLight = "#ebeeef";
        svg.append( "rect" )
            .attr( "x", 0 )
            .attr( "y", margin.top + padding.top )
            .attr( "width", margin.left )
            .attr( "height", y - margin.top - padding.top )
            .style( "fill", colorLight );
    
        // Draw the second Y axis.
        let yDomain2 = yDomain0.concat();
        yDomain2[ 0 ] = yDomain2[ 1 ] * ( height - y ) / ( height - margin.bottom - padding.bottom - margin.top - padding.top );
        let yScale2 = d3.scaleLinear()
            .domain( yDomain2 )
            .range([ y, margin.top + padding.top ]);
        svg.append( "g" )
            .attr( "class", "axis" )
            .attr( "transform", "translate( " + margin.left + ", 0 )" )
            .call( d3.axisLeft( yScale2 ).ticks( 3 ));
        
        // Draw the breaks.
        let breakWidth = 30,
            x = margin.left - breakWidth / 2;
        svg.append( "rect" )
            .attr( "x", x )
            .attr( "y", y )
            .attr( "width", breakWidth )
            .attr( "height", d )
            .style( "fill", "#939ba1" );
        svg.append( "rect" )
            .attr( "x", x )
            .attr( "y", y + 1 )
            .attr( "width", breakWidth )
            .attr( "height", d - 2 )
            .style( "fill", "#ffffff" );
        breakWidth = xScale.step();
        const barPadding = ( width - margin.left - margin.right - padding.left - padding.right - n * breakWidth );
        x = width - margin.right - padding.right - breakWidth - barPadding / 2;
        svg.append( "rect" )
            .attr( "x", x )
            .attr( "y", y )
            .attr( "width", breakWidth )
            .attr( "height", d )
            .style( "fill", "#939ba1" );
        svg.append( "rect" )
            .attr( "x", x )
            .attr( "y", y + 1 )
            .attr( "width", breakWidth )
            .attr( "height", d - 2 )
            .style( "fill", "#ffffff" );
    }
    Graph.drawControls( ref, width, height, margin, padding, isZooming, isXBinning, isYBinning, xScale, yScale1, xDomain0, yDomain0, xLabel, yLabel );
};

export default BarChart;
