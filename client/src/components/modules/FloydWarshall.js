import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const FloydWarshall = ({ recolorNode, linksState, nodesState }) => {
  let [showFWProgress, setShowFWProgress] = useState(false);
  let [FWStepState, setFWStepState] = useState([]);
  let [FWIndex, setFWIndex] = useState(-1);
  let [startNodeFW, setStartNodeFW] = useState("");

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

  function matrixInit(nodes, links) {
    let distanceMatrix = [];
    for (let _ in nodes) {
      distanceMatrix.push([]);
    }
    for (let i in nodes) {
      for (let j in nodes) {
        if (i === j) {
          distanceMatrix[i][j] = 0;
        } else if (
          returnEdgeWeights(nodes[i].name, nodes[j].name, links) ||
          returnEdgeWeights(nodes[i].name, nodes[j].name, links) === 0
        ) {
          //   console.log("in");
          //   console.log(nodes[i], nodes[j]);
          distanceMatrix[i][j] = returnEdgeWeights(nodes[i].name, nodes[j].name, links);
        } else {
          distanceMatrix[i][j] = Infinity;
        }
      }
    }
    return distanceMatrix;
  }

  function floydwarshall() {
    let links = linksState;
    let nodes = nodesState;
    let distanceMatrix = matrixInit(nodes, links);
    // console.log(V);
    for (let k in nodes) {
      for (let i in nodes) {
        for (let j in nodes) {
          distanceMatrix[i][j] = Math.min(
            distanceMatrix[i][j],
            distanceMatrix[i][k] + distanceMatrix[k][j]
          );
        }
      }
    }
    console.log(distanceMatrix);
  }
  return (
    <button onClick={floydwarshall} className="button u-marginButton">
      Run Floyd Warshall
    </button>
  );
};

export default FloydWarshall;
