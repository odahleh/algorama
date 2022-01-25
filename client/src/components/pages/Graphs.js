import React, { Component, useEffect, useState } from "react";

import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { least, stratify } from "d3";

import NewGraphInput from "../modules/NewGraphInput.js";
import SaveLoadGraph from "../modules/SaveLoadGraph.js";
import BFS from "../modules/BFS.js";
import Dijkstra from "../modules/Dijkstra.js";

const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
let userIDList = [];

let simulation;
let svg;
let vertex;
let edge;
let linkText;
let mousedownNode;
let dragLine;
let nodesGlobal = [];
let linksGlobal = [];
let dragStartX, dragStartY, dragStartNodeId;
let isDrag = false;

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

  useEffect(() => {
    let navbox = document.querySelector(".top-bar-container");
    let offsetTop = navbox.clientHeight;
    setHeight(window.innerHeight - navbox.clientHeight);
    setWidth(window.innerWidth);
    window.addEventListener(
      "resize",
      handleResize /* function () {
      clearTimeout(adaptSizeTimer);
      adaptSizeTimer = setTimeout(function () {
        console.log("resize");
      }, 500);
    } */
    );
  });

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
      console.log("mama2");
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
    isDrag = true;
    console.log(nodesGlobal, linksGlobal);
    console.log("Start");
    //d3.preventDefault();
    // if (d3.ctrlKey || d3.button != 0) return;
    dragStartNodeId = d.path[0].id;
    //console.log(dragStartNodeId)
    //console.log(parseInt(dragStartNodeId.substring(1)))
    /* console.log(nodeId)
    console.log(d3.select("#"+nodeId))
    console.log(d.path[0]) */
    mousedownNode = d.path[0];
    console.log(mousedownNode.cx.baseVal.value);
    dragStartX = mousedownNode.cx.baseVal.value;
    dragStartY = mousedownNode.cy.baseVal.value;

    console.log(mousedownNode, "ja");
    dragLine
      .classed("hidden", false)
      .attr("d", "M" + dragStartX + "," + dragStartY + "L" + dragStartX + "," + dragStartY);
  }

  function updateDragLine(event) {
    let svgHere = document.querySelector("#svg");
    let rect = svgHere.getBoundingClientRect();
    let dragCurrentX = event.clientX - rect.left;
    let dragCurrentY = event.clientY - rect.top;
    //console.log(x, y)

    if (!mousedownNode) return;

    dragLine.attr(
      "d",
      "M" + dragStartX + "," + dragStartY + "L" + dragCurrentX + "," + dragCurrentY
    );

    /* let coords = event.currentTarget.value
    
    console.log(svgHere, "svg")
    console.log(event.clientX)
    console.log(event.clientY) */
  }

  function hideDragLine() {
    console.log("hide");
    if (!isDrag) {
      let bodyHere = document.querySelector("body");
      let rect = bodyHere.getBoundingClientRect();
      let currentX = event.clientX - rect.left;
      let currentY = event.clientY - rect.top;
      let navbox = document.querySelector(".top-bar-container");
      let offsetTop = navbox.clientHeight;
      console.log(nodesGlobal);
      console.log(nodesGlobal);
      if (nodesGlobal.length === 0) {
        console.log("new");
        //nodesGlobal, { name: 0, x: currentX, y: currentY - offsetTop });
        GraphSimulation(
          [...nodesGlobal, { name: 0, x: currentX, y: currentY - offsetTop }],
          linksGlobal
        );
      } else {
        console.log("update");
        //console.log(nodesGlobal, linksGlobal)
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
    }
    dragLine.classed("hidden", true);
    isDrag = false;
  }

  function hideDragLine2() {
    dragLine.classed("hidden", true);
    isDrag = false;
  }

  function endDragLine(d) {
    console.log("end");
    //  if (!mousedownNode || mousedownNode === d) return;
    //return if link already exists
    let dragEndNodeId = d.path[0].id;
    var newLink = {
      source: parseInt(dragStartNodeId.substring(1)),
      target: parseInt(dragEndNodeId.substring(1)),
      weight: 1,
    };
    console.log("EDL");
    update([...nodesGlobal], [...linksGlobal, newLink]);

    /*  for (var i = 0; i < links.length; i++) {
      var l = links[i];
      if (
        (l.source === mousedownNode && l.target === d) ||
        (l.source === d && l.target === mousedownNode)
      ) {
        return;
      }
  } */
    // mousedownNode.degree++;
    //.degree++;
  }

  function update(nodes, links) {
    nodesGlobal = nodes;
    linksGlobal = links;
    setNodes(nodes);
    setLinks(links);
    //console.log(nodesGlobal, linksGlobal);
    console.log(nodes, links);

    // Apply the general update pattern to the nodes.#
    //console.log(vertex);
    vertex = vertex.data(nodes);
    //console.log(vertex);
    vertex.exit().remove();
    //console.log(vertex);
    vertex = vertex
      .enter()
      .append("circle")
      .attr("fill", "black")
      .attr("r", 10)
      .attr("id", function (d) {
        return "v" + d.name.toString();
      })
      .on("mousedown", function (d) {
        beginDragLine(d);
      })
      .on("mouseup", endDragLine)
      .merge(vertex);

    //console.log(vertex)

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
        return "e" + d.source.toString() + "-" + d.target.toString();
      })
      .merge(edge);

    if (isDirected === 0) {
      d3.select(main.current).select("path").attr("opacity", 0);
    }

    // edgelabels
    linkText = svg
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

    if (isWeighted === 0) {
      linkText.attr("opacity", 0);
    }

    d3.select(main.current)
      .select("svg")
      .on("mousemove", updateDragLine)
      .on("mouseup", hideDragLine)
      .on("mouseleave", hideDragLine2);
    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
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
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
    linkText
      .attr("x", function (d) {
        if (d.target.x > d.source.x) {
          return d.source.x + (d.target.x - d.source.x) / 2;
        } else {
          return d.target.x + (d.source.x - d.target.x) / 2;
        }
      })
      .attr("y", function (d) {
        if (d.target.y > d.source.y) {
          return d.source.y + (d.target.y - d.source.y) / 2;
        } else {
          return d.target.y + (d.source.y - d.target.y) / 2;
        }
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

  const recolorEdge = (i, j, color) => {
    if (i === "all" || j === "all") {
      d3.select(main.current).select("svg").selectAll("line").attr("stroke", color);
    }
    let edgeId = "#e" + i.toString() + "-" + j.toString();
    d3.select(main.current).select("svg").select(edgeId).attr("stroke", color);
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

  let redirect = <div></div>;
  if (userId === undefined) {
    console.log(userIDList);
    userIDList.push(userId);
    //console.log(userIDList);
    if (userIDList.length > 2 && userIDList[-1] === undefined) {
      redirect = <meta http-equiv="refresh" content="0; url = '/'" />;
      console.log("redirect");
      //userIDList = [];
    }
  }

  return (
    <div className="Graphs-pageContainer">
      {/*redirect*/}
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
        <div className="Graphs-ModeSelector">
          <div>Edit</div>
          <div>Load and Save</div>
          <div>Algorithms</div>
        </div>
        <div className="Graphs-text">Create a new graph or run an algorithm</div>
        <div className="Graphs-topbar">
          <div className=" u-flex u-flex-wrap">
            <NewGraphInput
              GraphSimulation={GraphSimulation}
              directed={isDirected}
              changeDirected={changeDirected}
              weighted={isWeighted}
              changeWeighted={changeWeighted}
            />
            <button className="button" onClick={addNode}>
              Add Node
            </button>
            <BFS
              recolorNode={recolorNode}
              recolorEdge={recolorEdge}
              linksState={linksGlobal}
              nodesState={nodesGlobal}
            />
            <Dijkstra recolorNode={recolorNode} linksState={linksGlobal} nodesState={nodesGlobal} />
          </div>
        </div>
        <div className="Graphs-text">Save and load your graphs</div>
        <div className="second-bar">
          <SaveLoadGraph
            userId={userId}
            nodesState={nodesGlobal}
            linksState={linksGlobal}
            GraphSimulation={GraphSimulation}
            isCurrentDirected={isCurrentDirected}
            isCurrentWeighted={isCurrentWeighted}
          />
        </div>
      </div>
      <div id="main" className="Graphs-svgContainer" ref={main} /* width="500px" height="500px" */>
        <svg width={window.innerWidth} height={window.innerHeight} onClick={mama} />
      </div>
    </div>
  );
};

export default Graphs;
