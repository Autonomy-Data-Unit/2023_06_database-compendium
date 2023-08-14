import { select, create, zoom } from "d3";
import { ForceGraph } from "./network.js";

import edgeData_cols from "../nbs/data/identicalColumns_scoredByRarity_mt5.json" assert { type: "json" };
import edgeData_cols_Alt from "../nbs/data/identicalColumns_scoredByRarity_alt.json" assert { type: "json" };
import edgeData_embeddings from "../nbs/data/descriptionEmbeddings_t5pct.json" assert { type: "json" };
import dataTitlesId from "../nbs/data/datasets_titles_ids.json" assert { type: "json" };
import {
  getSecondDegreeData,
  toggleEdges,
  setupEventListeners,
  setupData,
  searchbar,
  countLinks,
} from "./graphSettingOptions.js";

// Initialising variables
const width = 2 * window.innerWidth * 0.9;
const height = 2 * window.innerHeight * 0.85;
var minWeight = 10;
var selectedNode = null;
var edgeData = edgeData_cols_Alt;

const slider = document.getElementById("minConStrength-range");
const edgesCheckbox = document.getElementById("edges-checkbox");

const titles = dataTitlesId.Title;
var datasetUsed = { value: "specificData" };

var data = setupData(edgeData, titles, minWeight, width, height);
var transformedEdgeData = data["transformedEdgeData"];
var specificData = data["specificData"];
const nodeData = data["nodes"];
var nodes = nodeData.map((d) => ({ ...d })); // creating copy prevents the original nodeData from being modified

// Dropdown menu to change the dataset being used
var dd = document.getElementById("network-dataset");
dd.onchange = () => {
  // console.log(dd.value);
  if (dd.value === "identicalColumns-method1") {
    // Replacing data with new data from a different dataset
    edgeData = edgeData_cols;
    data = setupData(edgeData, titles, minWeight, width, height);
    transformedEdgeData = data["transformedEdgeData"];
    specificData = data["specificData"];
    nodes = nodeData.map((d) => ({ ...d })); // creating copy prevents the original nodeData from being modified

    // Resetting the graph with the new data and updating the slider to match the range of the connection weights
    resetGraph();
    slider.setAttribute("min", "5");
    slider.setAttribute("step", "0.125");
  } else if (dd.value === "identicalColumns-method2") {
    edgeData = edgeData_cols_Alt;
    data = setupData(edgeData, titles, minWeight, width, height);
    transformedEdgeData = data["transformedEdgeData"];
    specificData = data["specificData"];
    nodes = nodeData.map((d) => ({ ...d })); // creating copy prevents the original nodeData from being modified
    svg.selectAll("*").remove();

    // Resetting the graph with the new data and updating the slider to match the range of the connection weights
    resetGraph();
    slider.setAttribute("min", "0");
    slider.setAttribute("step", "0.25");
  } else {
    edgeData = edgeData_embeddings;
    data = setupData(edgeData, titles, minWeight, width, height);
    transformedEdgeData = data["transformedEdgeData"];
    specificData = data["specificData"];
    nodes = nodeData.map((d) => ({ ...d })); // creating copy prevents the original nodeData from being modified
    svg.selectAll("*").remove();

    // Resetting the graph with the new data and updating the slider to match the range of the connection weights
    resetGraph();
    slider.setAttribute("min", "2");
    slider.setAttribute("step", "0.2");
  }
};

// const nodes = nodeData.map((d) => ({ ...d })); // creating copy prevents the original nodeData from being modified

const svg = create("svg")
  .attr("id", "graph-container")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [-width / 2, -height / 2, width, height])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

