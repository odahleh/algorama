import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";

const Graphs = ({ userId }) => {
  const [main, setRef1] = useState(React.createRef());
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
    const svg = d3
      .select(main.current)
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("background-color", "white");

    let links = [
      { source: "2", target: "1", weight: 1 },
      { source: "3", target: "2", weight: 3 },
    ];

    let nodes = [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }];

    /* links.forEach(function (link) {
      link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    }); */

    let simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(function (d) {
            return d.name;
          })
          .links(links)
      )
      .force("charge", d3.forceManyBody())
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
    <div id="main" ref={main}>
      {" "}
      <div>a</div>
    </div>
  );
};

export default Graphs;
