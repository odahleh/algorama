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
  let [nodes, setNodes] = useState([{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]);
  let [links, setLinks] = useState([
    { source: 2, target: 1, weight: 1 },
    { source: 3, target: 2, weight: 3 },
  ]);
  let [vertexObjs, setVertexObjs] = useState(null);
  let [edgeObjs, setEdgeObjs] = useState(null);
  let [currentSvg, setCurrentSvg] = useState(null);

  useEffect(() => {
    setHeight(window.innerHeight);
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
      nodes.push({ name: i /* , x: i * 100, y: 100 */ });
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
      d3.selectAll("svg").remove();
      d3.select(main.current).append("svg").attr("width", WIDTH).attr("height", HEIGHT);
      setDisplaySimulation(false);
    }
    const svg = d3.select("svg").style("background-color", "white").on("mousedown", addNode);

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
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .on("tick", ticked);

    let edge = svg
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 5)
      .attr("stroke", "grey");

    /* let vertex = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "black"); */
    //.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    //vertex.attr("fill", "red");
    /* vertex.on("mouseover", function (d) {
      d3.select(this).attr("r", 30);
    }); */

    const addNode = (vertex, simulation, ticked, new_nodes) => {
      vertex = d3
        .select("svg")
        .selectAll("circle")
        .data(new_nodes)
        .enter()
        .append("circle")
        .merge(vertex)
        .attr("r", 10);
      simulation.nodes(new_nodes).on("tick", ticked);
    };

    nodes = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }];

    let vertex = d3
      .select("svg")
      .selectAll("circles")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "green");

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    let new_nodes = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }, { name: 5 }];

    /* vertex = d3
      .select("svg")
      .selectAll("circle")
      .data(new_nodes)
      .enter()
      .append("circle")
      .merge(vertex)
      .attr("r", 10);
    simulation.nodes(new_nodes).on("tick", ticked); */
    addNode(vertex, simulation, ticked, new_nodes);

    function ticked() {
      // let WIDTH = 800;
      //let HEIGHT = 500;
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

  const addNode = () => {
    pass;
  };

  const restart = () => {
    let vertices = vertexObjs.data("nodes", function (d) {
      return d.name;
    });
    console.log(vertices);
    vertices.exit().remove();

    /* let vertex = vertexObjs;
    console.log(nodes);
    vertex = vertex.data(nodes, function (d) {
      return d.name;
    });
    vertex.attr("color", "red"); */
    //vertex.exit().remove();
    /* vertex.selectAll("text").text(function (d) {
      return d.degree;
    }); */
    let vertex = vertices
      .enter()
      .append("g")
      .selectAll("circle")
      //.data(nodes)
      .append("circle")
      .attr("r", 20)
      .style("fill", "blue");

    vertices = vertex.merge(vertices);

    currentSimulation.nodes(nodes);
    currentSimulation.alpha(0.8).restart();
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
        <svg width={WIDTH} height={HEIGHT} />
      </div>
    </div>
  );
};

export default Graphs;
