import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const Dijkstra = ({ recolorNode, recolorEdge, linksState, nodesState, startNode, hideLegend, setDijkstra_State, setDijkstra_INDEX, displayDijkstra}) => {
  function dijkstra() {
    recolorNode("all", "black");
    recolorEdge("all", "all", "grey");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    hideLegend();
    if (startNode === "") {
      alert("Please set a start node for Dijkstra.");
    }
    else{
      recolorNode(startNode, "red");
      displayDijkstra(); 
      setDijkstra_INDEX(-1);
      let links = linksState;
      let nodes = nodesState;
      let Dijkstra_STEP =[]; 
      //MODIFY FOR DIFFERENT STARTING NODE
      let distanceArray = [0]; //MODIFY FOR DIFFERENT STARTING NODE
      let parentArray = [];
      let pqueue = [];
      for (let node of nodes) {
        if (node.name !== parseInt(startNode)) {
          distanceArray.push(Infinity);
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
        Dijkstra_STEP.push([u, true]);
        let uIndex = pqueue.indexOf(u);
        pqueue.splice(uIndex, 1);
        let neighbors = findNeighbors({ name: u }, links);
        for (let v of neighbors) {
          Dijkstra_STEP.push([v, false]);
          let alt = distanceArray[u] + returnEdgeWeights(u, v, links);
          if (alt < distanceArray[v]) {
            distanceArray[v] = alt;
            parentArray[v] = u;
          }
        }
      }
      console.log(distanceArray);
      console.log(Dijkstra_STEP);
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
