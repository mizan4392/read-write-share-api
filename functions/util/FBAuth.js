const { admin, db } = require("./admin");

exports.FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Auth ")
  ) {
    idToken = req.headers.authorization.split("Auth ")[1];
  } else {
    console.error("no Token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  console.log("token---> ", idToken);

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      console.log(data.docs[0].data())
      req.user.full_name = data.docs[0].data().full_name;
      req.user.userId = data.docs[0].data().userId;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(400).json(err);
    });
};
