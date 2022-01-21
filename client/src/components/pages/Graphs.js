import React, { Component, useEffect, useState } from "react";
import Switch from "react-switch";
import * as d3 from "d3";
//import { forceSimulation } from "https://cdn.skypack.dev/d3-force@3";

import "../../utilities.css";
import "./Graphs.css";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { least, stratify } from "d3";

import NewGraphInput from "../modules/NewGraphInput.js";
import SaveLoadGraph from "../modules/SaveLoadGraph.js";

const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
let userIDList = [];

const Graphs = ({ userId, handleLogout, userName }) => {
  const [main, setRef1] = useState(React.createRef());
  let [currentSimulation, setCurrentSimulation] = useState(null);
  let [displaySimulation, setDisplaySimulation] = useState(false);
  let [WIDTH, setWidth] = useState(null);
  let [HEIGHT, setHeight] = useState(null);
  let [nodesState, setNodes] = useState([]);
  let [linksState, setLinks] = useState([]);
  let [showBFSProgress, setShowBFSProgress] = useState(false);
  let [BFS_STEP, setBFS_STEP] = useState([]);
  let [BFS_INDEX, setBFS_INDEX] = useState(0);
  let [startNodeBFS, setStartNodeBFS] = useState("");
  const [directed, setDirected] = useState(false);

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
    d3.select(main.current)
      .selectAll("svg")
      .attr("height", window.innerHeight - navbox.clientHeight)
      .attr("width", window.innerWidth);
    let navbox = document.querySelector(".top-bar-container");
    console.log("resize");
    setHeight(window.innerHeight - navbox.clientHeight);
    setWidth(window.innerWidth);
    if (displaySimulation) {
      currentSimulation.force(
        "center",
        d3.forceCenter(window.innerWidth / 2, (window.innerHeight - navbox.clientHeight) / 2)
      );
    }
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
      .attr("width", window.innerWidth)
      .attr(
        "height",
        window.innerHeight - document.querySelector(".top-bar-container").clientHeight
      )
      //.attr("viewbox", "0 0 100 100")
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
      .force(
        "center",
        d3.forceCenter(
          window.innerWidth / 2,
          (window.innerHeight - document.querySelector(".top-bar-container").clientHeight) / 2
        )
      )
      .on("tick", ticked);

    let edge = svg
      .selectAll(".gLine")
      .data(links)
      .enter()
      .append("g")
      .attr("class", "gLine")
      .append("line")
      //.attr("marker-end", "url(#arrow)")
      .attr("stroke-width", 5)
      .attr("stroke", "grey")
      .attr("id", function (d) {
        return "e" + d.source.toString() + "-" + d.target.toString();
      });

    //svg.selectAll("g").append("text").text("lol").attr("x", 6).attr("y", 3);

    let vertex = svg
      .selectAll(".gNode")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "gNode")
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

    let linkText = svg
      .selectAll(".gLine")
      .data(links)
      .append("text")
      .attr("background-color", "white")
      .text(function (d) {
        if (d.weight) {
          return d.weight.toString();
        } else {
          return "1";
        }
      });

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
          //console.log(d.source.x);
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
      linkText
        .attr("x", function (d) {
          if (d.target.x > d.source.x) {
            return d.source.x + (d.target.x - d.source.x) / 2;
          } else {
            return d.target.x + (d.source.x - d.target.x) / 2;
          }
        })
        .attr("y", function (d) {
          if (d.target.y > d.source.y) {
            return d.source.y + (d.target.y - d.source.y) / 2;
          } else {
            return d.target.y + (d.source.y - d.target.y) / 2;
          }
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
  };

  const recolorNode = (i, color) => {
    let nodeId = "#v" + i.toString();
    d3.select(main.current).select("svg").select(nodeId).attr("fill", color);
  };

  const recolorEdge = (i, j, color) => {
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
  function BFS() {
    d3.select(main.current).select("svg").selectAll("circle").attr("fill", "black");
    recolorNode(startNodeBFS, "red");
    // BFS_stepper(0);
    // setBFS_INDEX(0);
    let start = { name: parseInt(startNodeBFS) };
    setShowBFSProgress(true);
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

  function BFS_stepper(index) {
    d3.select(main.current).select("svg").selectAll("circle").attr("fill", "black");
    recolorNode(startNodeBFS, "red");
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

  const handleStartNodeBFS = (event) => {
    setStartNodeBFS(event.target.value);
  };

  const nextStep = () => {
    BFS_stepper(Math.min(BFS_STEP.length - 1, Math.max(1 + BFS_INDEX, 0)));
    setBFS_INDEX(Math.min(BFS_STEP.length - 1, Math.max(1 + BFS_INDEX, 0)));
  };
  const prevStep = () => {
    BFS_stepper(Math.min(BFS_STEP.length - 1, Math.max(BFS_INDEX - 1, 0)));
    setBFS_INDEX(Math.min(BFS_STEP.length - 1, Math.max(BFS_INDEX - 1, 0)));
  };

  const handleButtonChange = () => {
    setDirected(!directed);
  };

  let redirect = <div></div>;
  console.log(userId);
  if (userId === undefined) {
    console.log(userIDList);
    userIDList.push(userId);
    //console.log(userIDList);
    if (userIDList.length > 2 && userIDList[-1] === undefined) {
      redirect = <meta http-equiv="refresh" content="0; url = '/'" />;
      console.log("redirect");
      //userIDList = [];
    }
  }

  return (
    <div className="Graphs-pageContainer">
      {redirect}
      <div className="top-bar-container">
        <div className="u-flex">
          <div className="Graphs-title left-side ">
            {" "}
            {userName
              ? "Welcome to Algorama, " + userName.split(" ")[0] + "!"
              : "Welcome to Algorama!"}
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
        <div className="Graphs-text">Create a new graph or run an algorithm</div>
        <div className="Graphs-topbar">
          <div className=" u-flex u-flex-wrap">
            Directed
            <Switch
              checked={directed}
              onChange={handleButtonChange}
              className="Graphs-switch"
              uncheckedIcon={false}
              checkedIcon={false}
              handleDiameter={12}
              height={20}
              onColor="#fff"
              offColor="#fff"
              offHandleColor="#aaa"
              onHandleColor="#ffa630"
            />
            Undirected
            <NewGraphInput GraphSimulation={GraphSimulation} />
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
          </div>
        </div>
        <div className="Graphs-text">Save and load your graphs</div>
        <div className="second-bar">
          <SaveLoadGraph
            userId={userId}
            nodesState={nodesState}
            linksState={linksState}
            GraphSimulation={GraphSimulation}
          />
        </div>
      </div>
      <div id="main" className="Graphs-svgContainer" ref={main} /* width="500px" height="500px" */>
        {""}
      </div>
    </div>
  );
};

export default Graphs;
