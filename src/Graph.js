import React from 'react';
import * as d3 from 'd3';
import { Button, Slider } from '@material-ui/core';
import './Graph.css';

/**
 * @typedef  Box  distances around an object
 *
 * @type  {object}
 * @property  {number}  top     top distance, in pixels
 * @property  {number}  right   right distance, in pixels
 * @property  {number}  bottom  bottom distance, in pixels
 * @property  {number}  left    left distance, in pixels
 */

/**
 * @typedef  D3Scale  d3 scale
 *
 * @type  {(d3.scaleLinear|d3.scaleBand)}  continuous linear or ordinal scale
 */
 
/**
 * @typedef  Domains  initial and current domains
 *
 * @type  {object}
 * @property  {number}  xMin0  initial X minimum
 * @property  {number}  xMax0  initial X maximum
 * @property  {number}  xMin   current X minimum
 * @property  {number}  xMax   current X maximum
 * @property  {number}  xD     X difference
 * @property  {number}  yMin0  initial Y minimum
 * @property  {number}  yMax0  initial Y maximum
 * @property  {number}  yMin   current Y minimum
 * @property  {number}  yMax   current Y maximum
 * @property  {number}  yD     Y difference
 */

/**
 * @typedef  EventLocation  event location
 *
 * @type  {object}
 * @property  {number}   x        X coordinate, in pixels
 * @property  {number}   y        Y coordinate, in pixels
 * @property  {Array}    xDomain  current X domain
 * @property  {Array}    yDomain  current Y domain
 * @property  {boolean}  isX      true iff on X scrollbar
 * @property  {boolean}  isY      true iff on Y scrollbar
 * @property  {boolean}  isMin    true iff on minimum
 * @property  {boolean}  isMax    true iff on maximum
 */

/**
 * Graph in an SVG element.
 *
 * This component contains code common to the different types of graphs.
 *
 * React functional components don't support inheritance; this is the recommended pattern:
 *    https://reactjs.org/docs/composition-vs-inheritance.html#specialization
 *
 * @param  {Object}  props  properties
 * @param  {Object}  ref    reference to DIV
 * @return component
 */
const Graph = React.forwardRef(( props, ref ) => {
    
    // Initialization.
    const buttonSize = 30, sliderOffset = 12;
    let { width, height, margin, padding, onMouseDown, onMouseUp, onMouseOver, onMouseOut, onZoom, xAggregate, yAggregate, onXAggregate, onYAggregate } = props,
        top    = margin.top    + padding.top,
        right  = margin.right  + padding.right,
        bottom = margin.bottom + padding.bottom,
        left   = margin.left   + padding.left;
    
    // Return the component.
    // Using "value" instead of "defaultValue" below suppresses a warning.
    return <div style={{width: width, height: height}} className="parent" ref={ref}>
        <svg width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseUp} onMouseUp={onMouseUp} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />
        <Button variant="contained" onClick={()=>onZoom(true )}
            style={{ position: "absolute", padding: 0, minWidth: buttonSize, width: buttonSize, height: buttonSize, top: ( height + 1 - buttonSize ), left: 1,
            display: "none" }}>+</Button>
        <Button variant="contained" onClick={()=>onZoom(false)}
            style={{ position: "absolute", padding: 0, minWidth: buttonSize, width: buttonSize, height: buttonSize, top: ( height + 1 - buttonSize ), left: 1 + buttonSize,
            display: "none" }}>-</Button>
        <Slider min={0} max={1} step={0.01}
            value={xAggregate} onChange={onXAggregate} className="sliderHorz"
            style={{ width: width - left - right + 1, top: height - margin.bottom - sliderOffset, left: left + 1, position: "absolute", display: "none" }} />
        <Slider min={0} max={1} step={0.01}
            defaultValue={yAggregate} onChange={onYAggregate} className="sliderVert"  orientation="vertical"
            style={{ height: height - top - bottom + 1, top: top + 1, left: margin.left - sliderOffset - 1, position: "absolute", display: "none" }} />
    </div>;
});

/**
 * Width of scroll bar, in pixels.
 *
 * @const {number}
 */
Graph.scrollSize = 15;
    
/**
 * Returns whether zooming controls are displayed.
 *
 * @param  {Object}   ref  reference to DIV
 * @return {boolean}  true iff zooming controls are displayed
 */
Graph.isZooming = ( ref ) => {
    return ( ref.current.childNodes[ 1 ].style.display === "inline" );
};
    
/**
 * Returns whether binning controls are displayed in the X dimension.
 *
 * @param  {Object}   ref  reference to DIV
 * @return {boolean}  true iff binning controls are displayed
 */
