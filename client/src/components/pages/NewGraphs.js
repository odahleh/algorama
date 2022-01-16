import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";

const NewGraphs = ({ userId }) => {
  useEffect(() => {
    var nodes = [{ id: 1 }, { id: 2 }, { id: 3 }];

    var links = [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 1, target: 2 },
    ];

    //universal width and height let index.htm control svg dimensions when needed
    var lastNodeId = nodes.length;
    var w = univSvgWidth ? univSvgWidth : 616,
      h = univSvgHeight ? univSvgHeight : 400,
      rad = 10;

    var svg = d3.select("#svg-wrap").append("svg").attr("width", w).attr("height", h);

    var dragLine = svg.append("path").attr("class", "dragLine hidden").attr("d", "M0,0L0,0");

    var edges = svg.append("g").selectAll(".edge");

    var vertices = svg.append("g").selectAll(".vertex");

    var force = d3
      .forceSimulation()
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength(-300)
          .distanceMax(w / 2)
      )
      .force("link", d3.forceLink().distance(60))
      .force("x", d3.forceX(w / 2))
      .force("y", d3.forceY(h / 2))
      .on("tick", tick);

    force.nodes(nodes);
    force.force("link").links(links);

    var colors = d3.schemeCategory10;

    var mousedownNode = null;

    var clrBtn = d3.select("#clear-graph");
    clrBtn.on("click", clearGraph);

    //empties the graph
    function clearGraph() {
      nodes.splice(0);
      links.splice(0);
      lastNodeId = 0;
      restart();
    }

    //update the simulation
    function tick() {
      edges
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

      vertices
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    }

    function addNode(e) {
      if (e.button == 0) {
        var coords = d3.pointer(e.currentTarget);
        var newNode = { x: coords[0], y: coords[1], id: ++lastNodeId };
        nodes.push(newNode);
        restart();
      }
    }

    function removeNode(e, d, i) {
      //to make ctrl-drag works for mac/osx users
      if (e.ctrlKey) return;
      nodes.splice(nodes.indexOf(d), 1);
      var linksToRemove = links.filter(function (l) {
        return l.source === d || l.target === d;
      });
      linksToRemove.map(function (l) {
        links.splice(links.indexOf(l), 1);
      });
      e.preventDefault();
      restart();
    }

    function removeEdge(e, d, i) {
      links.splice(links.indexOf(d), 1);
      e.preventDefault();
      restart();
    }

    function beginDragLine(e, d) {
      //to prevent call of addNode through svg
      e.stopPropagation();
      //to prevent dragging of svg in firefox
      e.preventDefault();
      if (e.ctrlKey || e.button != 0) return;
      mousedownNode = d;
      dragLine
        .classed("hidden", false)
        .attr(
          "d",
          "M" +
            mousedownNode.x +
            "," +
            mousedownNode.y +
            "L" +
            mousedownNode.x +
            "," +
            mousedownNode.y
        );
    }

    function updateDragLine() {
      var coords = d3.pointer(e.currentTarget);
      if (!mousedownNode) return;
      dragLine.attr(
        "d",
        "M" + mousedownNode.x + "," + mousedownNode.y + "L" + coords[0] + "," + coords[1]
      );
    }

    function hideDragLine() {
      dragLine.classed("hidden", true);
      mousedownNode = null;
      restart();
    }

    //no need to call hideDragLine() and restart() in endDragLine
    //mouseup on vertices propagates to svg which calls hideDragLine
    function endDragLine(e, d) {
      if (!mousedownNode || mousedownNode === d) return;
      //return if link already exists
      for (let i = 0; i < links.length; i++) {
        var l = links[i];
        if (
          (l.source === mousedownNode && l.target === d) ||
          (l.source === d && l.target === mousedownNode)
        ) {
          return;
        }
      }
      var newLink = { source: mousedownNode, target: d };
      links.push(newLink);
    }

    //one response per ctrl keydown
    var lastKeyDown = -1;

    function keydown() {
      e.preventDefault();
      if (lastKeyDown !== -1) return;
      lastKeyDown = e.key;

      if (lastKeyDown === "Control") {
        vertices.call(
          d3
            .drag()
            .on("start", function dragstarted(e, d) {
              if (!e.active) force.alphaTarget(1).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", function (d) {
              d.fx = e.x;
              d.fy = e.y;
            })
            .on("end", function (e, d) {
              if (!e.active) force.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        );
      }
    }

    function keyup(e) {
      lastKeyDown = -1;
      if (e.key === "Control") {
        vertices.on("mousedown.drag", null);
      }
    }

    //updates the graph by updating links, nodes and binding them with DOM
    //interface is defined through several events
    function restart() {
      edges = edges.data(links, function (d) {
        return "v" + d.source.id + "-v" + d.target.id;
      });
      edges.exit().remove();

      var ed = edges
        .enter()
        .append("line")
        .attr("class", "edge")
        .on("mousedown", function (e) {
          e.stopPropagation();
        })
        .on("contextmenu", removeEdge);

      ed.append("title").text(function (d) {
        return "v" + d.source.id + "-v" + d.target.id;
      });

      edges = ed.merge(edges);

      //vertices are known by id
      vertices = vertices.data(nodes, function (d) {
        return d.id;
      });
      vertices.exit().remove();

      var ve = vertices
        .enter()
        .append("circle")
        .attr("r", rad)
        .attr("class", "vertex")
        .style("fill", function (d, i) {
          return colors[d.id % 10];
        })
        .on("mousedown", beginDragLine)
        .on("mouseup", endDragLine)
        .on("contextmenu", removeNode);

      ve.append("title").text(function (d) {
        return "v" + d.id;
      });

      vertices = ve.merge(vertices);

      force.nodes(nodes);
      force.force("link").links(links);
      force.alpha(0.8).restart();
    }

    //further interface
    svg
      .on("mousedown", addNode)
      .on("mousemove", updateDragLine)
      .on("mouseup", hideDragLine)
      .on("contextmenu", function (e) {
        e.preventDefault();
      })
      .on("mouseleave", hideDragLine);

    d3.select(window).on("keydown", keydown).on("keyup", keyup);

    restart();
  });

  return (
    <div id="main" ref={main}>
      {" "}
      <div>a</div>
    </div>
  );
};

export default NewGraphs;
