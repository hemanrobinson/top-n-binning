import React from 'react';
import Histogram from './Histogram';
import BarChart from './BarChart';
import Heatmap from './Heatmap';
import './App.css';
import shneiderman from './shneiderman.jpg';

// Application:  Dynamic Binning.
const App = () => {
    
    // Return the App.
    return (
        <div className="Column">
            <div className="Description">
                <h1>Better Binning</h1>
                <p>
                Dr. Ben Shneiderman taught us all to <a href="https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf">"Overview first, zoom and filter, then details-on-demand"</a>.
                </p>
                <a title="Robert Kosara, CC0, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Ben_Shneiderman_at_UNCC.jpg"><img width="256" alt="Ben Shneiderman at UNCC" src={shneiderman}/></a>
                <p>
                Does "zooming" include binning?  In aggregate graphs, adjusting scales may not help us explore the data.  However, adjusting bins often can.
                </p>
                <p>
                Hover over the graphs below to see the binning controls.  Use the sliders to adjust the bins.
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
                Categorical data presents a different problem.  When there are many categories, the smaller ones can be usefully combined into an "Other" category.  This clarifies the largest categories -- the "Top 5", "Top 10", or however many the user desires.
                </p>
                <p>
                "Other" bins have been used for many years.  With a modern user interface, we can make them interactively adjustable and efficient for the user.  This is particularly useful when exploring "long-tailed" distributions, as in the bar chart below.
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
                <h2>About this Design</h2>
                <p>
                To minimize distraction from the data display, controls are displayed only when they can be used.
                </p>
                <p>
                There are three locations where binning controls might be placed:  inside the graph, outside the graph, or along the axes.
                </p>
                <p>
                The first location, inside the graph, can be implemented with a hand or "grabber" cursor.  A cursor does not interfere with the data display, but usability tests showed that this was difficult to learn.  This may be because a cursor displays only a few pixels, so can easily be missed, or because manipulating a data display is an unfamiliar action.
                </p>
                <p>
                The second location, outside the graph, is easy to learn.  Controls can be more visible and labeled, such as a slider or entry field labeled "Bin Width".  However, a location outside the graph requires either additional screen real estate, which may not be available; or placement in a dialog, which is less efficient for the user.
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
