import React from 'react';
import Histogram from './Histogram';
import BarChart from './BarChart';
import Heatmap from './Heatmap';
import './App.css';

// Application:  Binning.
const App = () => {
    
    // Return the App.
    return (
        <div className="Column">
            <div className="Description">
                <h1>Binning</h1>
                <p>
                Shneiderman taught us all to <a href="https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf">"Overview first, zoom and filter, then details-on-demand"</a>.  Is the word "zoom" meant to include binning?
                </p>
                <p>
                "Zooming" refers to scaling, while "binning" refers to grouping. Both adjustments enable users to explore their data.  Particularly with large data sets, which often require aggregate graphs, interactive binning can help us when zooming cannot.
                </p>
                <p>
                To minimize distraction from the data display, controls are displayed only when needed.  Hover over the graph to see the binning controls.
                </p>
                <h2>Continuous Data</h2>
                <p>
                For continuous data sets, a slider control on the axis affords adjustment of the bins.  In the histogram below, for example, there is one prominent peak at the center of the distribution.  Decreasing the bin size reveals a second peak on the right.
                </p>
            </div>
            <div className="Graph">
                <Histogram dataSet={ "Cytometry" } />
            </div>
            <div className="Description">
                <h2>Categorical Data</h2>
                <p>
                Categorical data presents a different problem.  When there are many categories, the smaller ones can be usefully combined into an "Other" category.  This clarifies the largest categories, the "Top 10", "Top 20", or however many of the user desires.
                </p>
                <p>
                "Other" categories have been used for at least fifty years.  With a modern user interface, we can make them interactively adjustable and efficient for the user.  This is particularly useful when exploring "long-tailed" distributions, as in the bar chart below.
                </p>
            </div>
            <div className="Graph">
                <BarChart dataSet={ "Sales" } />
            </div>
            <div className="Description">
                <h2>Multiple Dimensions</h2>
                <p>
                This user interface extends readily to multiple dimensions.   The heatmap below demonstrates continuous and categorical binning in two dimensions.
                </p>
            </div>
            <div className="Graph">
                <Heatmap dataSet={ "Food" } />
            </div>
            <div className="Description">
                <h2>About This User Interface</h2>
                <p>
                There are three locations where binning controls might be placed:  inside the graph, outside the graph, or along the axes.
                </p>
                <p>
                The first location, inside the graph, can be implemented with a hand or "grabber" cursor.  A cursor does not interfere with the data display, but usability tests showed that this was difficult to learn.  This may be because a cursor displays only a few pixels, so can easily be missed, or because manipulating a data display is an unfamiliar action.
                </p>
                <p>
                The second location, outside the graph, is easy to learn.  Controls can be more visible and labeled, such as a slider or entry field labeled "Bin Width".  However, a location outside the graph requires either additional screen real estate, which may not be available; or placement in a  dialog, which is less efficient for the user.
                </p>
                <p>
                The third location, along the axis, is less prominent than the second; but manipulating a slider is a familiar action so is still easily learned.
                </p>
            </div>
            <a href="https://github.com/hemanrobinson/zoom/">Code Shared on GitHub</a>
        </div>
    );
}

export default App;
