import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const NewGraphInput = (props) => {
  let [valueNodes, setValueNodes] = useState("");
  let [valueEdges, setValueEdges] = useState("");

  const handleChangeNodes = (event) => {
    setValueNodes(event.target.value);
  };

  const handleChangeEdges = (event) => {
    setValueEdges(event.target.value);
  };

  const onSubmit = () => {
    startGraph(valueNodes, valueEdges);
  };

  const startGraph = (valueNodes, valueEdges) => {
    let nodes = [];
    let links = [];
    for (let i = 0; i < parseInt(valueNodes); i++) {
      //console.log(i);
      nodes.push({ name: i /* , x: i * 100, y: 100 */ });
    }
    console.log(nodes);
    if (valueEdges.length > 0) {
      let linksArray = valueEdges.split(",");
      for (let ele of linksArray) {
        let ends = ele.split("-");
        let start = parseInt(ends[0]);
        let end = parseInt(ends[1]);
        links.push({ source: start, target: end });
      }
      console.log(links);
    }
    props.GraphSimulation(nodes, links);
  };

  return (
    <>
      <input
        type="text"
        value={valueNodes}
        onChange={handleChangeNodes}
        placeholder={"number of nodes"}
        className="InputBox"
      />
      <input
        type="text"
        value={valueEdges}
        onChange={handleChangeEdges}
        placeholder={"edges 0-1,2-0, ..."}
        className="InputBox"
      />

      <button onClick={onSubmit} className="button u-marginButton">
        Display
      </button>
    </>
  );
};

export default NewGraphInput;
