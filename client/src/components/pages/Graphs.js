import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import { stratify } from "d3";

const Graphs = ({ userId }) => {
  const [main, setRef1] = useState(React.createRef());
  //let [nodes, setNodes] = useState([{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }]);
  const WIDTH = 600;
  const HEIGHT = 500;

  /* const svg = d3
    .select("#svg")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .style("background-color", "red"); */
  //  const width = svg.attr("width");
  //const height = svg.attr("height");

  useEffect(() => {
    console.log(nodes);
    const svg = d3
      .select(main.current)
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("background-color", "white")
      .on("mousedown", addNode);

    let links = [
      { source: 2, target: 1, weight: 1 },
      { source: 3, target: 2, weight: 3 },
    ];

    let nodes = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }];

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
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .on("tick", ticked);

    let link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 5)
      .attr("stroke", "grey");

    let node = svg
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
      let e = event;
      if (e.button == 0) {
        let coords = e.currentTarget;
        let newNode = { x: coords[0], y: coords[1], name: 10 };
        nodes.push(newNode);
        simulation.restart();
      }
    }

    function ticked() {
      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
      link
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
  });

  return (
    <div>
      <button>Lösche Nodes</button>
      <svg id="main" ref={main}>
        {" "}
      </svg>
    </div>
  );
};

export default Graphs;
