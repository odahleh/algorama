import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";

const Graphs = ({ userId }) => {
  const [main, setRef1] = useState(React.createRef());
  const WIDTH = 600;
  const HEIGHT = 500;
  const data = [2, 3, 4, 1];

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

    const graph = {
      links: [
        { source: "2", target: "1", weight: 1 },
        { source: "3", target: "2", weight: 3 },
      ],

      nodes: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }],
    };

    /* links.forEach(function (link) {
      link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    }); */

    let simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(function (d) {
            return d.name;
          })
          .links(graph.links)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .on("tick", ticked);

    let link = svg
      .append("g")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke-width", 5)
      .attr("stroke", "grey");

    let node = svg
      .append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "black");

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
  });

  /* d3.json("/api/graph").then((json) => {
      console.log(json);
      //d3.force.nodes(json.nodes).links(json.links).start();

      let link = svg
        .selectAll(".link")
        .data(json.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) {
          return Math.sqrt(d.weight);
        });
      console.log("Ja");

      let node = svg.selectAll(".node").data(json.nodes).enter().append("g").attr("class", "node");
      // .call(force.drag);

      node.append("circle").attr("r", "5");

      node
        .append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
          return d.name;
        });

       force.on("tick", function () {
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

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }); 
    });
  }); */

  return (
    <div id="main" ref={main}>
      {" "}
      <div>a</div>
    </div>
  );
};

export default Graphs;