import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import Graph from './Graph';

let container = null;

// Sets up a DOM element as a render target.
beforeEach(() => {
    container = document.createElement( "div" );
    document.body.appendChild( container );
});

// Cleans up on exit.
afterEach(() => {
    unmountComponentAtNode( container );
    container.remove();
    container = null;
});

it( "creates a Graph element", () => {
    
    // Test first render and componentDidMount.
    act(() => {
        ReactDOM.render(<Graph width={ 400 } height={ 400 } margin={{ top: 0, right: 0, bottom: 0, left:0 }} padding={{ top: 0, right: 0, bottom: 0, left:0 }} />, container );
    });
    
    // Test structure.
    const div = container.querySelector( "div" );
    expect( div.childNodes.length ).toBe( 5 );
    expect( div.childNodes[ 0 ].nodeName ).toBe( "svg" );
    expect( div.childNodes[ 1 ].nodeName ).toBe( "BUTTON" );
    expect( div.childNodes[ 2 ].nodeName ).toBe( "BUTTON" );
    expect( div.childNodes[ 3 ].nodeName ).toBe( "SPAN" );
    expect( div.childNodes[ 4 ].nodeName ).toBe( "SPAN" );
});

it( "returns width of scroll bar", () => {
    expect( Graph.scrollSize ).toBe( 15 );
});
    
it( "returns whether controls are displayed", () => {
    let ref = { current: { childNodes: [
            document.createElement( "svg" ),
            document.createElement( "BUTTON" ),
            document.createElement( "BUTTON" ),
            document.createElement( "SPAN" ),
            document.createElement( "SPAN" )
        ]}};
    expect( Graph.isZooming( ref )).toBe( false );
    expect( Graph.isXBinning( ref )).toBe( false );
    expect( Graph.isYBinning( ref )).toBe( false );
});

it( "returns mousedown location", () => {
    expect( Graph.downLocation ).toEqual({ x: 0, y: 0, xDomain: [], yDomain: [], isX: false, isY: false, isMin: false, isMax: false });
});

it( "returns initial and current domains", () => {
    expect( Graph.getDomains([ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], false, false )).toEqual({
        "xD": 0, "xMax": 1, "xMax0": 1, "xMin": 0, "xMin0": 0, "yD": 0, "yMax": 1, "yMax0": 1, "yMin": 0, "yMin0": 0 });
    expect( Graph.getDomains([ 0, 1 ], [ "A", "B", "C" ], [ 0, 1 ], [ "A", "B", "C" ], false, true )).toEqual({
        "xD": 0, "xMax": 1, "xMax0": 1, "xMin": 0, "xMin0": 0, "yD": 1, "yMax": 2, "yMax0": 2, "yMin": 0, "yMin0": 0 });
    expect( Graph.getDomains([ "A", "B", "C" ], [ 0, 1 ], [ "A", "B", "C" ], [ 0, 1 ], true, false )).toEqual({
        "xD": 1, "xMax": 2, "xMax0": 2, "xMin": 0, "xMin0": 0, "yD": 0, "yMax": 1, "yMax0": 1, "yMin": 0, "yMin0": 0 });
    expect( Graph.getDomains([ "A", "B", "C" ], [ "A", "B", "C" ], [ "A", "B", "C" ], [ "A", "B", "C" ], true, true )).toEqual({
        "xD": 1, "xMax": 2, "xMax0": 2, "xMin": 0, "xMin0": 0, "yD": 1, "yMax": 2, "yMax0": 2, "yMin": 0, "yMin0": 0 });
});

it( "zooms in two dimensions", () => {

    // Continuous scales.
    let xScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]),
        yScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]);
    Graph.onZoom2D( true, xScale, yScale, [ 0, 1 ], [ 0, 1 ], true, true );
    expect( xScale.domain()).toEqual([ 0.125, 0.875 ]);
    expect( yScale.domain()).toEqual([ 0.125, 0.875 ]);
    Graph.onZoom2D( false, xScale, yScale, [ 0, 1 ], [ 0, 1 ], true, true );
    expect( xScale.domain()).toEqual([ 0, 1 ]);
    expect( yScale.domain()).toEqual([ 0, 1 ]);
    
    // Ordinal scales.
    xScale = d3.scaleBand().domain( "A", "B", "C" ).range([ 0, 100 ]);
    yScale = d3.scaleBand().domain( "A", "B", "C" ).range([ 0, 100 ]);
    Graph.onZoom2D( true, xScale, yScale, [ "A", "B", "C" ], [ "A", "B", "C" ], true, true );
    expect( xScale.domain()).toEqual([ "A" ]);
    expect( yScale.domain()).toEqual([ "A" ]);
    Graph.onZoom2D( false, xScale, yScale, [ "A", "B", "C" ], [ "A", "B", "C" ], true, true );
    expect( xScale.domain()).toEqual([ "A", "B" ]);
    expect( yScale.domain()).toEqual([ "A", "B" ]);
    Graph.onZoom2D( false, xScale, yScale, [ "A", "B", "C" ], [ "A", "B", "C" ], true, true );
    expect( xScale.domain()).toEqual([ "A", "B", "C" ]);
    expect( yScale.domain()).toEqual([ "A", "B", "C" ]);
});

