import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const Dijkstra = ({
  recolorNode,
  recolorEdge,
  linksState,
  nodesState,
  startNode,
  hideBFSLegend,
  setDijkstra_State,
  setDijkstra_INDEX,
  displayDijkstraLegend,
  emptyDijkstraCounter,
}) => {
  function dijkstra() {
    recolorNode("all", "black");
    recolorEdge("all", "all", "grey");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    hideBFSLegend();
    emptyDijkstraCounter();
    if (startNode === "") {
      alert("Please set a start node for Dijkstra.");
    } else {
      recolorNode(startNode, "red");
      displayDijkstraLegend();
      setDijkstra_INDEX(-1);
      emptyDijkstraCounter();
      let links = linksState;
      let nodes = nodesState;
      let Dijkstra_STEP = [];
      let distanceArray = [];
      let parentArray = [];
      let pqueue = [];
      for (let node of nodes) {
        if (node.name !== parseInt(startNode)) {
          distanceArray.push(Infinity);
        } else {
          distanceArray.push(0);
        }
        pqueue.push(node.name);
      }
      while (pqueue.length > 0) {
        let u = null;
        let curMin = Infinity;
        for (let node in distanceArray) {
          if (pqueue.includes(parseInt(node)) && distanceArray[node] <= curMin) {
            u = parseInt(node);
            curMin = distanceArray[node];
          }
        }
        Dijkstra_STEP.push([u, returnEdge(u, parentArray[u], links), true]);
        let uIndex = pqueue.indexOf(u);
        pqueue.splice(uIndex, 1);
        let [neighbors, currNeighborEdges] = findNeighbors({ name: u }, links);
        for (let v of neighbors) {
          Dijkstra_STEP.push([v, currNeighborEdges[neighbors.indexOf(v)], false]);
          let alt = distanceArray[u] + returnEdgeWeights(u, v, links);
          if (alt < distanceArray[v]) {
            distanceArray[v] = alt;
            parentArray[v] = u;
          }
        }
      }
      // console.log(distanceArray);
      // console.log(Dijkstra_STEP);
      Dijkstra_STEP.shift();
      setDijkstra_State(Dijkstra_STEP);
    }
  }
  function returnEdgeWeights(u, v, links) {
    for (let edge of links) {
      if (
        (edge.source.name === u && edge.target.name === v) ||
        (edge.source.name === v && edge.target.name === u)
      ) {
        return edge.weight;
      }
    }
  }
  function returnEdge(u, v, links) {
    for (let edge of links) {
      if (
        (edge.source.name === u && edge.target.name === v) ||
        (edge.source.name === v && edge.target.name === u)
      ) {
        return edge;
      }
    }
  }
  function findNeighbors(start, links) {
    let neighbors = [];
    let currNeighborEdges = [];
    for (let edge of links) {
      if (edge.source.name === start.name) {
        neighbors.push(edge.target.name);
        currNeighborEdges.push(edge);
      } else if (edge.target.name === start.name) {
        neighbors.push(edge.source.name);
        currNeighborEdges.push(edge);
      }
    }
    return [neighbors, currNeighborEdges];
  }

  return (
    <button onClick={dijkstra} className="button u-marginButton">
      Run Dijkstra
    </button>
  );
};

export default Dijkstra;