Graph.isXBinning = ( ref ) => {
    return ( ref.current.childNodes[ 3 ].style.display === "inline" );
};
    
/**
 * Returns whether binning controls are displayed in the Y dimension.
 *
 * @param  {Object}   ref  reference to DIV
 * @return {boolean}  true iff binning controls are displayed
 */
Graph.isYBinning = ( ref ) => {
    return ( ref.current.childNodes[ 4 ].style.display === "inline" );
};
 
/**
 * Down event location.
 *
 * @type {EventLocation}
 */
Graph.downLocation = { x: 0, y: 0, xDomain: [], yDomain: [], isX: false, isY: false, isMin: false, isMax: false };

/**
 * Returns initial and current domains.
 *
 * @param  {Array}    xDomain0    initial X domain
 * @param  {Array}    yDomain0    initial Y domain
 * @param  {Array}    xDomain     current X domain
 * @param  {Array}    yDomain     current Y domain
 * @param  {boolean}  isXOrdinal  true iff X scale is ordinal
 * @param  {boolean}  isYOrdinal  true iff Y scale is ordinal
 * @return {Domains}  initial and current domains
 */
Graph.getDomains = ( xDomain0, yDomain0, xDomain, yDomain, isXOrdinal, isYOrdinal ) => {
    let domains = {};
    if( isXOrdinal ) {
        domains.xMin0 = 0;
        domains.xMax0 = xDomain0.length - 1;
        domains.xMin = xDomain0.indexOf( xDomain[ 0 ]);
        domains.xMax = xDomain0.indexOf( xDomain[ xDomain.length - 1 ]);
        domains.xD = 1;
    } else {
        domains.xMin0 = xDomain0[ 0 ];
        domains.xMax0 = xDomain0[ 1 ];
        domains.xMin = xDomain[ 0 ];
        domains.xMax = xDomain[ 1 ];
        domains.xD = 0;
    }
    if( isYOrdinal ) {
        domains.yMin0 = 0;
        domains.yMax0 = yDomain0.length - 1;
        domains.yMin = yDomain0.indexOf( yDomain[ 0 ]);
        domains.yMax = yDomain0.indexOf( yDomain[ yDomain.length - 1 ]);
        domains.yD = 1;
    } else {
        domains.yMin0 = yDomain0[ 0 ];
        domains.yMax0 = yDomain0[ 1 ];
        domains.yMin = yDomain[ 0 ];
        domains.yMax = yDomain[ 1 ];
        domains.yD = 0;
    }
    return domains;
}
    
/**
 * Zooms in one or two dimensions.
 *
 * @param   {boolean}  isIn      true iff zooming in, otherwise zooming out
 * @param   {D3Scale}  xScale    X scale (returned)
 * @param   {D3Scale}  yScale    Y scale (returned)
 * @param   {Array}    xDomain0  Initial X domain
 * @param   {Array}    yDomain0  Initial Y domain
 * @param   {boolean}  isX       true iff zooming in X dimension
 * @param   {boolean}  isY       true iff zooming in Y dimension
 */
