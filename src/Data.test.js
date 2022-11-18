import Data from './Data';

it( "invokes Data function", () => {
    expect( Data()).toEqual( undefined );
});

it( "returns column names", () => {
    expect( Data.getColumnNames()).toEqual([ "Species", "Sepal Length (cm)", "Sepal Width (cm)", "Petal Length (cm)", "Petal Width (cm)" ]);
    expect( Data.getColumnNames( "Iris" )).toEqual([ "Species", "Sepal Length (cm)", "Sepal Width (cm)", "Petal Length (cm)", "Petal Width (cm)" ]);
    expect( Data.getColumnNames( "Cytometry" )).toEqual([ "Cluster", "Prin 1", "Prin 2", "ForSc", "SideSc", "CD3", "CD8", "CD4", "MCB", "Distance" ]);
    expect( Data.getColumnNames( "Food" )).toEqual([ "Food", "Calories", "Fat", "Carbohydrates", "Protein" ]);
});

it( "returns values", () => {
    expect( Data.getValues().length ).toBe( 150 );
    expect( Data.getValues( "Iris" ).length ).toBe( 150 );
    expect( Data.getValues( "Cytometry" ).length ).toBe( 500 );
    expect( Data.getValues( "Food" ).length ).toBe( 303 );
});

