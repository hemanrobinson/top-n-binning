import React from 'react';
import Histogram from './Histogram';
import BarChart from './BarChart';
import Heatmap from './Heatmap';
import './App.css';
import github from './github.svg';
import shneiderman from './shneiderman.png';

// Application:  Dynamic Top N and Binning Visualizations
const App = () => {
    
    // Return the App.
    return (
        <div className="Column">
            <div className="Description">
                <h1>Dynamic Top N and Binning Visualizations&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/hemanrobinson/bin/"><img className="icon" title="Code Shared on GitHub" alt="Code Shared on GitHub" src={github}/></a></h1>
                <p>
                <a href="https://www.cs.umd.edu/users/ben/">Ben Shneiderman</a> taught us all to <a href="https://www.perceptualedge.com/articles/b-eye/path_to_visual_discovery.pdf">"Overview first, zoom and filter, then details-on-demand"</a> (Shneiderman, 1996).
                </p>
                <p className="center">
                    <a href="https://www.cs.umd.edu/users/ben/"><img title="Dr. Ben Shneiderman" alt="Dr. Ben Shneiderman" src={shneiderman}/></a>
                </p>
                <p>
                Does "zooming" include binning?  In graphs of aggregated data, zooming the scales may not help us explore.  Adjusting bins and categories often can.
                </p>
                <p>
                Hover over the graphs below to see the controls.  Use the sliders to adjust the bins and categories.
                </p>
                <h2>Continuous Data</h2>
                <p>
                For continuous data, there are <a href="https://en.wikipedia.org/wiki/Histogram#Number_of_bins_and_width">many rules</a> for determining bin width.  D3's supported rules are <a href="https://observablehq.com/@d3/d3-bin">demonstrated here</a> (Freedman and Diaconis, 1981) (Scott, 1979) (Sturges, 1926).
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
                For categorical data, the smaller categories can be combined into an "Other" bin.  This clearly displays the "Top N" larger categories -- top 5, top 10, or however many the user desires.
                </p>
                <p>
                We don't know what the user desires, and it may depend on the data. So as with the continuous case, it's best to let the user explore.
                </p>
                <p>
                With modern technology, we can make the "Other" bin dynamically adjustable.  This is particularly useful with "long-tailed" distributions, as in the bar chart below.
                </p>
            </div>
            <div className="Graph">
                <BarChart dataSet={ "Sales" } />
            </div>
            <div className="Description">
                <h2>Multiple Dimensions</h2>
                <p>
                This user interface extends readily to multiple dimensions.  The heatmap below demonstrates both continuous and categorical binning.
                </p>
            </div>
            <div className="Graph">
                <Heatmap dataSet={ "Trends" } />
            </div>
            <div className="Description">
                <h2>User Interface</h2>
                <p>
                To minimize distraction from the data display, controls are displayed only when they can be used.  On desktops, controls are discoverable by hovering over the graph.  (On mobile devices, not supported here, a tap might serve this purpose.)
                </p>
                <p>
                  For continuous data, the default bin width is determined by Scott's binning rule (Scott, 1979).  The minimum bin width is the smallest visible width.  The maximum bin width puts all the data in one bin.  These are natural limits that users expect.
                </p>
                <p>
                  For categorical data, the default behavior is to show all the categories. At the other extreme, the natural limit is to lump all the data into one category.
                </p>
                <p>
                  Positioning the slider along the axis conserves screen real estate, but the better reason is that it improves usability. This positioning enables the user to focus their eyes in one place, rather than switching between the graph in one place and the controls in another.
                </p>
                <h2>Implementation</h2>
                <p>
                This project uses <a href="https://react.dev">React</a>, <a href="https://github.com/mui-org/material-ui">Material-UI</a>, and <a href="https://github.com/d3/d3">d3</a>.
                </p>
                <h2>Further Reading</h2>
                <ul>
                    <li>Freedman, D. and Diaconis, P. (1981). "On the histogram as a density estimator: L2 theory". Zeitschrift für Wahrscheinlichkeitstheorie und Verwandte Gebiete. 57 (4): 453–476. <a href="https://bayes.wustl.edu/Manual/FreedmanDiaconis1_1981.pdf">https://bayes.wustl.edu/Manual/FreedmanDiaconis1_1981.pdf</a>.</li><br/>
                    <li>Scott, D. W. (1979). "On optimal and data-based histograms". Biometrika. 66 (3): 605–610. <a href="https://doi.org/10.2307/2335182">https://doi.org/10.2307/2335182</a>.</li><br/>
                    <li>Shneiderman, B. (1996). "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations". In Proceedings of the IEEE Symposium on Visual Languages, Sept. 1996, 336-343. <a href="https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf">https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf</a>.</li><br/>
                    <li>Sturges, H. A. (1926). "The choice of a class interval". Journal of the American Statistical Association. 21 (153): 65–66. <a href="https://www.jstor.org/stable/2965501">https://www.jstor.org/stable/2965501</a>.</li><br/>
                </ul>
            </div>
        </div>
    );
}

export default App;
