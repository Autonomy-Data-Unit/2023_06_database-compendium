import { select, selectAll, randomNormal } from "d3";
import { ForceGraph } from "./network";
import Fuse from "fuse.js";

// Toggles edges
export const toggleEdges = function (svg) {
  const checkbox = document.getElementById("edges-checkbox");
  checkbox.addEventListener("change", (e) => {
    if (e.currentTarget.checked) {
      svg.selectAll("line").classed("hide-links", false);
    } else {
      svg.selectAll("line").classed("hide-links", true);
    }
  });
};

export const getSecondDegreeData = function (
  transformedEdgeData,
  nodes,
  selectedNode,
  filterConnections = 0
) {
  /*Function to get all nodes withing two degrees of seperation from a selected node*/

  // First pass: Get the nodes directly connected to selectedNode
  const firstPassData = transformedEdgeData.filter(
    (obj) => obj.source === selectedNode || obj.target === selectedNode
  );

  // Creating a set of unique IDs which refer to the nodes directly connected
  // to the selected node
  var firstUniqueIds = new Set();
  firstPassData.forEach((obj) => {
    firstUniqueIds.add(obj.target);
    firstUniqueIds.add(obj.source);
  });

  // Second pass: Dont include connections between first degree of seperation nodes
  const firstDegreeData = firstPassData.filter(
    (obj) => obj.source === selectedNode || obj.target === selectedNode
  );

  firstDegreeData.forEach((obj) => {
    firstUniqueIds.add(obj.target);
    firstUniqueIds.add(obj.source);
  });

  // Using the IDs of the nodes with one degree of separation to get connections up to
  // two degrees of separation
  var secondDegreeData = [...firstDegreeData];

  // Add additional connections that are between first-degree nodes and second-degree nodes
  transformedEdgeData.forEach((obj) => {
    if (
      (firstUniqueIds.has(obj.source) && !firstUniqueIds.has(obj.target)) ||
      (firstUniqueIds.has(obj.target) && !firstUniqueIds.has(obj.source))
    ) {
      secondDegreeData.push(obj);
    }
  });

  if (filterConnections > 0) {
    secondDegreeData = secondDegreeData.filter(
      (obj) => obj.weight >= filterConnections
    );
  }

  var secondUniqueIds = new Set();
  secondDegreeData.forEach((obj) => {
    secondUniqueIds.add(obj.source);
    secondUniqueIds.add(obj.target);
  });

  // Only showing nodes with connections
  var newNodes = nodes.filter(
    (obj) =>
      obj.id === selectedNode || Array.from(secondUniqueIds).includes(obj.id)
  );

  // Grouping nodes by degree of seperation
  newNodes.forEach((e) => {
    if (e.id === selectedNode) {
      e.group = 0;
    } else if (firstUniqueIds.has(e.id)) {
      e.group = 1;
    } else {
      e.group = 2;
    }
  });

  return [newNodes, secondDegreeData];
};

export function setupEventListeners(
  slider,
  svg,
  transformedEdgeData,
  nodes,
  degreesSeperation_settingObj,
  datasetUsed
) {
  var circles = selectAll("circle");

  function handleCircleClick(_, node) {
    // The new graph will start with edges visible so the checkbox should be ticked
    document.getElementById("edges-checkbox").checked = true;

    // By default all connections are shown
    slider.value = 0;

    // Finding nodes which are directly connected to the node that was clicked on
    const selectedNode = node.id;

    var data = getSecondDegreeData(transformedEdgeData, nodes, selectedNode);
    var newNodes = data[0];
    var secondDegreeData = data[1];

    console.log(secondDegreeData);

    svg.selectAll("*").remove();

    ForceGraph(
      { nodes: newNodes, links: secondDegreeData },
      { ...degreesSeperation_settingObj, selectedNode }
    );

    datasetUsed.value = "secondDegreeData";
    datasetUsed.selectedNode = selectedNode;
  }

  /**************
  // datasetUsed = "specificData";

  // Clicking on a node shows every connection in the dataset not just strong connections
  circles.on("click", function (_, node) {
    // The new graph will start with edges visible so the checkbox should be ticked
    document.getElementById("edges-checkbox").checked = true;

    // By default all connections are shown
    slider.value = 0;

    // Finding nodes which are directly connected to the node that was clicked on
    const selectedNode = node.id;

    var data = getSecondDegreeData(transformedEdgeData, nodes, selectedNode);
    var newNodes = data[0];
    var secondDegreeData = data[1];

    svg.selectAll("*").remove();

    ForceGraph(
      { nodes: newNodes, links: secondDegreeData },
      { ...degreesSeperation_settingObj, selectedNode }
    );

    datasetUsed.value = "secondDegreeData";
    datasetUsed.selectedNode = selectedNode;

    // Highlighting the selected node
    // svg.selectAll("circle").attr("r", (d) => (d.id === selectedNode ? 11 : 8));
  });
  *****************/

  // Remove any existing event listeners
  circles.on("click", null);

  // Add the new event listener
  circles.on("click", handleCircleClick);

  console.log(datasetUsed);

  return datasetUsed;
}

