import React, { Component, useEffect, useState } from "react";
import "../../utilities.css";
import "../pages/Graphs.css";

const Dijkstra = ({ recolorNode, linksState, nodesState }) => {
    let [showDijkstraProgress, setShowDijkstraProgress] = useState(false);
    let [dijkstraStepState, setDijkstraStepState] = useState([]);
    let [dijkstraIndex, setDijkstraIndex] = useState(-1);
    let [startNodeDijkstra, setStartNodeDijkstra] = useState("");
    
    