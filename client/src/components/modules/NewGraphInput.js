import { range } from "d3";
import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const NewGraphInput = (props) => {
  let [valueNodes, setValueNodes] = useState("1");
  let [valueEdges, setValueEdges] = useState("");
  let [valueEdges2, setValueEdges2] = useState("");
  let [valueWeight, setValueWeight] = useState("1");

  const [directed, setDirected] = useState(0);

  const handleChangeNodes = (event) => {
    setValueNodes(event.target.value);
  };

  const handleChangeEdges = (event) => {
    setValueEdges(event.target.value);
  };

  const handleChangeEdges2 = (event) => {
    setValueEdges2(event.target.value);
  };

  const handleChangeWeight = (event) => {
    setValueWeight(event.target.value);
  };

  const onSubmit = () => {
    props.GraphSimulation([], []);
    props.hideBFSLegend();
    props.hideDijkstraLegend();
    //startGraph(valueNodes, valueEdges);
  };

  const handleSliderChange = () => {
    setDirected(1 - directed);
  };

  const addNode = () => {
    props.hideBFSLegend();
    props.hideDijkstraLegend();
    /*  if (valueNodes === "") {
      console.log("zero");
      if (props.nodes.length === 0) {
        props.GraphSimulation([{ name: props.nodes.length }], props.links);
      } else {
        props.update([...props.nodes, { name: props.nodes.length }], props.links);
      }
    } else  */ if (isNaN(valueNodes)) {
      alert("Invalid input. Please put a number.");
    } else if (parseInt(valueNodes) > 100) {
      alert("Invalid input. You can't add more than 100 nodes at a time.");
    } else {
      let currentNodes = [...props.nodes];
      let newNodes = [];
      let factor = (2 * Math.PI) / valueNodes;
      let radiusHere = 100;
      for (let i in range(parseInt(valueNodes))) {
        /* console.log(i); */
        currentNodes.push({
          name: props.nodes.length + parseInt(i),
          x: props.width / 2 + radiusHere * Math.sin(factor * i),
          y: props.height / 2 + radiusHere * Math.cos(factor * i),
        });
      }
      if (props.nodes.length === 0) {
        props.GraphSimulation(currentNodes, props.links);
      } else {
        props.update(currentNodes, props.links);
      }
    }
  };

  const addEdge = () => {
    props.hideBFSLegend();
    props.hideDijkstraLegend();
    if (
      isNaN(valueEdges) ||
      valueEdges.trim() === "" ||
      isNaN(valueEdges2) ||
      valueEdges2.trim() === "" ||
      isNaN(valueWeight)
    ) {
      alert("Invalid input. Please put the nodes' numbers.");
    } else if (
      parseInt(valueEdges) >= props.nodes.length ||
      parseInt(valueEdges2) >= props.nodes.length
    ) {
      alert("Invalid input. One or both of those nodes don't exist.");
    } else {
      if (valueWeight.trim() === "") {
        props.update(props.nodes, [
          ...props.links,
          {
            source: parseInt(valueEdges),
            target: parseInt(valueEdges2),
            weight: 1,
          },
        ]);
      } else {
        props.update(props.nodes, [
          ...props.links,
          {
            source: parseInt(valueEdges),
            target: parseInt(valueEdges2),
            weight: parseInt(valueWeight),
          },
        ]);
      }
    }
  };

  const senseless = () => {
    let sense = "less";
  };

  const startGraph = (valueNodes, valueEdges) => {
    let nodes = [];
    let links = [];
    for (let i = 0; i < parseInt(valueNodes); i++) {
      //console.log(i);
      nodes.push({ name: i, id: i /* , x: i * 100, y: 100 */ });
    }
    //console.log(nodes);
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
      //console.log(links);
    }
    props.hideBFSLegend();
    props.hideDijkstraLegend();
    props.GraphSimulation(nodes, links, directed);
  };

  /* console.log(valueWeight, "value weight"); */
  return (
    <div className="u-flex u-flex-wrap">
      <div className="u-flex u-flex-alignCenter Graph-names">
        <input
          type="text"
          value={valueNodes}
          onChange={handleChangeNodes}
          placeholder={"#"}
          className="InputBox3"
        />
        <button className="button" onClick={addNode}>
          Add nodes
        </button>
      </div>
      <div className="u-flex u-flex-alignCenter Graph-names">
        <p className="Edge-from">From</p>
        <input
          type="text"
          value={valueEdges}
          onChange={handleChangeEdges}
          placeholder={"node"}
          className="InputBox InputBoxSmall"
        />
        <p>to</p>
        <input
          type="text"
          value={valueEdges2}
          onChange={handleChangeEdges2}
          placeholder={"node"}
          className="InputBox InputBoxSmall"
        />
        <p className="Edge-weight"> , weight</p>
        <input
          type="text"
          value={valueWeight}
          onChange={handleChangeWeight}
          placeholder={"#"}
          className="InputBox InputBoxSmall"
        />
        <button className="button " onClick={addEdge}>
          Add edge
        </button>
      </div>
      <div className="Graph-names u-flex u-flex-alignCenter">
        <input
          type="range"
          min="0"
          max="1"
          value={props.weighted}
          onChange={senseless}
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
          onChange={senseless}
          onClick={props.changeDirected}
          className="Graphs-switch"
        />
        <div className="Graphs-textInside">directed</div>
      </div>
      <button onClick={onSubmit} className="button u-marginButton">
        Clear Graph
      </button>
    </div>
  );
};

export default NewGraphInput;
