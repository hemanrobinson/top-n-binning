import Data from './Data';

it( "invokes Data function", () => {
    expect( Data()).toEqual( undefined );
});

it( "returns column names", () => {
    expect( Data.getColumnNames()).toEqual([ "Species", "Sepal Length (cm)", "Sepal Width (cm)", "Petal Length (cm)", "Petal Width (cm)" ]);
    expect( Data.getColumnNames( "Iris" )).toEqual([ "Species", "Sepal Length (cm)", "Sepal Width (cm)", "Petal Length (cm)", "Petal Width (cm)" ]);
    expect( Data.getColumnNames( "Normal" )).toEqual([ "Random Normal, Bimodal" ]);
    expect( Data.getColumnNames( "Penguins" )).toEqual([ "Species", "Island", "Bill Length (mm)", "Bill Depth (mm)", "Flipper Length (mm)", "Body Mass (g)", "Sex" ]);
    expect( Data.getColumnNames( "Sales" )).toEqual([ "Model", "Cars Sold, 2022 Q1" ]);
    expect( Data.getColumnNames( "Stocks" )).toEqual([ "Year", "S&P 500 Index" ]);
    expect( Data.getColumnNames( "Trends" )).toEqual([ "Week Number", "Week", "Google Trends 2020", "Interest" ]);
});

it( "returns values", () => {
    expect( Data.getValues().length ).toBe( 150 );
    expect( Data.getValues( "Iris" ).length ).toBe( 150 );
    expect( Data.getValues( "Normal" ).length ).toBe( 500 );
    expect( Data.getValues( "Penguins" ).length ).toBe( 342 );
    expect( Data.getValues( "Sales" ).length ).toBe( 288 );
    expect( Data.getValues( "Stocks" ).length ).toBe( 153 );
    expect( Data.getValues( "Trends" ).length ).toBe( 1113 );
});
