import React from 'react';
import Histogram from './Histogram';
import BarChart from './BarChart';
import Heatmap from './Heatmap';
import './App.css';
import shneiderman from './shneiderman.png';

// Application:  Dynamic Binning
const App = () => {
    
    // Return the App.
    return (
        <div className="Column">
            <div className="Description">
                <h1>Dynamic Binning</h1>
                <p>
                <a href="https://www.cs.umd.edu/users/ben/">Ben Shneiderman</a> taught us all to <a href="https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf">"Overview first, zoom and filter, then details-on-demand"</a>.
                </p>
                <p className="center">
                    <a href="https://www.cs.umd.edu/users/ben/"><img alt="Dr. Ben Shneiderman" src={shneiderman}/></a>
                </p>
                <p>
                Does "zooming" include binning?  In graphs that display summarized data, rather than individual points, zooming the scales may not help us explore.  Adjusting the bins often can.
                </p>
                <p>
                Hover over the graphs below to see the binning controls.  Use the sliders to adjust the bins.
                </p>
                <h2>Continuous Data</h2>
                <p>
                For continuous data, there are <a href="https://en.wikipedia.org/wiki/Histogram#Number_of_bins_and_width">many rules</a> for determining bin width.  The rules supported in d3 are demonstrated in notebooks <a href="https://observablehq.com/@d3/d3-bin">here</a> and <a href="https://observablehq.com/@jonhelfman/plot-histogram-bin-width">here</a>.
                </p>
                <p>
                These rules produce different results, because this problem doesn't have one right answer.  So it's best to let the user explore.
                </p>
                <p>
                A slider control on the axis affords adjustment of the bins.  In the histogram below, larger bin widths suggest the data might fit a normal distribution.  Smaller bin widths suggest a multimodal distribution.  (The generated data are in fact bimodal).
                </p>
            </div>
            <div className="Graph">
                <Histogram dataSet={ "Normal" } />
            </div>
            <div className="Description">
                <h2>Categorical Data</h2>
                <p>
                For categorical data, the smaller categories can be combined into an "Other" bin.  This clearly displays the larger categories -- the "Top 5", "Top 10", or however many the user desires.
                </p>
                <p>
                This is another problem that doesn't have one right answer, so it's best to let the user explore.
                </p>
                <p>
                With a modern user interface, we can make the "Other" bin dynamically adjustable.  This is particularly useful with "long-tailed" distributions, as in the bar chart below.
                </p>
            </div>
            <div className="Graph">
                <BarChart dataSet={ "Sales" } />
            </div>
            <div className="Description">
                <h2>Multiple Dimensions</h2>
                <p>
                This user interface extends readily to multiple dimensions.  The heatmap below demonstrates continuous binning on the horizontal axis and categorical binning on the vertical axis.
                </p>
            </div>
            <div className="Graph">
                <Heatmap dataSet={ "Trends" } />
            </div>
            <div className="Description">
                <h2>Design Notes</h2>
                <p>
                To minimize distraction from the data display, controls are displayed only when they can be used.  Controls are discoverable by simply hovering over the graph.
                </p>
                <p>
                The slider is positioned along the axis to afford direct manipulation in that dimension and to conserve screen real estate.
                </p>
                <p>
                The default bin width is determined by <a href="https://github.com/d3/d3-array/blob/main/README.md#thresholdScott">Scott's binning rule</a>.
                </p>
                <p>
                For readability, bin widths are rounded to the nearest tick interval or even division thereof.
                </p>
                <br/>
                <h2>References</h2>
                <ul>
                    <li><a href="https://bayes.wustl.edu/Manual/FreedmanDiaconis1_1981.pdf">Freedman, David; Diaconis, P. (1981). "On the histogram as a density estimator: L2 theory". Zeitschrift für Wahrscheinlichkeitstheorie und Verwandte Gebiete. 57 (4): 453–476.</a><br/>Freedman and Diaconis' binning rule</li>
                    <li><a href="https://www.jstor.org/stable/2335182?origin=JSTOR-pdf">Scott, David W. (1979). "On optimal and data-based histograms". Biometrika. 66 (3): 605–610.</a><br/>Scott's binning rule</li>
                    <li><a href="https://www.jstor.org/stable/2965501#metadata_info_tab_contents">Sturges, H. A. (1926). "The choice of a class interval". Journal of the American Statistical Association. 21 (153): 65–66.</a><br/>Sturges' binning rule</li>
                </ul>
            </div>
            <a href="https://github.com/hemanrobinson/bin/">Code Shared on GitHub</a>
        </div>
    );
}

export default App;