Graph.onZoom2D = ( isIn, xScale, yScale, xDomain0, yDomain0, isX, isY ) => {

    // Initialization.
    const d = 8,
        f = ( d - 1 ) / ( 2 * d );
    let xDomain = xScale.domain(),
        yDomain = yScale.domain(),
        { xMin0, xMax0, yMin0, yMax0, xMin, xMax, yMin, yMax, xD, yD } = Graph.getDomains( xDomain0, yDomain0, xDomain, yDomain, !!xScale.bandwidth, !!yScale.bandwidth );
        
    // Calculate scales for zoom in...
    if( isIn ) {
        const xDif = xMax - xMin, yDif = yMax - yMin;
        xMin = Math.min( xMin0 + ( xMax0 - xMin0 + xD ) * f, xMin + ( xDif + xD ) / d );
        xMax = Math.max( xMax0 - ( xMax0 - xMin0 + xD ) * f, xMax - ( xDif + xD ) / d );
        yMin = Math.min( yMin0 + ( yMax0 - yMin0 + yD ) * f, yMin + ( yDif + yD ) / d );
        yMax = Math.max( yMax0 - ( yMax0 - yMin0 + yD ) * f, yMax - ( yDif + yD ) / d );
        if( xScale.bandwidth ) {
            xMin = Math.ceil( xMin );
            xMax = Math.floor( xMax );
            if( xMin > xMax ) {
                xMin = xDomain0.indexOf( xDomain[ 0 ]);
                xMax = xMin;
            }
        }
        if( yScale.bandwidth ) {
            yMin = Math.ceil( yMin );
            yMax = Math.floor( yMax );
            if( yMin > yMax ) {
                yMin = yDomain0.indexOf( yDomain[ 0 ]);
                yMax = yMin;
            }
        }
    }
    
    // ...or for zoom out.
    else {
        xMin = Math.max( xMin0, xMin - ( xMax - xMin + xD ) / ( d - 2 ));
        xMax = Math.min( xMax0, xMax + ( xMax - xMin + xD ) / ( d - 2 ));
        yMin = Math.max( yMin0, yMin - ( yMax - yMin + yD ) / ( d - 2 ));
        yMax = Math.min( yMax0, yMax + ( yMax - yMin + yD ) / ( d - 2 ));
        if( xScale.bandwidth ) {
            xMin = Math.floor( xMin );
            xMax = Math.ceil( xMax );
            if( xMax < xMin ) {
                xMax = xDomain0.indexOf( xDomain[ xDomain.length - 1 ]);
                xMin = xMax;
            }
        }
        if( yScale.bandwidth ) {
            yMin = Math.floor( yMin );
            yMax = Math.ceil( yMax );
            if( yMax < yMin ) {
                yMax = yDomain0.indexOf( yDomain[ yDomain.length - 1 ]);
                yMin = yMax;
            }
        }
    }
    
    // Assign the new scales.
    if( isX ) {
        if( xScale.bandwidth ) {
            xScale.domain( xDomain0.slice( xMin, xMax + 1 ));
        } else {
            xScale.domain([ xMin, xMax ]);
        }
    }
    if( isY ) {
        if( yScale.bandwidth ) {
            yScale.domain( yDomain0.slice( yMin, yMax + 1 ));
        } else {
            yScale.domain([ yMin, yMax ]);
        }
    }
};
    
/**
 * Initiates zoom in one dimension.
 *
 * This method modifies Graph.downLocation.
 *
 * @param  {Event}    event     event
 * @param  {number}   width     width, in pixels
 * @param  {number}   height    height, in pixels
 * @param  {Box}      margin    margin
 * @param  {Box}      padding   padding
 * @param  {number}   xScrollSize scroll size in the X dimension, or 0 for default
 * @param  {D3Scale}  xScale    X scale
 * @param  {D3Scale}  yScale    Y scale
 * @param  {Array}    xDomain0  Initial X domain
 * @param  {Array}    yDomain0  Initial Y domain
 */
Graph.onMouseDown = ( event, width, height, margin, padding, xScrollSize, xScale, yScale, xDomain0, yDomain0 ) => {

    // Initialization.
    const scrollSize = Graph.scrollSize,
        endCapSize = 0.8 * scrollSize;
    let top    = margin.top    + padding.top,
        right  = margin.right  + padding.right,
        bottom = margin.bottom + padding.bottom,
        left   = margin.left   + padding.left,
        xDown = event.nativeEvent.offsetX,
        yDown = event.nativeEvent.offsetY,
        xDomain = xScale.domain(),
        yDomain = yScale.domain(),
        { xMin0, xMax0, yMin0, yMax0, xMin, xMax, yMin, yMax, xD, yD } = Graph.getDomains( xDomain0, yDomain0, xDomain, yDomain, !!xScale.bandwidth, !!yScale.bandwidth );
        
    // Prevent text selection.
    event.preventDefault();
        
    // Reset the mousedown coordinates.
    Graph.downLocation.x = xDown;
    Graph.downLocation.y = yDown;
    Graph.downLocation.xDomain = [];
    Graph.downLocation.yDomain = [];
    Graph.downLocation.isX = false;
    Graph.downLocation.isY = false;
    Graph.downLocation.isMin = false;
    Graph.downLocation.isMax = false;
    
    // Handle event on X scrollbar...
    if(( left <= xDown ) && ( xDown <= width - right ) && ( height - ( xScrollSize ? xScrollSize : scrollSize ) <= yDown ) && ( yDown <= height )) {
        let w = width - right - left + 1,
            x0 = left + w * ( xMin - xMin0      ) / ( xMax0 - xMin0 + xD ),
            x1 = left + w * ( xMax - xMin0 + xD ) / ( xMax0 - xMin0 + xD );
        Graph.downLocation.xDomain = xScale.domain();
        Graph.downLocation.isX = true;
        if(( x0 <= xDown ) && ( xDown <= x0 + endCapSize )) {
            Graph.downLocation.isMin = true;
        } else if(( x1 - endCapSize <= xDown ) && ( xDown <= x1 )) {
            Graph.downLocation.isMax = true;
        }
    }
    
    // ...or handle event on Y scrollbar.
    else if(( 0 <= xDown ) && ( xDown <= scrollSize ) && ( top <= yDown ) && ( yDown <= height - bottom )) {
        let h = height - bottom - top + 1,
            y0 = top + h * ( 1 - ( yMin - yMin0      ) / ( yMax0 - yMin0 + yD )),
            y1 = top + h * ( 1 - ( yMax - yMin0 + yD ) / ( yMax0 - yMin0 + yD ));
        Graph.downLocation.yDomain = yScale.domain();
        Graph.downLocation.isY = true;
        if(( y1 <= yDown ) && ( yDown <= y1 + endCapSize )) {
            Graph.downLocation.isMax = true;
        } else if(( y0 - endCapSize <= yDown ) && ( yDown <= y0 )) {
            Graph.downLocation.isMin = true;
        }
    }
};

