import React, { useEffect, useRef, useState }  from 'react';
import * as d3 from 'd3';
import Data from './Data';
import Graph from './Graph';
import './Graph.css';

/**
 * Histogram in an SVG element.
 *
 * The X domain is stored as a state.  The Y domain is calculated from the X domain.
 *
 * @param  {Object}  props  properties
 * @return component
 */
const Histogram = ( props ) => {
    
    // Initialization.
    const width = 650,
        height = 400,
        padding = { top: 20, right: 20, bottom: 0, left: 20 },
        margin = { top: 0, right: 10, bottom: 50, left: 50 },
        top    = margin.top    + padding.top,
        right  = margin.right  + padding.right,
        bottom = margin.bottom + padding.bottom,
        left   = margin.left   + padding.left;
    let ref = useRef(),
        { dataSet } = props,
        columnIndex = 2,
        xLabel = Data.getColumnNames( dataSet )[ columnIndex ],
        yLabel = "Frequency",
        data = Data.getValues( dataSet ),
        xDomain0 = [ d3.min( data, d => d[ columnIndex ]), d3.max( data, d => d[ columnIndex ])],
        yDomain0,
        xScale,
        yScale,
        histogram,
        bins;
        
    // Get the X scale.
    const [ xDomain, setXDomain ] = useState( xDomain0 );
    xScale = d3.scaleLinear().domain( xDomain ).range([ left, width - right ]);
    
    // Assign the X aggregate factor.
    const [ xAggregate, setXAggregate ] = useState( 0.5 );
    let onXAggregate = ( event, value ) => {
        setXDomain( xScale.domain());
        setXAggregate( value );
    };

    // Calculate the histogram bins.
    histogram = d3.histogram()
        .value( d => d[ columnIndex ])
        .domain( xDomain0 )
        .thresholds( Math.round( Math.exp( 5 * ( 1 - xAggregate ))));
    bins = histogram( data );

    // Get the Y scale.
    yDomain0 = [ 0, 1.05 * d3.max( bins, d => d.length )];      // a 5% margin
    yScale = d3.scaleLinear()
        .range([ height - bottom, top ])
        .domain( yDomain0 );
        
    // Zooms in two dimensions.
    let onZoom2D = ( isIn ) => {
        Graph.onZoom2D( isIn, xScale, yScale, xDomain0, yDomain0, false, true );
        Histogram.draw( ref, width, height, margin, padding, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bins );
    };
    
    // Zooms in one dimension.
    let onMouseDown = ( event ) => {
        Graph.onMouseDown( event, width, height, margin, padding, 0, xScale, yScale, xDomain0, yDomain0 );
    },
    onMouseUp = ( event ) => {
        if( Graph.downLocation.isX || Graph.downLocation.isY ) {
            Graph.onMouseUp( ref, event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
            Histogram.draw( ref, width, height, margin, padding, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bins );
        }
    };
    
    // Show or hide the controls.
    let onMouseOver = ( event ) => {
        Graph.drawControls( ref, width, height, margin, padding, 0, false, false, true, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    let onMouseOut = ( event ) => {
        let xUp = event.nativeEvent.offsetX,
            yUp = event.nativeEvent.offsetY,
            isBinning = (( 0 <= xUp ) && ( xUp < width ) && ( 0 <= yUp ) && ( yUp < height ));
        Graph.drawControls( ref, width, height, margin, padding, 0, false, false, isBinning, false, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    
    // Set hook to draw on mounting or any state change.
    useEffect(() => {
        Histogram.draw( ref, width, height, margin, padding, false, Graph.isXBinning( ref ), Graph.isYBinning( ref ), xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bins );
    });
    
    // Return the component.
    return <Graph width={width} height={height} margin={margin} padding={padding}
        onZoom={onZoom2D} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseOver={onMouseOver} onMouseOut={onMouseOut} xAggregate={0.5} onXAggregate={onXAggregate} ref={ref} />
};

/**
 * Draws the histogram.
 *
 * @param  {Object}   ref          reference to DIV
 * @param  {number}   width        width, in pixels
 * @param  {number}   height       height, in pixels
 * @param  {Box}      margin       margin
 * @param  {Box}      padding      padding
 * @param  {boolean}  isZooming    true if drawing zoom controls
 * @param  {boolean}  isXBinning   true iff drawing bin controls in X dimension
 * @param  {boolean}  isYBinning   true iff drawing bin controls in Y dimension
 * @param  {D3Scale}  xScale       X scale
 * @param  {D3Scale}  yScale       Y scale
 * @param  {Array}    xDomain0     Initial X domain
 * @param  {Array}    yDomain0     Initial Y domain
 * @param  {string}   xLabel       X axis label
 * @param  {string}   yLabel       Y axis label
 * @param  {Array}    bins         bins
 */
Histogram.draw = ( ref, width, height, margin, padding, isZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, bins ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]);
    svg.selectAll( "*" ).remove();

    // Draw the bars.
    svg.selectAll( "rect" )
        .data( bins )
        .enter()
        .append( "rect" )
        .attr( "x", 1 )
        .attr( "transform", bin => ( "translate( " + xScale( bin.x0 ) + "," + yScale( bin.length ) + " )" ))
        .attr( "width", bin => Math.max( 0, (( bin.x1 === bin.x0 ) ? 0 : ( xScale( bin.x1 ) - xScale( bin.x0 ) - 1 ))))
        .attr( "height", bin => Math.max( 0, ( height - margin.bottom - padding.bottom - yScale( bin.length ))))
        .style( "fill", "#99bbdd" );
    
    // Draw the axes and the controls.
    Graph.drawAxes(     ref, width, height, margin, padding, 0, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    Graph.drawControls( ref, width, height, margin, padding, 0, isZooming, isZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
};

export default Histogram;