export function setupData(edgeData, titles, minWeight, width, height) {
  const transformedEdgeData = Object.keys(edgeData.Source).map((key) => {
    return {
      source: edgeData.Source[key],
      target: edgeData.Target[key],
      // add the weight property if your function can handle it
      weight: edgeData.weight[key],
    };
  });

  // An attempt at reducing the number of connections
  var specificData = transformedEdgeData.filter(
    (obj) => obj.weight >= minWeight
  );

  // Randomly initialise node positions with normal distribution
  // nodeData needs entries in the form { id: 0, x: 10, y: 10 }
  const nodeData = Array.from({ length: 1923 }, (_, i) => ({
    id: i, // id used to refer to each node
    title: titles[i],
    x: Math.min(Math.max(randomNormal(0.5, 0.15)(), 0), 1) * (width - 16) + 8,
    y: Math.min(Math.max(randomNormal(0.5, 0.15)(), 0), 1) * (height - 16) + 8,
  }));

  return {
    transformedEdgeData: transformedEdgeData,
    specificData: specificData,
    nodes: nodeData,
  };
}

export function searchbar(svg, titles) {
  document.getElementById("submit-search").addEventListener("click", () => {
    var searchbar = document.getElementById("search");
    const circles = svg.selectAll("circle");

    circles.each(function () {
      if (select(this).classed("group-0")) {
        select(this).attr("r", 15).attr("fill", "#FF964F");
      } else if (select(this).classed("group-1")) {
        select(this).attr("r", 8).attr("fill", "#C3B1E1");
      } else if (select(this).classed("group-2")) {
        select(this).attr("r", 8).attr("fill", "#9DCAEB");
      } else {
        select(this).attr("r", 4).attr("fill", "#9DCAEB");
      }
    });

    // Trying to find dataset by checking if any have the search text
    let results = Object.values(titles).filter((item) =>
      item.toLowerCase().includes(searchbar.value.toLowerCase())
    );

    if (results.length === 0) {
      let options = {
        includeScore: true,
      };

      let fuse = new Fuse(Object.values(titles), options);
      results = fuse.search(searchbar.value);
      results = results.map((d) => d.item);
      results = results.slice(0, 5);
    }

    // console.log(results);

    circles.each(function () {
      var text = select(this).select("title").text();

      // Highlight datasets that match the search unless their radius is > 8 (meaning it is the selected node)
      if (
        results.includes(text) &&
        !(select(this).attr("r") > 8) &&
        searchbar.value != ""
      ) {
        select(this).attr("fill", "#FFFAA0").attr("r", 6);
      }
    });

    search.value = "";
  });
}

export const getConnectedNodes = function (transformedEdgeData, nodes) {
  // Set to store unique ids of nodes that have at least one connection
  var connectedNodeIds = new Set();

  // Go through each link and add the source and target nodes to the set
  transformedEdgeData.forEach((obj) => {
    connectedNodeIds.add(obj.source);
    connectedNodeIds.add(obj.target);
  });

  // Filter nodes array to keep only nodes that are in the set
  var connectedNodes = nodes.filter((node) => connectedNodeIds.has(node.id));

  return connectedNodes;
};
