import React, { useEffect } from "react";
import { navigate } from "@reach/router";

const NotFound = () => {
  useEffect( () => {
    navigate("/");
  }); 
  
  return (
    <>
      {/* <meta http-equiv="refresh" content="0; url = '/'" /> */}
    </>
  );
};

export default NotFound;
