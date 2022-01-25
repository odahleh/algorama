import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";
import { post } from "../../utilities";
import { get } from "../../utilities";
import * as d3 from "d3";

const SaveLoadGraph = (props) => {
  let [valueGraphName, setValueNames] = useState("");
  let [loadedGraphs, setLoadedGraphs] = useState([]);

  useEffect(() => {
    if (loadedGraphs.length === 0 && props.userId) {
      loadGraph();
    }
  }, [props.userId]);

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
      edgeNames.push({ source: edge.source.name, target: edge.target.name, weight: edge.weight });
    }
    console.log(nodeNames, edgeNames);
    if (nodeNames.length > 0 && valueGraphName.length > 0) {
      const graphDoc = {
        user: props.userId,
        numberNodes: nodeNames,
        edges: edgeNames,
        name: valueGraphName,
        directed: props.isCurrentDirected,
      };

      post("/api/savegraph", graphDoc).then((graph) => {
        setLoadedGraphs([...loadedGraphs, graph]);
        console.log(graph);
      });
    } else {
      alert("You cannot save a graph that is empty and/or does not have a name.");
    }
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
    //console.log(i);
    //console.log(loadedGraphs[i].edges);
    props.hideBFSLegend();
    props.hideDijkstraLegend();
    props.GraphSimulation(loadedGraphs[i].nodes, loadedGraphs[i].edges);
    // console.log("Will be available soon!");
  };

  const deleteGraph = (event) => {
    let objectId = event.target.id;
    let i = parseInt(objectId.charAt(objectId.length - 1));
    let graphToDelete = loadedGraphs[i];
    let graphId = graphToDelete._id;
    console.log(graphId);

    setTimeout(function () {
      setLoadedGraphs(loadedGraphs.slice(0, i).concat(loadedGraphs.slice(i + 1)));
    }, 0);

    post("/api/deletegraph", { id: graphId }).then((returnedText) => {
      console.log(returnedText);
    });
  };

  let graphList;

  if (loadedGraphs.length > 0) {
    graphList = loadedGraphs.map((s, index) => (
      <span key={"savedGraph" + index.toString()} className="Graph-names u-flex u-flex-alignCenter">
        <button className="Graphs-x" onClick={deleteGraph} id={"deleteGraph" + index.toString()}>
          X
        </button>
        <div className="Graphs-bubbleText">{s.name}</div>
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
    <>
      <div className="Graphs-text">Save and load your graphs</div>
      <div className="Graphs-topbar u-flex u-flex-wrap " id="Graphs-loadingMenu">
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
    </>
  );
};

export default SaveLoadGraph;
