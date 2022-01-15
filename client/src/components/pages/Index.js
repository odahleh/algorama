import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "../../utilities.css";
import "./Index.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";

const Index = ({ userId, handleLogin, handleLogout }) => {
  return (
    <>
      {/* {userId ? (
        <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={handleLogout}
          onFailure={(err) => console.log(err)}
        />
      ) : (
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Login"
          onSuccess={handleLogin}
          onFailure={(err) => console.log(err)}
        />
      )} */}
      <div class="landing-page-container">
        <div class="landing-page-title">Homepage Name</div>
        <div class="landing-page-content">
          {" "}
          Homepage descirption Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod
          tempor incidunt ut labore et dolore magna aliqua.{" "}
        </div>
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          render={(renderProps) => (
            <button
              class="landing-page-button landing-page-content"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              Get Started
            </button>
          )}
          buttonText="Login"
          onSuccess={handleLogin}
          onFailure={(err) => console.log(err)}
          cookiePolicy={"single_host_origin"}
        />
      </div>
    </>
  );
};

export default Index;