/**
 * Completes zoom in one dimension.
 *
 * This method modifies Graph.downLocation.
 *
 * @param  {Event}    event     event
 * @param  {number}   width     width, in pixels
 * @param  {number}   height    height, in pixels
 * @param  {Box}      margin    margin
 * @param  {Box}      padding   padding
 * @param  {D3Scale}  xScale    X scale (returned)
 * @param  {D3Scale}  yScale    Y scale (returned)
 * @param  {Array}    xDomain0  Initial X domain
 * @param  {Array}    yDomain0  Initial Y domain
 */
Graph.onMouseUp = ( event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 ) => {

    // Initialization.
    const d = 8;
    let top    = margin.top    + padding.top,
        right  = margin.right  + padding.right,
        bottom = margin.bottom + padding.bottom,
        left   = margin.left   + padding.left,
        xUp = event.nativeEvent.offsetX,
        yUp = event.nativeEvent.offsetY,
        xDomain = Graph.downLocation.xDomain,
        yDomain = Graph.downLocation.yDomain,
        { xMin0, xMax0, yMin0, yMax0, xMin, xMax, yMin, yMax, xD, yD } = Graph.getDomains( xDomain0, yDomain0, xDomain, yDomain, !!xScale.bandwidth, !!yScale.bandwidth );
    
    // Handle event on X scrollbar...
    if( Graph.downLocation.isX ) {
    
        // Calculate the difference.
        const f = ( xMax0 - xMin0 + xD ) / d;
        let w = width - right - left + 1,
            dif = ( xMax0 - xMin0 + xD ) * ( xUp - Graph.downLocation.x ) / w;
        if( xScale.bandwidth ) {
            dif = Math.round( dif );
        }
        
        // Handle drag on minimum handle...
        if( Graph.downLocation.isMin ) {
            dif = Math.max( dif, xMin0 - xMin );
            if( dif <= xMax - xMin + xD - f ) {
                if( xScale.bandwidth ) {
                    xScale.domain( xDomain0.slice( xMin + dif, xMax + xD ));
                } else {
                    xScale.domain([ xMin + dif, xMax ]);
                }
            }
        }
        
        // ...or handle drag on maximum handle...
        else if( Graph.downLocation.isMax ) {
            dif = Math.min( dif, xMax0 - xMax );
            if( dif >= f - ( xMax - xMin + xD )) {
                if( xScale.bandwidth ) {
                    xScale.domain( xDomain0.slice( xMin, xMax + dif + xD ));
                } else {
                    xScale.domain([ xMin, xMax + dif ]);
                }
            }
        }
        
        // ...or handle drag on thumb or click on track.
        else {
        
            // Adjust for click on track.
            if( dif === 0 ) {
                let x0 = left + w * ( xMin - xMin0      ) / ( xMax0 - xMin0 + xD ),
                    x1 = left + w * ( xMax - xMin0 + xD ) / ( xMax0 - xMin0 + xD );
                if( xUp < x0 ) {
                    dif = ( xMax0 - xMin0 + xD ) * ( xUp - x0 ) / w - ( xMax - xMin + xD ) / 2;
                } else if( x1 < xUp ) {
                    dif = ( xMax0 - xMin0 + xD ) * ( xUp - x1 ) / w + ( xMax - xMin + xD ) / 2;
                }
            }
            
            // Handle drag or click.
            dif = Math.max( dif, xMin0 - xMin );
            dif = Math.min( dif, xMax0 - xMax );
            if( xScale.bandwidth ) {
                xScale.domain( xDomain0.slice( xMin + dif, xMax + dif + xD ));
            } else {
                xScale.domain([ xMin + dif, xMax + dif ]);
            }
        }
    }
    
    // ...or handle event on Y scrollbar.
    else if( Graph.downLocation.isY ) {
    
        // Calculate the difference.
        const f = ( yMax0 - yMin0 + yD ) / d;
        let h = height - bottom - top + 1,
            dif = ( yMax0 - yMin0 + yD ) * ( Graph.downLocation.y - yUp ) / h;
        if( yScale.bandwidth ) {
            dif = Math.round( dif );
        }
            
        // Handle drag on minimum handle...
        if( Graph.downLocation.isMin ) {
            dif = Math.max( dif, yMin0 - yMin );
            if( dif <= yMax - yMin + yD - f ) {
                if( yScale.bandwidth ) {
                    yScale.domain( yDomain0.slice( yMin + dif, yMax + yD ));
                } else {
                    yScale.domain([ yMin + dif, yMax ]);
                }
            }
        }
        
        // ...or handle drag on maximum handle...
        else if( Graph.downLocation.isMax ) {
            dif = Math.min( dif, yMax0 - yMax );
            if( dif >= f - ( yMax - yMin + yD )) {
                if( yScale.bandwidth ) {
                    yScale.domain( yDomain0.slice( yMin, yMax + dif + yD ));
                } else {
                    yScale.domain([ yMin, yMax + dif ]);
                }
            }
        }
        
        // ...or handle drag on thumb or click on track.
        else {
        
            // Adjust for click on track.
            if( dif === 0 ) {
                let y0 = top + h * ( 1 - ( yMin - yMin0      ) / ( yMax0 - yMin0 + yD )),
                    y1 = top + h * ( 1 - ( yMax - yMin0 + yD ) / ( yMax0 - yMin0 + yD ));
                if( yUp < y0 ) {
                    dif = ( yMax0 - yMin0 + yD ) * ( y0 - yUp ) / h - ( yMax - yMin + yD ) / 2;
                } else if( y1 < yUp ) {
                    dif = ( yMax0 - yMin0 + yD ) * ( y1 - yUp ) / h + ( yMax - yMin + yD ) / 2;
                }
            }
            
            // Handle drag or click.
            dif = Math.max( dif, yMin0 - yMin );
            dif = Math.min( dif, yMax0 - yMax );
            if( yScale.bandwidth ) {
                yScale.domain( yDomain0.slice( yMin + dif, yMax + dif + yD ));
            } else {
                yScale.domain([ yMin + dif, yMax + dif ]);
            }
        }
    }
        
    // Reset the mousedown coordinates.
    if(( Graph.downLocation.isX || Graph.downLocation.isY ) && ( event.type === "mouseup" )) {
        Graph.downLocation.isX = false;
        Graph.downLocation.isY = false;
        Graph.downLocation.isMin = false;
        Graph.downLocation.isMax = false;
    }
};

