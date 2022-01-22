import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
//import Typewriter from "typewriter-effect";
import "../../utilities.css";
import "./Index.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";

const Index = ({ userId, handleLogin, handleLogout }) => {
  if (userId) {
    return (
      <>
        <meta http-equiv="refresh" content="0; url = '/graphs'" />
      </>
    );
  }
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
      <div className="landing-page-container u-textCenter">
        <div className="landing-page-title">
          {/* <Typewriter
            options={{
              strings: ["Algorama", "Algorithm Visualizer", "Data Visualizer", "MIT 6.006 Helper"],
              autoStart: true,
              loop: true,
            }}
          /> */}
        </div>
        <div className="landing-page-content">
          {" "}
          A Graph and Data Visualizer to help you understand your MIT 6.006 Algorithms!{" "}
        </div>
        {userId ? (
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={handleLogout}
            onFailure={(err) => console.log(err)}
          />
        ) : (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            render={(renderProps) => (
              <button
                className="landing-page-button landing-page-content u-link:hover"
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
        )}
      </div>
    </>
  );
};

export default Index;
