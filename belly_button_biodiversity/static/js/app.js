async function buildMetadata(sample) {
  // route for data
  const url = "/metadata/" + sample;
  // console.log(url)

  const response = await d3.json(url);
  // console.log(response);

  // remove any html existing and create an unordered list in metadata
  var div = d3.select("#sample-metadata")
  div.html("")
  var ul = div.append('ul');

  // loop through each value in response and add as a list item
  for (key in response) {
    ul.append("li").text(`${key}: ${response[key]}`).attr("class", "list-group-item");
    // console.log(`key = ${key}`);
    // console.log(`value = ${response[key]}`);
  }

  // add some bootstrap classes to the unordered list
  ul.attr("class", "list-group list-group-flush");

  // BONUS: Build the Gauge Chart
  buildGauge(response.WFREQ);
}

function buildGauge(washFrequency) {
  //create the gauge
  var data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: washFrequency,
      title: { text: "Belly Button Wash Frequency per Week" },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [0, 9] },
        bar: {'color': "rgb(0,60,48)"},
        steps: [
          { range: [0, 3], color: "rgba(212, 200, 186, 1)"},
          { range: [3, 6], color: "rgba(201, 231, 135, 1)" },
          { range: [6, 9], color: "rgba(137, 207, 177, 1)" }
        ]
      }
    }
  ];

  // console.log(data)
  var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  Plotly.newPlot(gauge, data, layout);
};

async function buildCharts(sample) {
  // route for data
  const url = "/samples/" + sample;
  // console.log(url)

  const response = await d3.json(url);
  // console.log(response);

  var colorscale = [
    'rgb(0,60,48)', 'rgb(1,102,94)', 'rgb(53,151,143)', 'rgb(128,205,193)', 'rgb(199,234,229)',
    'rgb(246,232,195)', 'rgb(223,194,125)', 'rgb(191,129,45)', 'rgb(140,81,10)', 'rgb(84,48,5)'
  ];

  // build the pie chart
  // python alrady sorted the data so only pick first 10 values
  const tracePie = {
    text: response.otu_labels.slice(0, 10),
    labels: response.otu_ids.slice(0, 10),
    values: response.sample_values.slice(0, 10),
    textinfo: 'percent',
    hoverinfo: 'text',
    type: 'pie',
    marker: {
      colors: colorscale
    },
  };
  const dataPie = [tracePie];

  const layoutPie = {
    title: `Top Bacteria for Sample ${sample}`
  };

  Plotly.newPlot("pie", dataPie, layoutPie);

  // create bubble chart
  const traceBubble = {
    x: response.otu_ids,
    y: response.sample_values,
    text: response.otu_labels,
    hoverinfo: 'text',
    marker: {
      color: response.otu_ids,
      size: response.sample_values,
      colorscale: "Earth"
    },
    mode: 'markers'
  }
  const dataBubble = [traceBubble];
  const layoutBubble = {
    title: `Bacteria Values for Sample ${sample}`,
    xaxis: {
      title: "OTU ID"
    }
  };

  Plotly.newPlot("bubble", dataBubble, layoutBubble);
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
