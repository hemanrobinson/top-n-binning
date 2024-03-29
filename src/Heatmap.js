import React, { useEffect, useRef, useState }  from 'react';
import * as d3 from 'd3';
import Data from './Data';
import Graph from './Graph';
import './Graph.css';

/**
 * Heat map in an SVG element.
 *
 * The X and Y domains are both stored as states.
 *
 * The X and Y aggregate factors, which determine how the tiles are aggregated, are also stored as states.
 *
 * @param  {Object}  props  properties
 * @return component
 */
const Heatmap = ( props ) => {
    
    // Initialization.
    const width = 400,
        height = 650,
        padding = { top: 20, right: 20, bottom: 10, left: 10 },
        margin = { top: 0, right: 0, bottom: 50, left: 140 },
        top    = margin.top    + padding.top,
        right  = margin.right  + padding.right,
        bottom = margin.bottom + padding.bottom,
        left   = margin.left   + padding.left;
    let ref = useRef(),
        { dataSet } = props,
        xIndex = 0,
        yIndex = 2,
        zIndex = 3,
        xLabel = Data.getColumnNames( dataSet )[ xIndex ],
        yLabel = Data.getColumnNames( dataSet )[ yIndex ],
        data = Data.getValues( dataSet ),
        xDomain0,
        yDomain0,
        xScale,
        yScale,
        bins,
        tiles;
    
    // Get the X domain.
    // TODO:  Calculate margins based on minimum and maximum thresholds.
    const xMin = d3.min( data, d => d[ xIndex ]),
        xMax = d3.max( data, d => d[ xIndex ]),
        xMargin = 0.1 * ( xMax - xMin );
    xDomain0 = [( Math.abs( xMin ) < xMargin ) ? xMin : xMin - xMargin, xMax + xMargin ];
        
    // Get the X scale.
    const [ xDomain, setXDomain ] = useState( xDomain0 );
    xScale = d3.scaleLinear()
        .range([ left, width - right ])
        .domain( xDomain )
        .nice();
    
    // Get the unique Y values and sort them.
    let values = Array.from( d3.rollup( data, v => d3.sum( v, d => d[ zIndex ]), d => d[ yIndex ]));
    values.sort(( a, b ) => ( b[ 1 ] - a[ 1 ]));
    yDomain0 = values.map( x => x[ 0 ]);
    
    // Get the Y scale.
    const [ yDomain, setYDomain ] = useState( yDomain0 );
    yScale = d3.scaleBand().domain( yDomain ).range([ height - bottom, top ]);
    
    // Assign the X aggregate factor.
    const defaultAggregate = Graph.getDefaultAggregate( data, xIndex, xScale );
    const [ xAggregate, setXAggregate ] = useState( defaultAggregate );
    let onXAggregate = ( event, value ) => {
        setXDomain( xScale.domain());
        setXAggregate( value );
    };
    
    // Assign the Y aggregate factor.
    const [ yAggregate, setYAggregate ] = useState( 0 );
    let onYAggregate = ( event, value ) => {
        setYDomain( yScale.domain());
        setYAggregate( value );
    };
    
    // Calculate the X bins.
    const thresholds = Graph.getThresholds( data, xIndex, xScale, xAggregate );
    const histogram = d3.histogram()
        .value( d => d[ xIndex ])
        .domain( xScale.domain())
        .thresholds( thresholds );
    bins = histogram( data );
    
    // Calculate the tiles and sort them.
    tiles = [];
    for( let i = 0; ( i < yDomain0.length ); i++ ) {
        tiles[ i ] = [];
    }
    let j = 0;
    bins.forEach(( bin ) => {
        let t = [];
        for( let i = 0; ( i < yDomain0.length ); i++ ) {
            t[ i ] = 0;
        }
        bin.forEach(( b ) => {
            let k = yDomain0.indexOf( b[ yIndex ]);
            t[ k ] += b[ zIndex ];
        })
        for( let i = 0; ( i < yDomain0.length ); i++ ) {
            tiles[ i ][ j ] = t[ i ];
        }
        j++;
    });
    tiles.sort(( a, b ) => ( d3.sum( b ) - d3.sum( a )));
    
    // Flatten the tiles into one Array for drawing.
    let myTiles = [];
    for( let i = 0; ( i < tiles.length ); i++ ) {
        for( let j = 0; ( j < bins.length ); j++ ) {
            myTiles[ i + j * tiles.length ] = tiles[ i ][ j ];
        }
    }
    tiles = myTiles;
    
    // Combine tiles if requested.
    let n = Math.round( yAggregate * yDomain0.length );
    if( 1 < n ) {
        for( let j = bins.length; ( j > 0 ); j-- ) {
            let total = 0;
            for( let i = 1; ( i <= n ); i++ ) {
                total += tiles[ j * yDomain0.length - i ];
            }
            tiles.splice( j * yDomain0.length - n, n, total );
        }
        yDomain0.splice( yDomain0.length - n, n, "Other" );
    }
    
    // Assign the Y domain.
    yScale.domain( yDomain0 );
        
    // Zoom in two dimensions.
    let onZoom2D = ( isIn ) => {
        Graph.onZoom2D( isIn, xScale, yScale, xDomain0, yDomain0, false, true );
        Heatmap.draw( ref, width, height, margin, padding, false, true, true, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, thresholds, bins, tiles );
    };
    
    // Zoom in one dimension.
    let onPointerDown = ( event ) => {
        Graph.onPointerDown( event, width, height, margin, padding, false, 0, 0, xScale, yScale, xDomain0, yDomain0 );
    },
    onPointerUp = ( event ) => {
        if( Graph.downLocation.isX || Graph.downLocation.isY ) {
            let xUp = event.nativeEvent.offsetX,
                yUp = event.nativeEvent.offsetY,
                isBinning = (( 0 <= xUp ) && ( xUp < width ) && ( 0 <= yUp ) && ( yUp < height ));
            Graph.onPointerUp( event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
            Heatmap.draw( ref, width, height, margin, padding, false, isBinning, isBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, thresholds, bins, tiles );
        }
    };
    
    // Show or hide the controls.
    let onPointerOver = ( event ) => {
        Graph.drawControls( ref, width, height, margin, padding, 0, 0, false, false, true, true, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    let onPointerOut = ( event ) => {
        let xUp = event.nativeEvent.offsetX,
            yUp = event.nativeEvent.offsetY,
            isBinning = (( 0 <= xUp ) && ( xUp < width ) && ( 0 <= yUp ) && ( yUp < height ));
        Graph.drawControls( ref, width, height, margin, padding, 0, 0, false, false, isBinning, isBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    };
    
    // Set hook to draw on mounting or any state change.
    useEffect(() => {
        Heatmap.draw( ref, width, height, margin, padding, false, Graph.isXBinning.get( ref ), Graph.isYBinning.get( ref ), xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, thresholds, bins, tiles );
    });
    
    // Return the component.
    return <Graph width={width} height={height} margin={margin} padding={padding}
        onZoom={onZoom2D} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerOver={onPointerOver} onPointerOut={onPointerOut}
            xAggregate={xAggregate} yAggregate={0} onXAggregate={onXAggregate} onYAggregate={onYAggregate} ref={ref} />
};

/**
 * Draws the heat map.
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
 * @param  {number[]} thresholds   bin thresholds
 * @param  {number[]} bins         bins
 * @param  {number[]} tiles        tiles
 */
Heatmap.draw = ( ref, width, height, margin, padding, isZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, thresholds, bins, tiles ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]);
    svg.selectAll( "*" ).remove();

    // Draw the tiles.
    const nY = yDomain0.length;
    let colorScale = d3.scaleLinear().domain([ 0, d3.max( tiles, t => t )]).range([ "#99bbdd", "#ff0000" ]);
    svg.selectAll( "rect" )
        .data( tiles )
        .enter()
        .append( "rect" )
        .attr( "x", ( d, i ) => xScale( bins[( i / nY ) >> 0 ].x0 ))
        .attr( "y", ( d, i ) => yScale( yDomain0[ i % nY ]) + 1 )
        .attr( "width", ( d, i ) => Math.max( 0, xScale( bins[( i / nY ) >> 0 ].x1 ) - xScale( bins[( i / nY ) >> 0 ].x0 ) - 1 ))
        .attr( "height", ( d ) => ( d > 0 ) ? Math.max( 0, yScale.bandwidth() - 1 ) : 0 )
        .style( "fill", ( d ) => colorScale( d ));
        
    // Draw the axes and the controls.
    Graph.drawAxes(     ref, width, height, margin, padding, 0, 0, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, thresholds );
    Graph.drawControls( ref, width, height, margin, padding, 0, 0, isZooming, isZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
};

export default Heatmap;