it( "zooms in one dimension: mousedown, mousemove, and mouseup events", () => {

    // Continuous scales.
    let margin = { top: 0, right: 0, bottom: 50, left: 50 },
        padding = { top: 0, right: 0, bottom: 0, left: 0 },
        xScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]),
        yScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]);
    Graph.onMouseDown({ type: "mousedown", nativeEvent: { offsetX: 100, offsetY: 390 }, preventDefault: () => {}}, 400, 400, margin, padding, 0, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 100, y: 390, xDomain: [ 0, 1 ], yDomain: [], isX: true, isY: false, isMin: false, isMax: false });
    Graph.onMouseUp({ type: "mouseup", nativeEvent: { offsetX: 100, offsetY: 390 }}, 400, 400, margin, padding, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 100, y: 390, xDomain: [ 0, 1 ], yDomain: [], isX: false, isY: false, isMin: false, isMax: false });
    Graph.onMouseDown({ type: "mousedown", nativeEvent: { offsetX: 10, offsetY: 100 }, preventDefault: () => {}}, 400, 400, margin, padding, 0, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 10, y: 100, xDomain: [], yDomain: [ 0, 1 ], isX: false, isY: true, isMin: false, isMax: false });
    Graph.onMouseUp({ type: "mouseup", nativeEvent: { offsetX: 100, offsetY: 390 }}, 400, 400, margin, padding, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 10, y: 100, xDomain: [], yDomain: [ 0, 1 ], isX: false, isY: false, isMin: false, isMax: false });
    
    // Categorical scales.
    xScale = d3.scaleBand().domain( "A", "B", "C" ).range([ 0, 100 ]);
    yScale = d3.scaleBand().domain( "A", "B", "C" ).range([ 0, 100 ]);
    Graph.onMouseDown({ type: "mousedown", nativeEvent: { offsetX: 100, offsetY: 390 }, preventDefault: () => {}}, 400, 400, margin, padding, 0, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 100, y: 390, xDomain: [ "A" ], yDomain: [], isX: true, isY: false, isMin: false, isMax: false });
    Graph.onMouseUp({ type: "mouseup", nativeEvent: { offsetX: 100, offsetY: 390 }}, 400, 400, margin, padding, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 100, y: 390, xDomain: [ "A" ], yDomain: [], isX: false, isY: false, isMin: false, isMax: false });
    Graph.onMouseDown({ type: "mousedown", nativeEvent: { offsetX: 10, offsetY: 100 }, preventDefault: () => {}}, 400, 400, margin, padding, 0, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 10, y: 100, xDomain: [], yDomain: [ "A" ], isX: false, isY: true, isMin: false, isMax: false });
    Graph.onMouseUp({ type: "mouseup", nativeEvent: { offsetX: 100, offsetY: 390 }}, 400, 400, margin, padding, xScale, yScale, [ 0, 1 ], [ 0, 1 ]);
    expect( Graph.downLocation ).toEqual({ x: 10, y: 100, xDomain: [], yDomain: [ "A" ], isX: false, isY: false, isMin: false, isMax: false });
    
    // TODO:  Test more cases here.
});

// TODO:  Test more cases here.  These were generated by ChatGPT.
it('returns the bins', () => {

    // Returns the correct bins.
    const data = [
        [ 1, 2 ],
        [ 2, 3 ],
        [ 3, 4 ],
        [ 4, 5 ],
    ];
    const xScale = d3.scaleLinear().domain([ 1, 5 ]);
    let bins = Graph.getBins( data, 0, xScale, 0.5 );
    expect( bins.length).toEqual( 3 );
    expect( bins[ 0 ].x1 - bins[ 0 ].x0 ).toBeGreaterThan( 1.33 );
    expect( bins[ 0 ].x1 - bins[ 0 ].x0 ).toBeLessThan( 1.34 );
    expect( bins[ 0 ].length ).toEqual( 2 );
    expect( bins[ 1 ].length ).toEqual( 1 );
    expect( bins[ 2 ].length ).toEqual( 1 );

    // Handles an empty data set correctly.
    bins = Graph.getBins([], 0, xScale, 0.5 );
//    expect(bins).toEqual([]);

    // Handles an invalid column index correctly.
    bins = Graph.getBins( data, 3, xScale, 0.5 );
//    expect(bins).toEqual([]);
});

it( "draws the axes", () => {
    let ref = { current: { childNodes: [
            document.createElement( "svg" ),
            document.createElement( "BUTTON" ),
            document.createElement( "BUTTON" ),
            document.createElement( "SPAN" ),
            document.createElement( "SPAN" )
        ]}},
        margin = { top: 0, right: 0, bottom: 50, left: 50 },
        padding = { top: 0, right: 0, bottom: 0, left: 0 },
        xScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]),
        yScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]);
    Graph.drawAxes( ref, 400, 400, margin, padding, 0, xScale, yScale, [ 0, 1 ], [ 0, 1 ], "X", "Y" );
});

it( "draws the controls", () => {
    let ref = { current: { childNodes: [
            document.createElement( "svg" ),
            document.createElement( "BUTTON" ),
            document.createElement( "BUTTON" ),
            document.createElement( "SPAN" ),
            document.createElement( "SPAN" )
        ]}},
        margin = { top: 0, right: 0, bottom: 50, left: 50 },
        padding = { top: 0, right: 0, bottom: 0, left: 0 },
        xScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]),
        yScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, 100 ]);
    Graph.drawControls( ref, 400, 400, margin, padding, 0, true, true, true, true, xScale, yScale, [ 0, 1 ], [ 0, 1 ], "X", "Y" );
    Graph.drawControls( ref, 400, 400, margin, padding, 0, false, false, false, false, xScale, yScale, [ 0, 1 ], [ 0, 1 ], "X", "Y" );
});
