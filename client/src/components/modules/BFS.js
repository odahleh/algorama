import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";


const BFS = ({ recolorNode, recolorEdge, linksState, nodesState, displayLegend, setBFS_STEP, setBFS_INDEX, startNodeBFS, setStartNodeBFS}) => {
  let [showBFSProgress, setShowBFSProgress] = useState(false);

  

  function findNeighbors(start, links) {
    let neighbors = [];
    let neighborsEdges = [];
    // console.log("links", links);
    for (let edge of links) {
      if (edge.source.name === start.name) {
        neighbors.push(edge.target.name);
        neighborsEdges.push(edge);
      } else if (edge.target.name === start.name) {
        neighbors.push(edge.source.name);
        neighborsEdges.push(edge);
      }
    }
    // console.log(neighbors);
    return [neighbors, neighborsEdges];
  }
  function BFS() {

    recolorNode("all", "black");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    if (startNodeBFS === "") {
      alert("Please set a start node for BFS.");
    } else {
      displayLegend(); 
      recolorNode(startNodeBFS, "red");
      setBFS_INDEX(-1);
      let start = { name: parseInt(startNodeBFS) };
      setShowBFSProgress(true);
      let links = linksState;
      let nodes = nodesState;
      let visited = new Set();
      let distanceArray = [];
      let BFS_STEP = [];
      for (let node in nodes) {
        distanceArray.push(0);
      }
      let queue = [parseInt(startNodeBFS)];
      let level = 0;
      while (queue.length > 0) {
        let neighbors = [];
        console.log(queue, "queue");
        for (let next of queue) {
          if (!visited.has(next)) {
            visited.add(next);
            distanceArray[next] = level;
          }
        }
        level += 1;
        for (let next of queue) {
          // console.log("NEXT", next);
          let [currNeighbors, currNeighborsEdges] = findNeighbors({ name: parseInt(next) }, links);
          // console.log(currNeighbors);
          for (let neigh in currNeighbors) {
            // console.log("NEIGH");
            if (visited.has(currNeighbors[neigh])) {
              BFS_STEP.push([currNeighborsEdges[neigh], currNeighbors[neigh], false]);
            } else {
              if (!neighbors.includes(currNeighbors[neigh])){
                neighbors.push(currNeighbors[neigh]);
              }
              BFS_STEP.push([currNeighborsEdges[neigh], currNeighbors[neigh], true]);
            }
          }
        }
        console.log(neighbors, "neighbors");
        queue = neighbors;
        // console.log("queue", queue);
      }
      console.log(distanceArray);
      console.log(BFS_STEP);
      setBFS_STEP(BFS_STEP);
    }
  }




  const handleStartNodeBFS = (event) => {
    setStartNodeBFS(event.target.value);
  };


  return (
    <div>
      <input
        type="text"
        value={startNodeBFS}
        onChange={handleStartNodeBFS}
        placeholder={"BFS start node"}
        className="InputBox"
      />
      <button onClick={BFS} className="button u-marginButton">
        Run BFS
      </button>
    </div>
  );
};

export default BFS;
