import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";

const Graphs = ({ userId }) => {
  const [main, setRef1] = useState(React.createRef());
  const WIDTH = 600;
  const HEIGHT = 500;
  const data = [2, 3, 4, 1];

  //const svg = d3.select("#svg").append("svg").attr("width", WIDTH).attr("height", HEIGHT);

  useEffect(() => {
    const accessToRef = d3
      .select(main.current)
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("background-color", "blue");
    accessToRef.style("color", "red");
    accessToRef
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("height", (d, i) => d * 50)
      .attr("width", "100px")
      .attr("x", (d, i) => i * 110)
      .attr("y", (d, i) => HEIGHT - d * 50)
      .style("background-color", "red");

    const links = [
      { source: 2, target: 1, weight: 1 },
      { source: 0, target: 2, weight: 3 },
    ];

    const nodes = [
      { name: "node1", group: 1 },
      { name: "node2", group: 2 },
      { name: "node3", group: 2 },
      { name: "node4", group: 3 },
    ];

    /* links.forEach(function (link) {
      link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    }); */

    let force = d3.forceSimulation

      .nodes(nodes)
      .links(links)
      .on("tick", tick)
      .linkDistance(300)
      .start();

    let link = svg.selectAll(".link").data(links).enter().append("line").attr("class", "link");
    let node = svg
      .selectAll(".node")
      .data(force.nodes())
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", (width = 0.03));

    function tick(e) {
      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .call(force.drag);

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
