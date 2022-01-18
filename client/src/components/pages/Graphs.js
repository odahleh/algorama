import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { least, stratify } from "d3";

import { post } from "../../utilities";
import { get } from "../../utilities";

const GOOGLE_CLIENT_ID =
  "git747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
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
  let [nodesState, setNodes] = useState([{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]);
  let [linksState, setLinks] = useState([
    { source: 2, target: 1, weight: 1 },
    { source: 3, target: 2, weight: 3 },
  ]);
  let [vertexObjs, setVertexObjs] = useState(null);
  let [edgeObjs, setEdgeObjs] = useState(null);
  let [loadedGraphs, setLoadedGraphs] = useState([]);
  let [showBFSProgress, setShowBFSProgress] = useState(false);
  let [BFS_STEP, setBFS_STEP] = useState([]);
  let [BFS_INDEX, setBFS_INDEX] = useState(0);

  let [currentSvg, setCurrentSvg] = useState(null);

  useEffect(() => {
    let navbox = document.querySelector(".top-bar-container");
    let offsetTop = navbox.clientHeight;
    setHeight(window.innerHeight - navbox.clientHeight);
    setWidth(window.innerWidth);
    window.addEventListener(
      "resize",
      handleResize /* function () {
      clearTimeout(adaptSizeTimer);
      adaptSizeTimer = setTimeout(function () {
        console.log("resize");
      }, 500);
    } */
    );
  });

  const handleResize = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force("center", d3.forceCenter(windowWidth / 2, windowHeight / 2));
    }
  };

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
    GraphSimulation(nodes, links);
  };

  const saveGraph = () => {
    let nodeNames = [];
    let edgeNames = [];
    for (let node of nodesState) {
      nodeNames.push({ name: node.name });
    }
    for (let edge of linksState) {
      edgeNames.push({ source: edge.source.name, target: edge.target.name });
    }
    const graphDoc = {
      user: userId,
      numberNodes: nodeNames,
      edges: edgeNames,
      name: valueGraphName,
    };
    post("/api/savegraph", graphDoc);
  };

  const generateGraph = (event) => {
    console.log("generate");
    //setDisplaySimulation(false);
    let id = event.target.id;
    let i = parseInt(id.charAt(id.length - 1));
    console.log(i);
    console.log(loadedGraphs[i].edges);
    GraphSimulation(loadedGraphs[i].nodes, loadedGraphs[i].edges);
    // console.log("Will be available soon!");
  };

  let graphList;

  const loadGraph = () => {
    setLoadedGraphs([]);
    const user = userId;
    const graphDoc = { user: user };
    get("/api/loadgraph", graphDoc).then((graphs) => {
      setLoadedGraphs(graphs);
      document.getElementById("Graphs-loadingMenu").style.bordercolor = "white";
    });
  };

  const GraphSimulation = (nodes, links) => {
    setNodes(nodes);
    setLinks(links);
    if (displaySimulation === true) {
      d3.selectAll("svg").remove();
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
      .attr("stroke", "grey")
      .attr("id", function (d) {
        return "e" + d.source.toString() + "-" + d.target.toString();
      });

    let vertex = svg
      .selectAll("circles")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "black")
      .attr("id", function (d) {
        return "v" + d.name.toString();
      })
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    vertex.append("title").text(function (d) {
      return d.name;
    });

    vertex.append("text").text(function (d) {
      return d.name;
    });

    // TODO: Finish adding labels, see https://stackoverflow.com/questions/13364566/labels-text-on-the-nodes-of-a-d3-force-directed-graph

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    recolorNode(0, "red");

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

  const recolorNode = (i, color) => {
    let nodeId = "#v" + i.toString();
    d3.select(main.current).select("svg").select(nodeId).attr("fill", color);
  };

  const recolorEdge = (i, j, color) => {
    color = "green";
    let edgeId = "#e" + i.toString() + "-" + j.toString();
    d3.select(main.current).select("svg").select(edgeId).attr("stroke", color);
  };

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
  function BFS(start) {
    changeShowBFSProgress();
    start = { name: 0 };
    let links = linksState;
    let nodes = nodesState;
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
  const changeShowBFSProgress = () => {
    setShowBFSProgress(!showBFSProgress);
  };
  function BFS_stepper(index) {
    d3.select(main.current).select("svg").selectAll("circle").attr("fill", "black");
    recolorNode(0, "red");
    console.log(BFS_STEP);
    console.log(index);
    for (let node in BFS_STEP[index]) {
      // if value of node has changed
      if (BFS_STEP[index - 1][node] !== BFS_STEP[index][node]) {
        recolorNode(node, "green");
        console.log(node);
      }
    }
  }

  const nextStep = () => {
    BFS_stepper(Math.min(BFS_STEP.length - 1, Math.max(1 + BFS_INDEX, 0)));
    setBFS_INDEX(Math.min(BFS_STEP.length - 1, Math.max(1 + BFS_INDEX, 0)));
  };
  const prevStep = () => {
    BFS_stepper(Math.min(BFS_STEP.length - 1, Math.max(BFS_INDEX - 1, 0)));
    setBFS_INDEX(Math.min(BFS_STEP.length - 1, Math.max(BFS_INDEX - 1, 0)));
  };

  let redirect = <div></div>;
  //console.log(userId);
  if (userId === undefined) {
    userIDList.push(userId);
    //console.log(userIDList);
    if (userIDList.length === 4 && userIDList[-1] === undefined) {
      userIDList = [];
      redirect = <meta http-equiv="refresh" content="0; url = '/'" />;
    }
  }

  if (loadedGraphs.length > 0) {
    // for (let graph of loadedGraphs){
    //   oldNodes = graph.nodes;
    //   oldEdges = graph.edges;
    // }
    graphList = loadedGraphs.map((s, index) => (
      <span className="graph-names">
        {s.name}
        <button onClick={generateGraph} id={"loadedGraph" + index.toString()} className="button">
          {" "}
          Display
        </button>
      </span>
    ));
  }

  return (
    <div className="Graphs-pageContainer">
      {redirect}
      <div className="top-bar-container">
        <div className="title"> {""} Welcome to Algorama! </div>
        <div className="top-bar">
          <div className="left-side">
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

            <button onClick={startGraph} className="button">
              {" "}
              Start
            </button>

            <button onClick={recolorNode} className="button">
              Recolor Node
            </button>
            <button onClick={recolorEdge} className="button">
              Recolor Edge
            </button>
            <button onClick={BFS} className="button">
              BFS
            </button>
            {showBFSProgress ? (
              <div>
                <button onClick={prevStep} className="button">
                  Previous Step
                </button>
                <button onClick={nextStep} className="button">
                  Next Step
                </button>
              </div>
            ) : (
              <div></div>
            )}
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
        <div className="second-bar">
          <div className="Graphs-loadingMenu" id="Graphs-loadingMenu">
            <button onClick={saveGraph} className="button">
              {" "}
              Save{" "}
            </button>
            <input
              type="text"
              value={valueGraphName}
              onChange={handleChangeName}
              placeholder={"Graph Name"}
              className="InputBox"
            />
            <button onClick={loadGraph} className="button">
              {" "}
              Load{" "}
            </button>

            {graphList}
          </div>
        </div>
      </div>
      <div id="main" className="Graphs-svgContainer" ref={main} /* width="500px" height="500px" */>
        {""}
      </div>
    </div>
  );
};

export default Graphs;
