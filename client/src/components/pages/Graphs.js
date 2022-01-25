import React, { Component, useEffect, useState, useLayoutEffect } from "react";

import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { least, selectAll, stratify } from "d3";

import NewGraphInput from "../modules/NewGraphInput.js";
import SaveLoadGraph from "../modules/SaveLoadGraph.js";
import BFS from "../modules/BFS.js";
import Dijkstra from "../modules/Dijkstra.js";
import FloydWarshall from "../modules/FloydWarshall.js";

const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
//Initialization for BFS Display
let currentNodeBFS = undefined;
let visitedNodesBFS = new Set();
let currentEdgeBFS = "";
let previousExploredBFS = new Set();
let queue = [];
let levelSets = [];

//Initialization for Dijkstra Display
let minNodesDijkstra = new Set();

let simulation;
let svg;
let vertex;
let edge;
let linkText;
let linkText2;
let nodeText;
let mousedownNode;
let dragLine;
let nodesGlobal = [];
let linksGlobal = [];
let dragStartX, dragStartY, dragStartNodeId;
let isDragLine = false;
let timeOutFunctionId;

let legend = <div></div>;

const Graphs = ({ userId, handleLogout, userName }) => {
  const [main, setRef1] = useState(React.createRef());
  let [currentSimulation, setCurrentSimulation] = useState(null);
  let [displaySimulation, setDisplaySimulation] = useState(false);
  let [WIDTH, setWidth] = useState(null);
  let [HEIGHT, setHeight] = useState(null);
  let [nodesState, setNodes] = useState([]);
  let [linksState, setLinks] = useState([]);
  const [isDirected, setDirected] = useState(0);
  const [isWeighted, setWeighted] = useState(0);
  const [isCurrentDirected, setCurrentDirected] = useState(0);
  const [isCurrentWeighted, setCurrentWeighted] = useState(0);
  let [showBFSLegend, setShowedBFS] = useState(false);
  let [BFS_STEP_State, setBFS_STEP] = useState([]);
  let [BFS_INDEX, setBFS_INDEX] = useState(-1);
  let [startNodeBFS, setStartNodeBFS] = useState("");
  let [Dijkstra_STEP_State, setDijkstra_State] = useState([]);
  let [Dijkstra_INDEX, setDijkstra_INDEX] = useState(-1);
  let [showDijkstraLegend, setShowedDijkstra] = useState(false);
  let [currentMode, setCurrentMode] = useState("cre");

  useLayoutEffect(() => {
    function updateSize() {
      let navbox = document.querySelector(".top-bar-container");
      let offsetTop; //= 220;
      offsetTop = navbox.clientHeight;
      console.log([window.innerWidth, window.innerHeight - offsetTop]);
      d3.select(main.current)
        .selectAll("svg")
        .attr("height", window.innerHeight - navbox.clientHeight)
        .attr("width", window.innerWidth);
      clearTimeout(timeOutFunctionId);
      timeOutFunctionId = setTimeout(function () {
        if (simulation) {
          simulation.force(
            "center",
            d3.forceCenter(window.innerWidth / 2, (window.innerHeight - offsetTop) / 2)
          );
        }
      }, 500);
      setHeight(window.innerHeight - navbox.clientHeight);
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    let navbox = document.querySelector(".top-bar-container");
    let offsetTop = navbox.clientHeight;
    setHeight(window.innerHeight - navbox.clientHeight);
    setWidth(window.innerWidth);
  }, [HEIGHT, WIDTH]);

  const handleResize = () => {
    d3.select(main.current)
      .selectAll("svg")
      .attr("height", window.innerHeight - navbox.clientHeight)
      .attr("width", window.innerWidth);
    let navbox = document.querySelector(".top-bar-container");
    console.log("resize");
    setHeight(window.innerHeight - navbox.clientHeight);
    setWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force(
        "center",
        d3.forceCenter(window.innerWidth / 2, (window.innerHeight - navbox.clientHeight) / 2)
      );
    }
  };

  const GraphSimulation = (nodes, links) => {
    console.log("generating graph for", nodes, links);
    setCurrentDirected(isDirected);
    setCurrentWeighted(isWeighted);
    if (displaySimulation === false) {
      const svg = d3
        .select(main.current)
        .select("svg")
        .attr("width", window.innerWidth)
        .attr(
          "height",
          window.innerHeight - document.querySelector(".top-bar-container").clientHeight
        )
        .style("background-color", "white")
        .attr("id", "svg");
    }

    setDisplaySimulation(true);
    setCurrentSimulation(simulation);

    //dcreating main svg
    svg = d3.select(main.current).select("svg");

    svg.selectAll("g").remove();

    const g = svg.append("g");

    //defining arrowheads
    let arrowheads = d3
      .select(main.current)
      .selectAll("svg")
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 14)
      .attr("refY", 0)
      .attr("markerWidth", 3)
      .attr("markerHeight", 3)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("fill", "grey")
      .attr("d", "M0,-5L10,0L0,5");

    dragLine = svg.append("path").attr("class", "dragLine hidden").attr("d", "M0,0L0,0");

    //creating forcesimulation
    simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(function (d) {
            return d.name;
          })
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-100).distanceMax(200))
      .force(
        "center",
        d3.forceCenter(
          window.innerWidth / 2,
          (window.innerHeight - document.querySelector(".top-bar-container").clientHeight) / 2
        )
      )
      .on("tick", ticked);

    edge = g
      .append("g")
      .attr("class", "gLinks")
      .attr("stroke-width", 5)
      .attr("stroke", "grey")
      .selectAll(".link");

    vertex = g.append("g").attr("class", "gNode").attr("fill", "black").selectAll(".node");

    /*  vertex.append("title").text(function (d) {
      return d.name;
    });

    vertex.append("text").text(function (d) {
      return d.name;
    });

    edge.append("text").text(function (d) {
      return d.weight;
    });

    edge.append("title").text(function (d) {
      return d.weight;
    }); */

    // TODO: Finish adding labels, see https://stackoverflow.com/questions/13364566/labels-text-on-the-nodes-of-a-d3-force-directed-graph

    update(nodes, links);
  };

  const mama = () => {
    if (nodesGlobal.length === 0) {
      GraphSimulation([...nodesGlobal, { name: 0 }], linksGlobal);
      //setNodes([...nodesGlobal, { name: 0 }]);
    } else {
      /* if (!isDragLine) {
        let svgHere = document.querySelector("#svg");
        let rect = svgHere.getBoundingClientRect();
        let currentX = event.clientX - rect.left;
        let currentY = event.clientY - rect.top;
        //nodesGlobal.push({ name: nodesGlobal.length, x: currentX, y: currentY });
        //GraphSimulation(nodesGlobal, linksGlobal)

        update(
          [...nodesGlobal, { name: nodesGlobal.length, x: currentX, y: currentY }],
          linksGlobal 
        );
      }*/
    }
  };

  //forces for dragging nodes
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function beginDragLine(d) {
    isDragLine = true;
    console.log("Start");
    dragStartNodeId = d.path[0].id;
    mousedownNode = d.path[0];
    dragStartX = mousedownNode.cx.baseVal.value;
    dragStartY = mousedownNode.cy.baseVal.value;
    dragLine
      .classed("hidden", false)
      .attr("d", "M" + dragStartX + "," + dragStartY + "L" + dragStartX + "," + dragStartY);
  }

  function updateDragLine(event) {
    let svgHere = document.querySelector("#svg");
    let rect = svgHere.getBoundingClientRect();
    let dragCurrentX = event.clientX - rect.left;
    let dragCurrentY = event.clientY - rect.top;

    if (!mousedownNode) return;

    dragLine.attr(
      "d",
      "M" + dragStartX + "," + dragStartY + "L" + dragCurrentX + "," + dragCurrentY
    );
  }

  function hideDragLine() {
    if (!isDragLine) {
      let bodyHere = document.querySelector("body");
      let rect = bodyHere.getBoundingClientRect();
      let currentX = event.clientX - rect.left;
      let currentY = event.clientY - rect.top;
      let navbox = document.querySelector(".top-bar-container");
      let offsetTop = navbox.clientHeight;
      if (nodesGlobal.length === 0) {
        GraphSimulation(
          [...nodesGlobal, { name: 0, x: currentX, y: currentY - offsetTop }],
          linksGlobal
        );
      } else {
        let svgHere = document.querySelector("#svg");
        let rect = svgHere.getBoundingClientRect();
        let currentX = event.clientX - rect.left;
        let currentY = event.clientY - rect.top;
        //nodesGlobal.push({ name: nodesGlobal.length, x: currentX, y: currentY });
        //GraphSimulation(nodesGlobal, linksGlobal)

        update(
          [...nodesGlobal, { name: nodesGlobal.length, x: currentX, y: currentY }],
          linksGlobal
        );
      }
    } else {
      let svgHere = document.querySelector("#svg");
      let rect = svgHere.getBoundingClientRect();
      let currentX = event.clientX - rect.left;
      let currentY = event.clientY - rect.top;

      let onNode = false;
      for (let i in nodesGlobal) {
        let singleNode = nodesGlobal[i];
        if (
          Math.pow(
            Math.pow(singleNode.x - currentX, 2) + Math.pow(singleNode.y - currentY, 2),
            0.5
          ) < 10
        ) {
          onNode = true;
          let dragEndNodeId = "v" + i.toString();
          var newLink = {
            source: parseInt(dragStartNodeId.substring(1)),
            target: parseInt(i), //parseInt(dragEndNodeId.substring(1)),
            weight: 1,
          };
          update([...nodesGlobal], [...linksGlobal, newLink]);
        }
      }
      dragLine.classed("hidden", true);
      setTimeout(function () {
        isDragLine = false;
      }, 100);
    }
  }

  function hideDragLine2() {
    dragLine.classed("hidden", true);
    isDragLine = false;
  }

  function update(nodes, links) {
    let navbox = document.querySelector(".top-bar-container");
    let offsetTop; //= 220;
    offsetTop = navbox.clientHeight;
    d3.select(main.current)
      .selectAll("svg")
      .attr("height", window.innerHeight - navbox.clientHeight)
      .attr("width", window.innerWidth);

    nodesGlobal = nodes;
    linksGlobal = links;
    setNodes(nodes);
    setLinks(links);
    ////console.log(nodesGlobal, linksGlobal);
    //console.log(nodes, links);

    // Apply the general update pattern to the nodes.#
    ////console.log(vertex);
    vertex = vertex.data(nodes);
    ////console.log(vertex);
    vertex.exit().remove();
    ////console.log(vertex);
    vertex = vertex
      .enter()
      .append("g")
      .attr("class", "gSingleNode")
      .append("circle")
      .attr("fill", "black")
      .attr("r", 10)
      .attr("id", function (d) {
        return "v" + d.name.toString();
      })
      .on("mousedown", function (d) {
        beginDragLine(d);
      })
      .merge(vertex);

    ////console.log(vertex)

    d3.selectAll("circle"); //.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    d3.selectAll(".gLinks").on("mousedown", function (event) {
      event.stopPropagation();
    });
    // Apply the general update pattern to the links.
    edge = edge.data(links);
    edge.exit().remove();
    edge = edge
      .enter()
      .append("g")
      .attr("class", "gSingleLine")
      .append("line")
      .attr("marker-end", "url(#arrow)")
      .attr("id", function (d) {
        if (typeof d.source === "object") {
          return "e" + d.source.name.toString() + "-" + d.target.name.toString();
        } else {
          return "e" + d.source.toString() + "-" + d.target.toString();
        }
      })
      .merge(edge);

    if (isDirected === 0) {
      d3.select(main.current).select("path").attr("opacity", 0);
    }
    d3.selectAll(".gSingleLine").selectAll("text").remove();
    d3.selectAll(".gSingleNode").selectAll("text").remove();
    // edgelabels
    /* linkText = svg
      .selectAll(".gSingleLine")
      .data(links)
      .append("circle")
      .attr("class", "gLinkText")
      .attr("r", 10)
      .style("stroke-width", "0px")
      .style("fill", "white"); */

    linkText2 = svg
      .selectAll(".gSingleLine")
      .data(links)
      .append("text")
      .text(function (d) {
        if (false) {
          return d.weight.toString();
        } else {
          return "1";
        }
      })
      .style("font-size", 16)
      .attr("stroke-width", 0);

    nodeText = svg
      .selectAll(".gSingleNode")
      .data(nodes)
      .append("text")
      .text(function (d) {
        return d.name.toString();
      })
      .style("font-size", 12)
      .style("user-select", "none")
      .attr("stroke-width", 0)
      .style("fill", "black");

    if (isWeighted === 0) {
      linkText2.attr("opacity", 0);
    }

    d3.select(main.current)
      .select("svg")
      .on("mousemove", updateDragLine)
      .on("mouseup", hideDragLine)
      .on("mouseleave", hideDragLine2);
    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.7).restart();
  }

  const addNode = () => {
    if (nodesGlobal.length === 0) {
      //nodesGlobal.push({ name: 0 });
      GraphSimulation([nodesGlobal, { name: 0 }], linksGlobal);
    } else {
      update([...nodesGlobal, { name: nodesGlobal.length }], linksGlobal);
    }
  };

  //force upon creation
  function ticked() {
    let radius = 10;
    vertex
      .attr("cx", function (d) {
        //console.log(d.x);
        return Math.max(radius, Math.min(WIDTH - radius, d.x));
      })
      .attr("cy", function (d) {
        return Math.max(radius, Math.min(HEIGHT - radius, d.y));
      });
    edge
      .attr("x1", function (d) {
        //console.log(d.source.x);
        return Math.max(radius, Math.min(WIDTH - radius, d.source.x));
      })
      .attr("y1", function (d) {
        return Math.max(radius, Math.min(HEIGHT - radius, d.source.y));
      })
      .attr("x2", function (d) {
        return Math.max(radius, Math.min(WIDTH - radius, d.target.x));
      })
      .attr("y2", function (d) {
        return Math.max(radius, Math.min(HEIGHT - radius, d.target.y));
      });
    /* linkText
      .attr("cx", function (d) {
        if (d.target.x > d.source.x) {
          return d.source.x + (d.target.x - d.source.x) / 2;
        } else {
          return d.target.x + (d.source.x - d.target.x) / 2;
        }
      })
      .attr("cy", function (d) {
        if (d.target.y > d.source.y) {
          return d.source.y + (d.target.y - d.source.y) / 2;
        } else {
          return d.target.y + (d.source.y - d.target.y) / 2;
        }
      }); */
    linkText2
      .attr("x", function (d) {
        let correctionCoeff = 0.5;
        //console.log(d);
        let name = d.weight;
        for (let char of name.toString()) {
          correctionCoeff = correctionCoeff + 3.5;
          if (char === "1") {
            correctionCoeff = correctionCoeff - 2;
          }
        }
        if (d.target.x > d.source.x) {
          return Math.max(
            radius,
            Math.min(WIDTH - radius, d.source.x + (d.target.x - d.source.x) / 2 - correctionCoeff)
          );
        } else {
          return Math.max(
            radius,
            Math.min(WIDTH - radius, d.target.x + (d.source.x - d.target.x) / 2 - correctionCoeff)
          );
        }
      })
      .attr("y", function (d) {
        if (d.target.y > d.source.y) {
          return Math.max(
            radius,
            Math.min(HEIGHT - radius, d.source.y + (d.target.y - d.source.y) / 2 + 4)
          );
        } else {
          return Math.max(
            radius,
            Math.min(HEIGHT - radius, d.target.y + (d.source.y - d.target.y) / 2 + 4)
          );
        }
      });
    nodeText
      .attr("x", function (d) {
        // console.log(d);
        //console.log(d.x);
        let correctionCoeff = 0.5 - 15;
        let name = d.name;
        for (let char of name.toString()) {
          correctionCoeff = correctionCoeff + 3.5;
          if (char === "1") {
            correctionCoeff = correctionCoeff - 2;
          }
        }
        return Math.max(radius, Math.min(WIDTH - radius, d.x - correctionCoeff));
      })
      .attr("y", function (d) {
        return Math.max(radius, Math.min(HEIGHT - radius, d.y + 4 - 15));
      });
  }

  const recolorNode = (i, color) => {
    if (i === "all") {
      d3.select(main.current).select("svg").selectAll("circle").attr("fill", color);
    } else {
      let nodeId = "#v" + i.toString();
      d3.select(main.current).select("svg").select(nodeId).attr("fill", color);
    }
  };

  const recolorNodeBorder = (i, color) => {
    if (i === "all") {
      d3.select(main.current).select("svg").selectAll("circle").attr("stroke-width", "0px");
      d3.select(main.current).select("svg").selectAll("circle").attr("stroke", color);
    } else {
      let nodeId = "#v" + i.toString();
      d3.select(main.current).select("svg").select(nodeId).attr("stroke-width", "6px");
      d3.select(main.current).select("svg").select(nodeId).attr("stroke", "black");
    }
  };
  const recolorEdge = (i, j, color) => {
    if (i === "all" || j === "all") {
      d3.select(main.current).select("svg").selectAll("line").attr("stroke", color);
    } else {
      let edgeId = "#e" + i.toString() + "-" + j.toString();
      console.log(edgeId);
      console.log(linksGlobal);
      d3.select(main.current).select("svg").select(edgeId).attr("stroke", color);
    }
  };

  const changeDirected = (int) => {
    if (isDirected === 0) {
      d3.select(main.current).select("path").attr("opacity", 1);
    } else {
      d3.select(main.current).select("path").attr("opacity", 0);
    }
    setDirected(1 - isDirected);
  };

  const changeWeighted = (int) => {
    if (isWeighted === 0) {
      d3.select(main.current)
        .selectAll("svg")
        .selectAll(".gSingleLine")
        .selectAll("text")
        .style("opacity", 1);
    } else {
      d3.select(main.current)
        .selectAll("svg")
        .selectAll(".gSingleLine")
        .selectAll("text")
        .style("opacity", 0);
    }
    setWeighted(1 - isWeighted);
  };

  const displayBFSLegend = () => {
    setShowedBFS(true);
  };

  const hideBFSLegend = () => {
    setShowedBFS(false);
  };

  const displayDijkstraLegend = () => {
    setShowedDijkstra(true);
  };

  const hideDijkstraLegend = () => {
    setShowedDijkstra(false);
  };

  const emptyBFSCounter = () => {
    visitedNodesBFS.clear();
    currentNodeBFS = undefined;
    currentEdgeBFS = "";
    previousExploredBFS = [];
    queue = "";
    levelSets = [];
  };

  const emptyDijkstraCounter = () => {
    minNodesDijkstra.clear();
  };

  function BFS_stepper(index) {
    //BFS_STEP saves every edge and target node that BFS looks at, both visited and unvisited.
    visitedNodesBFS = new Set();
    previousExploredBFS = new Set();
    console.log(index);
    recolorNode("all", "black");
    recolorEdge("all", "all", "grey");
    const source = BFS_STEP_State[index][0].source.name;
    const target = BFS_STEP_State[index][0].target.name;
    queue = BFS_STEP_State[index][3];
    const distances = BFS_STEP_State[index][4];
    let levels = [];
    for (let dist of distances) {
      if (!levels.includes(dist.toString())) {
        if (dist !== Infinity) {
          levels.push(dist.toString());
        }
      }
    }
    let table = [];

    if (levels.length > 0) {
      for (let level of levels) {
        let nodesAtLevel = [];
        for (let n = 0; n < distances.length; n++) {
          if (BFS_STEP_State[index][4][n].toString() === level) {
            nodesAtLevel.push(n);
          }
        }
        table.push("Level Set " + level + " : " + nodesAtLevel.join(", "));
      }
    }
    levelSets = Array.from(table).join(" || ");

    for (let i = 0; i <= index - 1; i++) {
      const previous = BFS_STEP_State[i][2];
      visitedNodesBFS.add(previous);
      previousExploredBFS.add(previous);
    }
    for (let prev of previousExploredBFS) {
      recolorNode(prev, "pink");
    }
    if (source === BFS_STEP_State[index][1]) {
      recolorNode(target, "pink");
      currentNodeBFS = target;
      visitedNodesBFS.add(target);
      previousExploredBFS.add(target);
      currentEdgeBFS = "From " + target.toString() + " to " + source.toString();
    } else if (target === BFS_STEP_State[index][1]) {
      currentNodeBFS = source;
      visitedNodesBFS.add(source);
      recolorNode(source, "pink");
      previousExploredBFS.add(source);
      currentEdgeBFS = "From " + source.toString() + " to " + target.toString();
    }
    recolorEdge(
      BFS_STEP_State[index][0].source.name,
      BFS_STEP_State[index][0].target.name,
      "#00c2a5"
    );
  }
  function Dijkstra_stepper(index) {
    minNodesDijkstra.add(parseInt(startNodeBFS));
    console.log("START NODE", startNodeBFS);
    console.log("DIJKSTRA STATE", Dijkstra_STEP_State);
    console.log("VISITED", minNodesDijkstra);
    for (let i = 0; i < index; i++) {
      let [target, edge, is_min] = Dijkstra_STEP_State[i];
      if (!is_min && !minNodesDijkstra.has(target)) {
        recolorNode(target, "black");
        recolorEdge(edge.source.name, edge.target.name, "grey");
      }
      if (minNodesDijkstra.has(target)) {
        console.log("in");
        recolorNode(target, "red");
        recolorEdge(edge.source.name, edge.target.name, "red");
      }
    }
    console.log("INDEX", index);
    let [target, edge, is_min] = Dijkstra_STEP_State[index];
    if (is_min) {
      minNodesDijkstra.add(target);
      recolorNode(target, "red");
      recolorEdge(edge.source.name, edge.target.name, "red");
    } else {
      recolorNode(target, "blue");
      recolorEdge(edge.source.name, edge.target.name, "blue");
    }
  }
  const nextStep = () => {
    if (showBFSLegend) {
      BFS_stepper(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, -1)));
      setBFS_INDEX(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, -1)));
    } else {
      Dijkstra_stepper(Math.min(Dijkstra_STEP_State.length - 1, Math.max(1 + Dijkstra_INDEX, 0)));
      setDijkstra_INDEX(Math.min(Dijkstra_STEP_State.length - 1, Math.max(1 + Dijkstra_INDEX, 0)));
    }
  };
  const prevStep = () => {
    if (showBFSLegend) {
      BFS_stepper(Math.min(BFS_STEP_State.length - 1, Math.max(BFS_INDEX - 1, 0)));
      setBFS_INDEX(Math.min(BFS_STEP_State.length - 1, Math.max(BFS_INDEX - 1, 0)));
    } else {
      Dijkstra_stepper(Math.min(Dijkstra_STEP_State.length - 1, Math.max(Dijkstra_INDEX - 1, 0)));
      setDijkstra_INDEX(Math.min(Dijkstra_STEP_State.length - 1, Math.max(Dijkstra_INDEX - 1, 0)));
    }
  };

  let legend = <div></div>;
  if (showBFSLegend === true || showDijkstraLegend === true) {
    legend = (
      <div className="container">
        <div className="Algorithm-legend">
          {" "}
          <table className="legend-table">
            <tr>{showBFSLegend ? <th>BFS Legend</th> : <th>Dijkstra Legend</th>}</tr>
            <tr>
              <td width="34%" />
            </tr>
            <tr>
              <td>
                <div className="aquaEdge" />
              </td>
              <td>Current Path</td>
            </tr>
            <tr>
              <td>
                <div className="pinkCircle" />
              </td>
              <td>Visited Nodes</td>
            </tr>
          </table>
          <div>
            <button onClick={prevStep} className="button u-marginButton">
              Previous Step
            </button>
            <button onClick={nextStep} className="button u-marginButton">
              Next Step
            </button>
          </div>
        </div>
        <div className="infoLegend u-flex u-flexColumn">
          <div>Start Node = {startNodeBFS}</div>
          <div>Current Node = {currentNodeBFS} </div>
          <div>Current Edge = {currentEdgeBFS}</div>
          <div>Visited Nodes = {Array.from(visitedNodesBFS).join(", ")} </div>
          <div>Queue = {queue}</div>
          <div>Table = {levelSets}</div>
        </div>
      </div>
    );
  }

  /* const hala = () => {
    console.log("barca");
  }; */

  const changeMode = () => {
    if (currentMode === "alg") {
      console.log("cre");
      //cre functions
      d3.select("#svg")
        .on("mousemove", updateDragLine)
        .on("mouseup", hideDragLine)
        .on("mouseleave", hideDragLine2);
      /* .on("click", mama); */

      d3.selectAll(".gLinks").on("mousedown", function (event) {
        event.stopPropagation();
      });

      d3.selectAll("circle").on("mousedown", function (d) {
        beginDragLine(d);
      });

      //alg functions
      d3.selectAll("circle").on("mousedown.drag", null);

      setCurrentMode("cre");
    } else {
      console.log("alg");
      d3.select("#svg").on("mousemove", null).on("mouseup", null).on("mouseleave", null);
      /* .on("click", hala); */

      d3.selectAll(".gLinks").on("mousedown", null);

      d3.selectAll("circle").on("mousedown", null);

      //alg functions
      d3.selectAll("circle").call(
        d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
      );

      setCurrentMode("alg");
    }
  };

  return (
    <div className="Graphs-pageContainer">
      <div className="top-bar-container">
        <div className="u-flex">
          <div className="Graphs-title left-side ">
            {" "}
            {userName
              ? "Welcome to Algorama, " + userName.split(" ")[0] + "!"
              : "Welcome to Algorama!"}
          </div>
          <div className="right-side">
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={handleLogout}
              onFailure={(err) => console.log(err)}
            />
          </div>
        </div>
        <div className="u-flex u-flex-alignCenter u-flex-wrap">
          <div className="Graphs-ModeSelector" onClick={changeMode}>
            <div
              className={
                currentMode === "alg"
                  ? "Graphs-ModeSelectorTextCre"
                  : "Graphs-ModeSelectorTextHidden"
              }
            >
              {currentMode === "alg" ? "Create & Load" : ""}
            </div>

            <div
              className={
                currentMode === "alg"
                  ? "Graphs-ModeSelectorTextHidden"
                  : "Graphs-ModeSelectorTextAlg"
              }
            >
              {currentMode === "alg" ? "" : "Algorithms"}
            </div>

            <div
              className={
                currentMode === "alg"
                  ? "Graphs-ModeSelectorSelectedAlg"
                  : "Graphs-ModeSelectorSelectedCre"
              }
            >
              {" "}
              {currentMode === "alg" ? "Algorithms" : "Create & Load"}
            </div>
          </div>
          {currentMode === "cre" ? (
            <>
              <div className="Graphs-topbar">
                <div className=" u-flex u-flex-wrap">
                  <NewGraphInput
                    GraphSimulation={GraphSimulation}
                    directed={isDirected}
                    changeDirected={changeDirected}
                    weighted={isWeighted}
                    changeWeighted={changeWeighted}
                    hideBFSLegend={hideBFSLegend}
                    hideDijkstraLegend={hideDijkstraLegend}
                    update={update}
                    nodes={nodesGlobal}
                    links={linksGlobal}
                  />
                </div>
              </div>
              <div className="second-bar">
                <SaveLoadGraph
                  userId={userId}
                  nodesState={nodesGlobal}
                  linksState={linksGlobal}
                  GraphSimulation={GraphSimulation}
                  isCurrentDirected={isCurrentDirected}
                  hideBFSLegend={hideBFSLegend}
                />
              </div>
            </>
          ) : (
            <>
              <div className="Graphs-text">Run a graph algorithm:</div>

              <div className="Graphs-topbar u-flex">
                <BFS
                  recolorNode={recolorNode}
                  recolorEdge={recolorEdge}
                  linksState={linksGlobal}
                  nodesState={nodesGlobal}
                  displayBFSLegend={displayBFSLegend}
                  setBFS_STEP={setBFS_STEP}
                  setBFS_INDEX={setBFS_INDEX}
                  startNodeBFS={startNodeBFS}
                  setStartNodeBFS={setStartNodeBFS}
                  emptyBFSCounter={emptyBFSCounter}
                  hideDijkstraLegend={hideDijkstraLegend}
                />
                <Dijkstra
                  recolorNode={recolorNode}
                  recolorEdge={recolorEdge}
                  linksState={linksGlobal}
                  nodesState={nodesGlobal}
                  startNode={startNodeBFS}
                  hideBFSLegend={hideBFSLegend}
                  setDijkstra_State={setDijkstra_State}
                  setDijkstra_INDEX={setDijkstra_INDEX}
                  displayDijkstraLegend={displayDijkstraLegend}
                  emptyDijkstraCounter={emptyDijkstraCounter}
                />

                <FloydWarshall
                  recolorNode={recolorNode}
                  linksState={linksGlobal}
                  nodesState={nodesGlobal}
                  startNode={startNodeBFS}
                  hideBFSLegend={hideBFSLegend}
                  hideDijkstraLegend={hideDijkstraLegend}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div id="main" className="Graphs-svgContainer" ref={main} /* width="500px" height="500px" */>
        {legend}
        <svg width={window.innerWidth} height={window.innerHeight} onClick={mama} />
        {""}
      </div>
    </div>
  );
};

export default Graphs;
