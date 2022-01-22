import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";


const BFS = ({ recolorNode, recolorEdge, linksState, nodesState, displayLegend}) => {
  let [showBFSProgress, setShowBFSProgress] = useState(false);
  let [BFS_STEP_State, setBFS_STEP] = useState([]);
  let [BFS_INDEX, setBFS_INDEX] = useState(-1);
  let [startNodeBFS, setStartNodeBFS] = useState("");

  

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
              neighbors.push(currNeighbors[neigh]);
              BFS_STEP.push([currNeighborsEdges[neigh], currNeighbors[neigh], true]);
            }
          }
        }
        queue = neighbors;
        // console.log("queue", queue);
      }
      console.log(distanceArray);
      console.log(BFS_STEP);
      setBFS_STEP(BFS_STEP);
    }
  }



  function BFS_stepper(index) {
    //BFS_STEP saves every edge and target node that BFS looks at, both visited and unvisited.
    console.log(index);
    recolorNode("all", "black");
    recolorEdge("all", "all", "grey");
    const source = BFS_STEP_State[index][0].source.name; 
    const target = BFS_STEP_State[index][0].target.name; 
    for (let i = 0; i <= index -1; i++){
      const currStart = BFS_STEP_State[i][0].source.name;
      const currEnd = BFS_STEP_State[i][0].target.name; 
      recolorNode(currStart, "blue");
      recolorEdge(currStart, currEnd, "blue");
      recolorNode(currEnd, "blue");  
    }
    recolorNode(parseInt(startNodeBFS), "red");
    if(source === BFS_STEP_State[index][1]){
      recolorNode(target, "yellow");
    }
    else if(target === BFS_STEP_State[index][1]){
      recolorNode(source, "yellow"); 
    }
    recolorEdge(BFS_STEP_State[index][0].source.name, BFS_STEP_State[index][0].target.name, "aqua");
    if (BFS_STEP_State[index][2]) {
      recolorNode(BFS_STEP_State[index][1], "aqua");
    }
  }

  const handleStartNodeBFS = (event) => {
    setStartNodeBFS(event.target.value);
  };

  const nextStep = () => {
    BFS_stepper(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, -1)));
    setBFS_INDEX(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, -1)));
  };
  const prevStep = () => {
    BFS_stepper(Math.min(BFS_STEP_State.length - 1, Math.max(BFS_INDEX - 1, 0)));
    setBFS_INDEX(Math.min(BFS_STEP_State.length - 1, Math.max(BFS_INDEX - 1, 0)));
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

      {showBFSProgress ? (
        <div>
          <button onClick={prevStep} className="button u-marginButton">
            Previous Step
          </button>
          <button onClick={nextStep} className="button u-marginButton">
            Next Step
          </button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default BFS;
