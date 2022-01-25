import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const NewGraphInput = (props) => {
  let [valueNodes, setValueNodes] = useState("");
  let [valueEdges, setValueEdges] = useState("");

  const [directed, setDirected] = useState(0);

  const handleChangeNodes = (event) => {
    setValueNodes(event.target.value);
  };

  const handleChangeEdges = (event) => {
    setValueEdges(event.target.value);
  };

  const onSubmit = () => {
    startGraph(valueNodes, valueEdges);
  };

  const handleSliderChange = () => {
    setDirected(1 - directed);
  };


  const startGraph = (valueNodes, valueEdges) => {
    let nodes = [];
    let links = [];
    for (let i = 0; i < parseInt(valueNodes); i++) {
      //console.log(i);
      nodes.push({ name: i, id: i /* , x: i * 100, y: 100 */ });
    }
    console.log(nodes);
    if (valueEdges.length > 0) {
      let linksArray = valueEdges.split(",");
      for (let ele of linksArray) {
        let ends = ele.split("-");
        let start = parseInt(ends[0]);
        //let end = parseInt(ends[1]);
        let end = parseInt(ends[1].split("/")[0]);
        if (ends[1].split("/").length > 1) {
          let weight = ends[1].split("/")[1];
          links.push({ source: start, target: end, weight: parseInt(weight) });
        } else {
          links.push({ source: start, target: end, weight: 1 });
        }
      }
      console.log(links);
    }
    props.hideLegend(); 
    props.GraphSimulation(nodes, links, directed);
  };

  return (
    <div className="u-flex">
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
      <div className="Graph-names u-flex u-flex-alignCenter">
        <input
          type="range"
          min="0"
          max="1"
          value={props.weighted}
          //onChange={props.changeWeighted}
          onClick={props.changeWeighted}
          className="Graphs-switch"
        />
        <div className="Graphs-textInside">weighted</div>
      </div>
      <div className="Graph-names u-flex u-flex-alignCenter">
        <input
          type="range"
          min="0"
          max="1"
          value={props.directed}
          //onChange={props.changeDirected}
          onClick={props.changeDirected}
          className="Graphs-switch"
        />
        <div className="Graphs-textInside">directed</div>
      </div>
      <button onClick={onSubmit} className="button u-marginButton">
        Display
      </button>
    </div>
  );
};

export default NewGraphInput;
