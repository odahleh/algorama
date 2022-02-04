import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";
import BFS from "./BFS";
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
  isWeighted,
  isDirected,
}) => {
  function run_bfs() {
    let start = { name: parseInt(startNode) };
    let links = linksState;
    let nodes = nodesState;
    let visited = new Set();
    let distanceArrayBFS = [];
    for (let node in nodes) {
      if (node !== start.name) {
        distanceArrayBFS.push(Infinity);
      } else {
        distanceArrayBFS.push(0);
      }
    }
    let queue = [parseInt(startNode)];
    let level = 0;
    while (queue.length > 0) {
      let neighbors = [];
      for (let next of queue) {
        if (!visited.has(next)) {
          visited.add(next);
          distanceArrayBFS[next] = level;
        }
      }
      level += 1;
      for (let next of queue) {
        // console.log("NEXT", next);
        let [currNeighbors, currNeighborsEdges] = findNeighbors({ name: parseInt(next) }, links);
        // console.log(currNeighbors);
        for (let neigh in currNeighbors) {
          // console.log("NEIGH");
          if (!visited.has(currNeighbors[neigh])) {
            if (!neighbors.includes(currNeighbors[neigh])) {
              neighbors.push(currNeighbors[neigh]);
            }
            //BFS_STEP.push([currNeighborsEdges[neigh], currNeighbors[neigh], next]);
          }
        }
      }

      queue = neighbors;
      // console.log("queue", queue);
    }
    return distanceArrayBFS;
  }
  function dijkstra() {
    recolorNode("all", "black");
    recolorEdge("all", "all", "grey");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    hideBFSLegend();
    emptyDijkstraCounter();
    if (startNode === "") {
      alert("Please set a start node for Dijkstra.");
    } else if (isNaN(startNode)) {
      alert("This is not a valid input. Please input a valid node.");
    } else if (parseInt(startNode) >= nodesState.length || parseInt(startNode) < 0) {
      alert("This is not a valid starting node. Please select a valid starting node.");
    } else {
      let negativeWeights = false;
      for (let edge of linksState) {
        if (edge.weight < 0) {
          alert(
            "This Algorithm does not support negative weights, please choose a different graph."
          );
          negativeWeights = true;
        }
      }
      if (!negativeWeights) {
        displayDijkstraLegend();
        setDijkstra_INDEX(-1);
        emptyDijkstraCounter();
        let distanceBFS = run_bfs();
        let links = linksState;
        let nodes = nodesState;
        let Dijkstra_STEP = [];
        let distanceArray = [];
        let parentArray = [];
        let pqueue = [];
        let start = parseInt(startNode);
        for (let node of nodes) {
          if (node.name !== parseInt(startNode)) {
            distanceArray.push(Infinity);
          } else {
            distanceArray.push(0);
          }
          if (distanceBFS[node.name] !== Infinity) {
            pqueue.push(node.name);
          }
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
          Dijkstra_STEP.push([
            u,
            returnEdge(parentArray[u], u, links),
            true,
            Array.from(distanceArray),
            Array.from(pqueue),
            start,
          ]);
          let uIndex = pqueue.indexOf(u);
          pqueue.splice(uIndex, 1);
          let [neighbors, currNeighborEdges] = findNeighbors({ name: u }, links);
          for (let v of neighbors) {
            Dijkstra_STEP.push([
              v,
              currNeighborEdges[neighbors.indexOf(v)],
              false,
              Array.from(distanceArray),
              Array.from(pqueue),
              start,
            ]);
            let alt = distanceArray[u] + returnEdgeWeights(u, v, links);
            if (alt < distanceArray[v]) {
              distanceArray[v] = alt;
              parentArray[v] = u;
            }
          }
        }
        //console.log(distanceArray);
        // console.log(Dijkstra_STEP);
        Dijkstra_STEP.shift();
        setDijkstra_State(Dijkstra_STEP);
      }
    }
  }
  function returnEdgeWeights(u, v, links) {
    for (let edge of links) {
      if (isWeighted === 1) {
        if (
          (edge.source.name === u && edge.target.name === v) ||
          (edge.source.name === v && edge.target.name === u)
        ) {
          return edge.weight;
        }
      } else {
        return 1;
      }
    }
  }
  function returnEdge(u, v, links) {
    for (let edge of links) {
      if (isDirected === 1) {
        if (edge.source.name === u && edge.target.name === v) {
          return edge;
        }
      } else {
        if (
          (edge.source.name === u && edge.target.name === v) ||
          (edge.source.name === v && edge.target.name === u)
        ) {
          return edge;
        }
      }
    }
  }
  function findNeighbors(start, links) {
    let neighbors = [];
    let currNeighborEdges = [];
    for (let edge of links) {
      if (isDirected === 1) {
        if (edge.source.name === start.name) {
          neighbors.push(edge.target.name);
          currNeighborEdges.push(edge);
        }
      } else {
        if (edge.source.name === start.name) {
          neighbors.push(edge.target.name);
          currNeighborEdges.push(edge);
        } else if (edge.target.name === start.name) {
          neighbors.push(edge.source.name);
          currNeighborEdges.push(edge);
        }
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