var graphSettingsObj = {
  width: width,
  height: height,
  // nodeRadius: 4,
  nodeStroke: "#181818", // new addition for dark theme
  nodeFill: "#9DCAEB",
  colors: ["#FF964F", "#C3B1E1", "#9DCAEB"],
  nodeStrokeOpacity: 0.8,
  linkStrokeOpacity: 0.7,
  linkStroke: "#404040", // new addition for dark theme
  linkStrokeWidth: (d) => d.weight / 5,
  nodeTitle: (d) => d.title, //\nID: ${d.id}`,
  nodeStrength: -2,
  linkStrength: 0.2,
  svg: svg,
};

var degreesSeperation_settingObj = graphSettingsObj;
degreesSeperation_settingObj = {
  ...degreesSeperation_settingObj,
  nodeRadius: () => 8,
  nodeGroup: (d) => d.group,
  nodeGroups: [0, 1, 2],
  linkStrokeWidth: (d) => Math.max(d.weight / 5, 0.5),
  nodeTitle: (d) => `${d.title}`, //\nID: ${d.group}`,
  nodeStrength: -5,
};

const main = async (specificData, nodes) => {
  var newNodes = filterNodes(specificData, nodes); // Leaving out nodes that have no connections

  var linkCount = countLinks(specificData);

  const graph = ForceGraph(
    { nodes: newNodes, links: specificData },
    {
      ...graphSettingsObj,
      nodeRadius: (d) => Math.sqrt(linkCount[d.id] + 8) || 4,
    }
  );

  // append the created svg to the body
  select("body").append(() => graph);

  datasetUsed = setupEventListeners(
    slider,
    svg,
    transformedEdgeData,
    nodes,
    degreesSeperation_settingObj,
    datasetUsed
  );
};

main(specificData, nodes);

toggleEdges(svg);
searchbar(svg, titles, () => countLinks(specificData));

// Add zoom
const zoomInOut = zoom()
  .on("zoom", function (event) {
    svg.selectAll("g").attr("transform", event.transform);
  })
  .scaleExtent([0.5, 10]);
svg.call(zoomInOut);

/*
Reset button
Resets the graph to it's starting point (with the edges visible and therefore
the checkbox is set to true no matter what)
*/
document.getElementById("resetButton").addEventListener("click", resetGraph);
function resetGraph() {
  svg.selectAll("*").remove();
  edgesCheckbox.checked = true;
  slider.value = 10;
  selectedNode = null;
  datasetUsed.value = "specificData";
  specificData = transformedEdgeData.filter((obj) => obj.weight >= 10);
  main(specificData, nodes);
}

/*
Updates the graph on release of the slider using the slider value to determine 
the data used.
*/
slider.addEventListener("mouseup", function () {
  minWeight = this.value;

  svg.selectAll("*").remove();

  if (datasetUsed.value === "specificData") {
    selectedNode = null;

    specificData = transformedEdgeData.filter(
      (obj) => obj.weight >= this.value
    );

    var newNodes = filterNodes(specificData, nodes);
    var linkCount = countLinks(specificData);

    ForceGraph(
      { nodes: newNodes, links: specificData },
      {
        ...graphSettingsObj,
        selectedNode,
        nodeRadius: (d) => Math.sqrt(linkCount[d.id] + 8) || 4,
      }
    );
    setupEventListeners(
      slider,
      svg,
      transformedEdgeData,
      nodes,
      degreesSeperation_settingObj,
      datasetUsed
    );
  } else {
    selectedNode = datasetUsed.selectedNode;

    var data = getSecondDegreeData(
      transformedEdgeData,
      nodes,
      selectedNode,
      this.value
    );
    var newNodes = data[0];
    var secondDegreeData = data[1];

    ForceGraph(
      { nodes: newNodes, links: secondDegreeData },
      { ...degreesSeperation_settingObj, selectedNode }
    );
  }
});

function filterNodes(data, nodes) {
  var uniqueIds = new Set();
  data.forEach((obj) => {
    uniqueIds.add(obj.source);
    uniqueIds.add(obj.target);
  });

  // Only showing nodes with connections
  var newNodes = nodes.filter((obj) => Array.from(uniqueIds).includes(obj.id));

  return newNodes;
}
