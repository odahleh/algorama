import React, { useState, useEffect } from "react";
import { Router } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import Index from "./pages/Index.js";
import Graphs from "./pages/Graphs.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import NewGraphs from "./pages/NewGraphs.js";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserName(user.name);
      }
    });
  }, []);

  const handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  if (userId) {
    return (
      <>
        <Router>
          <Index path="/" handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />
          <Graphs
            path="/graphs"
            userId={userId}
            userName={userName}
            handleLogout={handleLogout}
            userId={userId}
          />
          {/* <NewGraphs path="/newgraphs" userId={userId} /> */}
          <NotFound default />
        </Router>
      </>
    );
<<<<<<< HEAD
  }
  else{
    console.log("something else");
=======
  } else {
>>>>>>> 886b962e5210fc8334a82482e7ead7702eb02a9f
    return (
      <>
        <Router>
          <Index path='/' handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />
          <NotFound default />
        </Router>
      </>
    );
  }
};

export default App;