/**
 * Returns binned values for a continuous set of values and specified aggregate value.
 *
 * @param  {Array[]}     data           data set
 * @param  {number}      columnIndex    index of column to be binned
 * @param  {D3Scale}     xScale         X scale
 * @param  {number}      aggregate      aggregate value, between 0 and 1
 * @return {number[][]}  binned values
 */
Graph.getDefaultAggregate = ( data, columnIndex, xScale ) => {
    
    // Get the scale information.
    const ticks = xScale.ticks();
    const domain = xScale.domain();
    const range = xScale.range();
    
    // Ensure that the minimum bin width is visible.
    let minWidth = ( ticks[ 1 ] - ticks[ 0 ]) / 16;
    minWidth = Math.max( minWidth, 2 * ( domain[ 1 ] - domain[ 0 ]) / ( range[ 1 ] - range[ 0 ]));

    // Get the values.
    let values = [];
    data.forEach( d => values.push( d[ columnIndex ]));
    
    // Get the initial bin width from Scott's rule.
    let bins = d3.bin().thresholds( d3.thresholdScott )( values );
    let binWidth = ( domain[ 1 ] - domain[ 0 ]) / bins.length;
    
    // Calculate the default aggregate value from the binWidth.
    const k = Math.round(( domain[ 1 ] - domain[ 0 ]) / minWidth );
    let aggregate = 1 - (( domain[ 1 ] - domain[ 0 ]) / binWidth - 1 ) / ( k - 1 );
    
    // Transform the aggregate value.
    let myAggregate = aggregate;                                    // between 0 and 1
    myAggregate = aggregate * aggregate * aggregate * aggregate;    // between 0 and 1
//    myAggregate = Math.exp( myAggregate );                          // between 1 and Math.E
//    myAggregate -= 1;                                               // between 0 and ( Math.E - 1 )
//    myAggregate /= ( Math.E - 1 );                                  // between 0 and 1

    // Return the aggregate value.
    return myAggregate;
};

