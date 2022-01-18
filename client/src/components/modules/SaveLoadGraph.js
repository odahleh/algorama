import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";
import { post } from "../../utilities";
import { get } from "../../utilities";

const SaveLoadGraph = (props) => {
  let [valueGraphName, setValueNames] = useState("");
  let [loadedGraphs, setLoadedGraphs] = useState([]);

  useEffect(() => {
    if (loadedGraphs.length === 0 && props.userId) {
      console.log("yallah");
      loadGraph();
    }
  }, props.userId);

  const handleChangeName = (event) => {
    setValueNames(event.target.value);
  };

  const saveGraph = () => {
    let nodeNames = [];
    let edgeNames = [];
    for (let node of props.nodesState) {
      nodeNames.push({ name: node.name });
    }
    for (let edge of props.linksState) {
      edgeNames.push({ source: edge.source.name, target: edge.target.name });
    }
    const graphDoc = {
      user: props.userId,
      numberNodes: nodeNames,
      edges: edgeNames,
      name: valueGraphName,
    };
    post("/api/savegraph", graphDoc).then((graph) => {
      setLoadedGraphs([...loadedGraphs, graph]);
      console.log(graph);
    });
  };

  const loadGraph = () => {
    setLoadedGraphs([]);
    const user = props.userId;
    const graphDoc = { user: user };
    get("/api/loadgraph", graphDoc).then((graphs) => {
      setLoadedGraphs(graphs);
      document.getElementById("Graphs-loadingMenu").style.bordercolor = "white";
    });
  };

  const generateGraph = (event) => {
    console.log("generate");
    //setDisplaySimulation(false);
    let id = event.target.id;
    let i = parseInt(id.charAt(id.length - 1));
    console.log(i);
    console.log(loadedGraphs[i].edges);
    props.GraphSimulation(loadedGraphs[i].nodes, loadedGraphs[i].edges);
    // console.log("Will be available soon!");
  };

  let graphList;

  if (loadedGraphs.length > 0) {
    graphList = loadedGraphs.map((s, index) => (
      <span className="Graph-names u-flex u-flex-alignCenter">
        {s.name}
        <button
          onClick={generateGraph}
          id={"loadedGraph" + index.toString()}
          className="button u-marginButtonLeft"
        >
          {" "}
          Display
        </button>
      </span>
    ));
  }

  return (
    <div className="Graphs-topbar u-flex u-flex-wrap " id="Graphs-loadingMenu">
      {console.log("render")}
      <span className="Graph-names u-flex u-flex-alignCenter">
        <input
          type="text"
          value={valueGraphName}
          onChange={handleChangeName}
          placeholder={"Graph Name"}
          className="InputBoxInside"
        />
        <button onClick={saveGraph} className="button u-marginButtonLeft">
          Save
        </button>
      </span>

      {/* <button onClick={loadGraph} className="button u-marginButton">
        {" "}
        Load{" "}
      </button> */}

      {graphList}
    </div>
  );
};

export default SaveLoadGraph;
