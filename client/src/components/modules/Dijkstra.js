import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const Dijkstra = ({ recolorNode, linksState, nodesState }) => {
  function dijkstra() {
    let startNode = 0;
    let links = linksState;
    let nodes = nodesState;
    let distanceArray = [0]; //MODIFY FOR DIFFERENT STARTING NODE
    let parentArray = [];
    let pqueue = [];
    for (let node of nodes) {
      if (node.name !== startNode) {
        distanceArray.push(Infinity);
      }
      pqueue.push(node.name);
    }
    let counter = 0;
    while (pqueue.length > 0 && counter <= 200) {
      let u = null;
      let curMin = Infinity;
      for (let node in distanceArray) {
        if (pqueue.includes(parseInt(node)) && distanceArray[node] <= curMin) {
          u = parseInt(node);
          curMin = distanceArray[node];
        }
      }
      let uIndex = pqueue.indexOf(u);
      pqueue.splice(uIndex, 1);
      let neighbors = findNeighbors({ name: u }, links);
      for (let v of neighbors) {
        let alt = distanceArray[u] + returnEdgeWeights(u, v, links);
        if (alt < distanceArray[v]) {
          distanceArray[v] = alt;
          parentArray[v] = u;
        }
      }
    }
    console.log(distanceArray);
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

  function findNeighbors(start, links) {
    let neighbors = new Set();
    for (let edge of links) {
      if (edge.source.name === start.name) {
        neighbors.add(edge.target.name);
      } else if (edge.target.name === start.name) {
        neighbors.add(edge.source.name);
      }
    }
    return neighbors;
  }

  return (
    <button onClick={dijkstra} className="button u-marginButton">
      Run Dijkstra
    </button>
  );
};

export default Dijkstra;