/**
 * Returns binned values for a continuous set of values and specified aggregate value.
 *
 * @param  {Array[]}     data           data set
 * @param  {number}      columnIndex    index of column to be binned
 * @param  {D3Scale}     xScale         X scale
 * @param  {number}      aggregate      aggregate value, between 0 and 1
 * @return {number[][]}  binned values
 */
Graph.getBins = ( data, columnIndex, xScale, aggregate ) => {
    
    // Get the scale information.
    const ticks = xScale.ticks();
    const domain = xScale.domain();
    const range = xScale.range();
    
    // Ensure that the minimum bin width is visible.
    let minWidth = ( ticks[ 1 ] - ticks[ 0 ]) / 16;
    minWidth = Math.max( minWidth, 2 * ( domain[ 1 ] - domain[ 0 ]) / ( range[ 1 ] - range[ 0 ]));
    
    // Transform the aggregate value.
    let myAggregate = aggregate;                                    // between 0 and 1
    myAggregate = Math.sqrt( Math.sqrt( aggregate ));               // between 0 and 1
//    myAggregate *= ( Math.E - 1 );                                  // between 0 and ( Math.E - 1 )
//    myAggregate += 1;                                               // between 1 and Math.E
//    myAggregate = Math.log( myAggregate );                          // between 0 and 1
    
    // Calculate the bin width from the aggregate value.
    const k = Math.round(( domain[ 1 ] - domain[ 0 ]) / minWidth );
    const d = Math.round( 1 + ( k - 1 ) * ( 1 - myAggregate ));
    let binWidth = ( domain[ 1 ] - domain[ 0 ]) / d;

    // Calculate the thresholds.
    let thresholds = [];
    const nBins = ( domain[ 1 ] - domain[ 0 ]) / binWidth;
    for( let i = 0; ( i < nBins ); i++ ) {
        thresholds.push( ticks[ 0 ] + i * binWidth );
    }

    // Return the bins.
    const histogram = d3.histogram()
        .value( d => d[ columnIndex ])
        .domain( domain )
        .thresholds( thresholds );
    return histogram( data );
};
    
/**
 * Draws the axes.
 *
 * @param  {Object}   ref         reference to DIV
 * @param  {number}   width       width, in pixels
 * @param  {number}   height      height, in pixels
 * @param  {Box}      margin      margin
 * @param  {Box}      padding     padding
 * @param  {number}   xScrollSize scroll size in the X dimension, or 0 for default
 * @param  {D3Scale}  xScale      X scale
 * @param  {D3Scale}  yScale      Y scale
 * @param  {Array}    xDomain0    Initial X domain
 * @param  {Array}    yDomain0    Initial Y domain
 * @param  {string}   xLabel      X axis label
 * @param  {string}   yLabel      Y axis label
 */
Graph.drawAxes = ( ref, width, height, margin, padding, xScrollSize, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]),
        scrollSize = Graph.scrollSize,
        colorLight = "#ebeeef";
        
    // Clear the margins.
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", 0 )
        .attr( "width", width )
        .attr( "height", padding.top )
        .style( "fill", colorLight );
    svg.append( "rect" )
        .attr( "x", width - padding.right )
        .attr( "y", 0 )
        .attr( "width", padding.right )
        .attr( "height", height + xScrollSize )
        .style( "fill", colorLight );
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", height - margin.bottom )
        .attr( "width", width )
        .attr( "height", margin.bottom )
        .style( "fill", colorLight );
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", 0 )
        .attr( "width", margin.left )
        .attr( "height", height + xScrollSize )
        .style( "fill", colorLight );
    
    // Draw the X axis.
    svg.append( "g" )
        .attr( "class", ( margin.bottom > 50 ) ? "axisRotated" : "axis" )
        .attr( "transform", "translate( 0, " + ( height - margin.bottom ) + " )" )
        .call( d3.axisBottom( xScale ).ticks( 3 ).tickFormat( t => ( "" + t )));
    svg.append( "text" )
        .attr( "transform", "translate( " + ( width / 2 ) + " ," + ( height - 1.5 * scrollSize ) + ")" )
        .style( "text-anchor", "middle" )
        .text( xLabel );
        
    // Draw the Y axis.
    svg.append( "g" )
        .attr( "class", "axis" )
        .attr( "transform", "translate( " + margin.left + ", 0 )" )
        .call( d3.axisLeft( yScale ).ticks( 3 ).tickFormat( t => ( "" + t )));
    svg.append( "text" )
        .attr( "x", margin.left )
        .attr( "y", margin.top + padding.top * 0.7 )
        .style( "text-anchor", "middle" )
        .text( yLabel );
};
    
