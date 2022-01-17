import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { stratify } from "d3";

import { post } from "../../utilities";

const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
let userIDList = [];

const Graphs = ({ userId, handleLogout }) => {
  const [main, setRef1] = useState(React.createRef());
  let [valueNodes, setValueNodes] = useState("");
  let [valueEdges, setValueEdges] = useState("");
  let [valueGraphName, setValueNames] = useState("");
  let [currentSimulation, setCurrentSimulation] = useState(null);
  let [displaySimulation, setDisplaySimulation] = useState(false);
  let [WIDTH, setWidth] = useState(800);
  let [HEIGHT, setHeight] = useState(500);
  let [windowHeight, setWindowHeight] = useState(window.innerHeight);
  let [windowWidth, setWindowWidth] = useState(window.innerWidth);
  let [nodes, setNodes] = useState([{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]);
  let [links, setLinks] = useState([
    { source: 2, target: 1, weight: 1 },
    { source: 3, target: 2, weight: 3 },
  ]);
  let [vertexObjs, setVertexObjs] = useState(null);
  let [edgeObjs, setEdgeObjs] = useState(null);
  let [currentSvg, setCurrentSvg] = useState(null);

  /* useEffect(() => {
    /* setHeight(window.innerHeight);
    setWidth(window.innerWidth); 
    window.addEventListener(
      "resize",
      handleResize /* function () {
      clearTimeout(adaptSizeTimer);
      adaptSizeTimer = setTimeout(function () {
        console.log("resize");
      }, 500);
    } 
    );
  }); */

  /* const handleResize = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force("center", d3.forceCenter(windowWidth / 2, windowHeight / 2));
    }
  }; */

  const startGraph = () => {
    let nodes = [];
    let links = [];
    for (let i = 0; i < parseInt(valueNodes); i++) {
      console.log(i);
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
    setNodes(nodes);
    setLinks(links);
    GraphSimulation(nodes, links);
  };

  const saveGraph = () => {
    const graphDoc = { user: userId, numberNodes: nodes, edges: links, name: valueGraphName };
    post("/api/savegraph", graphDoc);
  };

  const GraphSimulation = (vertices, edges) => {
    let nodes = vertices;
    let links = edges;
    if (displaySimulation === true) {
      d3.selectAll("svg").remove();
      //d3.select(main.current).append("svg").attr("width", WIDTH).attr("height", HEIGHT);
      setDisplaySimulation(false);
    }
    const svg = d3
      .select(main.current)
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("background-color", "white");

    let simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(function (d) {
            return d.name;
          })
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-70))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .on("tick", ticked);

    let edge = svg
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 5)
      .attr("stroke", "grey");

    let vertex = svg
      .selectAll("circles")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "black")
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    function ticked() {
      let radius = 10;
      vertex
        .attr("cx", function (d) {
          //console.log(d.x);
          return Math.max(radius, Math.min(WIDTH - radius, d.x));
        })
        .attr("cy", function (d) {
          return Math.max(radius, Math.min(HEIGHT - radius, d.y));
        });
      edge
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    setDisplaySimulation(true);
    setCurrentSimulation(simulation);
    setEdgeObjs(edge);
    setVertexObjs(vertex);
  };

  const handleChangeNodes = (event) => {
    setValueNodes(event.target.value);
  };

  const handleChangeEdges = (event) => {
    setValueEdges(event.target.value);
  };

  const handleChangeName = (event) => {
    setValueNames(event.target.value);
  };

  let redirect = <div></div>;
  //console.log(userId);
  if (userId === undefined) {
    userIDList.push(userId);
    //console.log(userIDList);
    if (userIDList.length === 4 && userIDList[-1] === undefined) {
      userIDList = [];
      redirect = <meta http-equiv="refresh" content="0; url = 'http://localhost:5000'" />;
    }
  }

  return (
    <div>
      {redirect}
      <div className="top-bar">
        <div className="left-side">
          <button onClick={startGraph}> Start</button>
          <input
            type="text"
            value={valueNodes}
            onChange={handleChangeNodes}
            placeholder={"number of nodes"}
          />
          <input
            type="text"
            value={valueEdges}
            onChange={handleChangeEdges}
            placeholder={"edges 0-1,2-0, ..."}
          />
          <input
            type="text"
            value={valueGraphName}
            onChange={handleChangeName}
            placeholder={"graph name"}
          />
          <button onClick={saveGraph}> Save </button>
        </div>
        <div className="right-side">
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={handleLogout}
            onFailure={(err) => console.log(err)}
          />
        </div>
      </div>
      <div id="main" ref={main} /* width="500px" height="500px" */>
        {""}
      </div>
    </div>
  );
};

export default Graphs;
