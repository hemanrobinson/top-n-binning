import { act, render, screen } from '@testing-library/react';
import ReactDOM from 'react-dom';
import App from './App';

let container;

beforeEach(() => {
    container = document.createElement( "div" );
    document.body.appendChild( container );
});

afterEach(() => {
    document.body.removeChild( container );
    container = null;
});

it( "renders App with childnodes", () => {
    
    // Test first render and componentDidMount.
    act(() => {
        ReactDOM.render(<App />, container );
    });
    
    // Test structure.
    const div = container.querySelector( "div" );
    expect( div.className ).toBe( "Column" );
    let n = div.childNodes.length;
    expect( n ).toBe( 7 );
    for( let i = 0; ( i < n - 1 ); i += 2 ) {
        expect( div.childNodes[ i ].className ).toBe( "Description" );
        expect( div.childNodes[ i + 1 ].className ).toBe(( i < n - 2 ) ? "Graph" : "" );
    }
});