/**
 * Draws the controls.
 *
 * @param  {Object}   ref         reference to DIV
 * @param  {number}   width       width, in pixels
 * @param  {number}   height      height, in pixels
 * @param  {Box}      margin      margin
 * @param  {Box}      padding     padding
 * @param  {number}   xScrollSize scroll size in the X dimension, or 0 for default
 * @param  {boolean}  isXZooming  true iff this graph can be zoomed in the X dimension
 * @param  {boolean}  isYZooming  true iff this graph can be zoomed in the Y dimension
 * @param  {boolean}  isXBinning  true iff this graph can be binned in the X dimension
 * @param  {boolean}  isYBinning  true iff this graph can be binned in the Y dimension
 * @param  {D3Scale}  xScale      X scale
 * @param  {D3Scale}  yScale      Y scale
 * @param  {Array}    xDomain0    Initial X domain
 * @param  {Array}    yDomain0    Initial Y domain
 * @param  {string}   xLabel      X axis label
 * @param  {string}   yLabel      Y axis label
 */
Graph.drawControls = ( ref, width, height, margin, padding, xScrollSize, isXZooming, isYZooming, isXBinning, isYBinning, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]),
        scrollSize = Graph.scrollSize,
        halfSize = scrollSize / 2,
        colorLight = "#ebeeef",
        colorLine = "#cbd2d7";
    let xDomain = xScale.domain(),
        yDomain = yScale.domain(),
        { xMin0, xMax0, yMin0, yMax0, xMin, xMax, yMin, yMax, xD, yD } = Graph.getDomains( xDomain0, yDomain0, xDomain, yDomain, !!xScale.bandwidth, !!yScale.bandwidth ),
        x = margin.left + padding.left,
        w = width - margin.right - padding.right - x + 1,
        y = margin.top + padding.top,
        h = height - margin.bottom - padding.bottom - y + 1;
        
    // Draw the X scroll bar.
    let x1 = x + w * ( xMin - xMin0      ) / ( xMax0 - xMin0 + xD ),
        x2 = x + w * ( xMax - xMin0 + xD ) / ( xMax0 - xMin0 + xD );
    if( xScrollSize ) {
        svg.append( "rect" )
            .attr( "x", x1 )
            .attr( "y", height - xScrollSize )
            .attr( "width", x2 - x1 )
            .attr( "height", xScrollSize )
            .attr( "opacity","0.5" )
            .style( "fill", colorLine );
     }
    
    // Draw the X zoombar...
    const d = halfSize / 2,
        k = scrollSize / 4;
    if( isXZooming ) {
        
        // Draw a traditional scrollbar...
        if( !xScrollSize ) {
            svg.append( "rect" )
                .attr( "x", x )
                .attr( "y", height - scrollSize )
                .attr( "width", w )
                .attr( "height", scrollSize )
                .style( "fill", "#ffffff" );
            svg.append( "line" )
                .attr( "x1", x1 + halfSize )
                .attr( "y1", height - halfSize )
                .attr( "x2", x2 - halfSize )
                .attr( "y2", height - halfSize )
                .style( "stroke-width", scrollSize )
                .style( "stroke", colorLine )
                .style( "stroke-linecap", "round" );
            svg.append( "line" )
                .attr( "x1", x1 + halfSize + 1 )
                .attr( "y1", height - halfSize )
                .attr( "x2", x2 - halfSize - 1 )
                .attr( "y2", height - halfSize )
                .style( "stroke-width", scrollSize )
                .style( "stroke", "#ffffff" )
                .style( "stroke-linecap", "butt" );
            svg.append( "line" )
                .attr( "x1", x1 + halfSize + 2 )
                .attr( "y1", height - halfSize )
                .attr( "x2", x2 - halfSize - 2 )
                .attr( "y2", height - halfSize )
                .style( "stroke-width", scrollSize )
                .style( "stroke", colorLine )
                .style( "stroke-linecap", "butt" );
        }
        
        // ...or an overview scrollbar.
        else {
            svg.append( "line" )
                .attr( "x1", x1 + halfSize + 1 )
                .attr( "y1", height - xScrollSize )
                .attr( "x2", x1 + halfSize + 1 )
                .attr( "y2", height )
                .attr( "opacity","0.5" )
                .style( "stroke-width", 1 )
                .style( "stroke", "#ffffff" )
                .style( "stroke-linecap", "butt" );
            svg.append( "line" )
                .attr( "x1", x2 - halfSize - 1 )
                .attr( "y1", height - xScrollSize )
                .attr( "x2", x2 - halfSize - 1 )
                .attr( "y2", height )
                .attr( "opacity","0.5" )
                .style( "stroke-width", 1 )
                .style( "stroke", "#ffffff" )
                .style( "stroke-linecap", "butt" );
        }
            
        // Draw the X drag handles.
        let y1 = xScrollSize ? height - xScrollSize / 2 + k : height - scrollSize + k;
        let y2 = xScrollSize ? height - xScrollSize / 2 - k : height - k;
        svg.append( "line" )
            .attr( "x1", x1 + d )
            .attr( "y1", y1 )
            .attr( "x2", x1 + d )
            .attr( "y2", y2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", x1 + d + 2 )
            .attr( "y1", y1 )
            .attr( "x2", x1 + d + 2 )
            .attr( "y2", y2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", x2 - d )
            .attr( "y1", y1 )
            .attr( "x2", x2 - d )
            .attr( "y2", y2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", x2 - d - 2 )
            .attr( "y1", y1 )
            .attr( "x2", x2 - d - 2 )
            .attr( "y2", y2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
    }
    
    // ...or hide the X zoombar.
    else if( !xScrollSize ) {
        svg.append( "rect" )
            .attr( "x", x )
            .attr( "y", height - scrollSize )
            .attr( "width", w )
            .attr( "height", scrollSize )
            .style( "fill", colorLight );
    }
    
    // Draw the Y zoombar...
    if( isYZooming ) {
        
        // Draw the Y scrollbar.
        let y1 = y + h * ( 1 - ( yMin - yMin0      ) / ( yMax0 - yMin0 + yD )),
            y2 = y + h * ( 1 - ( yMax - yMin0 + yD ) / ( yMax0 - yMin0 + yD ));
        svg.append( "rect" )
            .attr( "x", 0 )
            .attr( "y", y )
            .attr( "width", scrollSize )
            .attr( "height", h )
            .style( "fill", "#ffffff" );
        svg.append( "line" )
            .attr( "x1", halfSize )
            .attr( "y1", y2 + halfSize )
            .attr( "x2", halfSize )
            .attr( "y2", y1 - halfSize )
            .style( "stroke-width", scrollSize )
            .style( "stroke", colorLine )
            .style( "stroke-linecap", "round" );
        svg.append( "line" )
            .attr( "x1", halfSize )
            .attr( "y1", y2 + halfSize + 1 )
            .attr( "x2", halfSize )
            .attr( "y2", y1 - halfSize - 1 )
            .style( "stroke-width", scrollSize )
            .style( "stroke", "#ffffff" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", halfSize )
            .attr( "y1", y2 + halfSize + 2 )
            .attr( "x2", halfSize )
            .attr( "y2", y1 - halfSize - 2 )
            .style( "stroke-width", scrollSize )
            .style( "stroke", colorLine )
            .style( "stroke-linecap", "butt" );
            
        // Draw the Y drag handles.
        svg.append( "line" )
            .attr( "x1", k )
            .attr( "y1", y1 - d )
            .attr( "x2", scrollSize - k )
            .attr( "y2", y1 - d )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", k )
            .attr( "y1", y1 - d - 2 )
            .attr( "x2", scrollSize - k )
            .attr( "y2", y1 - d - 2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", k )
            .attr( "y1", y2 + d )
            .attr( "x2", scrollSize - k )
            .attr( "y2", y2 + d )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
        svg.append( "line" )
            .attr( "x1", k )
            .attr( "y1", y2 + d + 2 )
            .attr( "x2", scrollSize - k )
            .attr( "y2", y2 + d + 2 )
            .style( "stroke-width", 1 )
            .style( "stroke", "#000000" )
            .style( "stroke-linecap", "butt" );
    }
    
    // ...or hide the Y zoombar.
    else {
        svg.append( "rect" )
            .attr( "x", 0 )
            .attr( "y", y )
            .attr( "width", scrollSize )
            .attr( "height", h )
            .style( "fill", colorLight );
    }

    // Show or hide the buttons and sliders.
    if(( isXZooming || isYZooming ) !== Graph.isZooming( ref )) {
        for( let i = 1; ( i < 3 ); i++ ) {
            ref.current.childNodes[ i ].style.display = (( isXZooming || isYZooming ) ? "inline" : "none" );
        }
    }
    if( isXBinning !== Graph.isXBinning( ref )) {
        ref.current.childNodes[ 3 ].style.display = ( isXBinning ? "inline" : "none" );
    }
    if( isYBinning !== Graph.isYBinning( ref )) {
        ref.current.childNodes[ 4 ].style.display = ( isYBinning ? "inline" : "none" );
    }
};

export default Graph;
