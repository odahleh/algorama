const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const GraphEntry = require("./models/graphEntry");
const socketManager = require("./server-socket");

// create a new OAuth client used to verify google sign-in
//    TODO: replace with your own CLIENT_ID
const CLIENT_ID = "747234267420-pibdfg10ckesdd8t6q0nffnegumvqpi3.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    const newUser = new User({
      name: user.name,
      googleid: user.sub,
    });

    return newUser.save().then((user) => {
      const newGraphEntry = new GraphEntry({
        user: user._id,
        name: "Sample Graph",
        nodes: [
          { name: 0 },
          { name: 1 },
          { name: 2 },
          { name: 3 },
          { name: 4 },
          { name: 5 },
          { name: 6 },
          { name: 7 },
          { name: 8 },
          { name: 9 },
          { name: 10 },
          { name: 11 },
          { name: 12 },
        ],
        edges: [
          { source: 10, target: 1, weight: 1 },
          { source: 1, target: 8, weight: 3 },
          { source: 8, target: 12, weight: 6 },
          { source: 12, target: 2, weight: 2 },
          { source: 2, target: 3, weight: 8 },
          { source: 3, target: 4, weight: 2 },
          { source: 3, target: 7, weight: 22 },
          { source: 7, target: 6, weight: 6 },
          { source: 6, target: 5, weight: 3 },
          { source: 11, target: 7, weight: 2 },
          { source: 11, target: 0, weight: 7 },
          { source: 0, target: 7, weight: 4 },
          { source: 0, target: 9, weight: 2 },
          { source: 9, target: 10, weight: 6 },
          { source: 9, target: 8, weight: 7 },
        ],
      });

      newGraphEntry.save();
    });
  });
}

function login(req, res) {
  verify(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      // persist user in the session
      req.session.user = user;
      res.send(user);
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
