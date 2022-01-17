import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import { stratify } from "d3";

const Graphs = ({ userId }) => {
  const [main, setRef1] = useState(React.createRef());
  let [valueNodes, setValueNodes] = useState("");
  let [valueEdges, setValueEdges] = useState("");
  let [currentSimulation, setCurrentSimulation] = useState(null);
  let [displaySimulation, setDisplaySimulation] = useState(false);
  let [WIDTH, setWidth] = useState(800);
  let [HEIGHT, setHeight] = useState(500);
  let [windowHeight, setWindowHeight] = useState(window.innerHeight);
  let [windowWidth, setWindowWidth] = useState(window.innerWidth);
  let [nodes, setNodes] = useState({ name: 0 }, { name: 1 });
  let [links, setLinks] = useState({ souce: 0, target: 1 });
  let [vertexObjs, setVertexObjs] = useState(null);
  let [edgeObjs, setEdgeObjs] = useState(null);

  useEffect(() => {
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

  const adaptSize = () => {
    /* setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force("center", d3.forceCenter(windowWidth / 2, windowHeight / 2));
    } */
  };

  const startGraph = () => {
    let nodes = [];
    let links = [];
    for (let i = 0; i < parseInt(valueNodes); i++) {
      console.log(i);
      nodes.push({ name: i });
    }
    console.log(nodes);
    if (valueEdges.length > 0) {
      let linksArray = valueEdges.split(",");
      for (let ele of linksArray) {
        let ends = ele.split("-");
        let start = parseInt(ends[0]);
        let end = parseInt(ends[1]);
        links.push({ source: start, target: end });
      }
      console.log(links);
    }
    setNodes(nodes);
    setLinks(links);
    GraphSimulation(nodes, links);
  };

  const GraphSimulation = (vertices, edges) => {
    let nodes = vertices;
    let links = edges;
    if (displaySimulation === true) {
      d3.select("svg").remove();
      setDisplaySimulation(false);
    }
    console.log(nodes);
    const svg = d3
      .select(main.current)
      .append("svg")
      .attr("height", windowHeight)
      .attr("width", windowWidth)
      .attr("viewbox", "0 0 500 800")
      .style("background-color", "white")
      .on("mousedown", addNode);

    /* let links = [
      { source: 2, target: 1, weight: 1 },
      { source: 3, target: 2, weight: 3 },
    ];

    let nodes = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }];
 */
    //let nodes = [...nodesState];

    let simulation = d3
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
      .force("charge", d3.forceManyBody().strength(-70))
      .force("center", d3.forceCenter(windowWidth / 2, windowHeight / 2))
      .on("tick", ticked);

    let edge = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 5)
      .attr("stroke", "grey");

    let vertex = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "black")
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    function addNode(event) {
      pass;
      /* let e = event;
      if (e.button == 0) {
        let coords = e.currentTarget;
        let newNode = { x: coords[0], y: coords[1], name: 10 };
        nodes.push(newNode);
        simulation.restart();
      } */
    }

    function ticked() {
      // let windowWidth = 800;
      //let windowHeight = 500;
      let radius = 10;
      vertex
        .attr("cx", function (d) {
          //console.log(d.x);
          return Math.max(radius, Math.min(windowWidth - radius, d.x));
        })
        .attr("cy", function (d) {
          return Math.max(radius, Math.min(windowHeight - radius, d.y));
        });
      edge
        .attr("x1", function (d) {
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
    }

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
    setDisplaySimulation(true);
    setCurrentSimulation(simulation);
    setEdgeObjs(edge);
    setVertexObjs(vertex);
  };

  const handleChangeNodes = (event) => {
    setValueNodes(event.target.value);
  };

  const handleChangeEdges = (event) => {
    setValueEdges(event.target.value);
  };

  function addNode() {
    let newNode = { x: 200, y: 200, name: 3 };
    setNodes([...nodes, newNode]);
    //console.log(nodes);
    restart();
  }

  const restart = () => {
    nodes = vertices.data(nodes, function (d) {
      return d.id;
    });
    vertices.exit().remove();

    vertices.selectAll("text").text(function (d) {
      return d.degree;
    });
  };

  const handleResize = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force("center", d3.forceCenter(windowWidth / 2, windowHeight / 2));
    }
  };

  return (
    <div>
      <button onClick={startGraph}> Start</button>
      <input
        type="text"
        value={valueNodes}
        onChange={handleChangeNodes}
        placeholder={"number of nodes"}
      />
      <input
        type="text"
        value={valueEdges}
        onChange={handleChangeEdges}
        placeholder={"edges 0-1,2-0, ..."}
      />
      <button onClick={addNode}> Start</button>
      <div id="main" ref={main} /* width="500px" height="500px" */>
        {" "}
      </div>
    </div>
  );
};

export default Graphs;
