import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const BFS = ({ recolorNode, linksState, nodesState }) => {
  let [showBFSProgress, setShowBFSProgress] = useState(false);
  let [BFS_STEP_State, setBFS_STEP] = useState([]);
  let [BFS_INDEX, setBFS_INDEX] = useState(0);
  let [startNodeBFS, setStartNodeBFS] = useState("");

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
  function BFS() {
    setBFS_INDEX(0);
    recolorNode("all", "black");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    if (startNodeBFS === "") {
      alert("Please set a start node for BFS.");
    } else {
      recolorNode(startNodeBFS, "red");
      let start = { name: parseInt(startNodeBFS) };
      setShowBFSProgress(true);
      let links = linksState;
      let nodes = nodesState;
      console.log(links);
      console.log(nodes);
      let visited = new Set();
      visited.add(start.name);
      let distanceArray = [];
      let BFS_STEP = [];
      for (let node in nodes) {
        distanceArray.push(0);
      }
      let queue = [];
      let neighbors = findNeighbors(start, links);
      queue = Array.from(neighbors);
      let level = 1;
      while (queue.length > 0) {
        BFS_STEP.push([...distanceArray]);
        console.log(distanceArray);
        neighbors = [];

        for (let next of queue) {
          if (!visited.has(next)) {
            visited.add(next);
            console.log(next, "node");
            distanceArray[next] = level;
          }
        }
        level += 1;
        for (let next of queue) {
          let currNeighbors = findNeighbors({ name: next }, links);
          for (let neigh of currNeighbors) {
            if (!visited.has(neigh)) {
              neighbors.push(neigh);
            }
          }
        }
        queue = neighbors;
      }
      BFS_STEP.push([...distanceArray]);
      console.log(distanceArray);
      setBFS_STEP(BFS_STEP);
    }
  }

  function BFS_stepper(index) {
    recolorNode("all", "black");
    recolorNode(startNodeBFS, "red");
    console.log(BFS_STEP_State);
    console.log(index);
    for (let node in BFS_STEP_State[index]) {
      // if value of node has changed
      if (BFS_STEP_State[index - 1][node] !== BFS_STEP_State[index][node]) {
        recolorNode(node, "green");
        console.log(node);
      }
    }
  }

  const handleStartNodeBFS = (event) => {
    setStartNodeBFS(event.target.value);
  };

  const nextStep = () => {
    BFS_stepper(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, 0)));
    setBFS_INDEX(Math.min(BFS_STEP_State.length - 1, Math.max(1 + BFS_INDEX, 0)));
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
