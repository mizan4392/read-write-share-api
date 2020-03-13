const { db, admin } = require("../util/admin");
const firebaseConfig = require("../util/firebaseConfig");
const firebase = require("firebase");
const BusBoy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails
} = require("../util/validators");

firebase.initializeApp(firebaseConfig);

//-------------------SignUp Route-----------------
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    full_name: req.body.fullName,
    gender: req.body.gender
  };
  //validation user data
  // const { valid, errors } = validateSignupData(newUser);
  // if (!valid) return res.status(400).json(errors);

  const noImg = "blank.png";
  const noImg_f = "blank-f.png";
  //-------pushing data to database
  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        res.status(400).json({ email: "this email is already exists" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idtoken => {
      //setting user data
      token = idtoken;
      const userCredintial = {
        full_name: newUser.full_name,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
        userId
      };
      return db.doc(`/users/${userId}`).set(userCredintial);
    })
    .then(() => {
      return res.status(201).json({ token: token });
    })
    .catch(err => {
      console.error(err);
      return res
        .status(400)
        .json({ general: "Somthing went wrong , plese try again" });
    });
};

//-------------------Login Route-----------------
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({
        token: token
      });
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({ general: "Wrong Credintial, plese try again" });
    });
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  console.log(req.user);

  db.doc(`/users/${req.user.uid}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Details added successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// //get own user Details
// exports.getAuthenticatedUser = (req, res) => {
//   let userData = {};
//   db.doc(`/users/${req.user.userName}`)
//     .get()
//     .then(doc => {
//       if (doc.exists) {
//         userData.credentials = doc.data();
//         return db
//           .collection("likes")
//           .where("userName", "==", req.user.userName)
//           .get();
//       }
//     })
//     .then(data => {
//       userData.likes = [];
//       data.forEach(doc => {
//         userData.likes.push(doc.data());
//       });

//       return db
//         .collection("notifications")
//         .where("recipient", "==", req.user.userName)
//         .orderBy("createdAt", "desc")
//         .limit(10)
//         .get();
//     })
//     .then(data => {
//       userData.notifications = [];
//       data.forEach(doc => {
//         userData.notifications.push({
//           recipient: doc.data().recipient,
//           sender: doc.data().sender,
//           createdAt: doc.data().createdAt,
//           postId: doc.data().postId,
//           type: doc.data().type,
//           read: doc.data().read,
//           notificationId: doc.id
//         });
//       });
//       return res.json(userData);
//     })
//     .catch(err => {
//       console.error(err);
//       return res.status(500).json({ error: err.code });
//     });
// };

// exports.uplodImage = (req, res) => {
//   const busboy = new BusBoy({ headers: req.headers });

//   let imgFileName, imgToBeUploded;
//   busboy.on("file", (fieldName, file, fileName, encoding, mimetype) => {
//     if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
//       return res.status(400).json({ error: "Wrong file type try jpeg or png" });
//     }
//     const imgExt = fileName.split(".")[fileName.split(".").length - 1];
//     imgFileName = `${Math.round(Math.random() * 1000000000)}.${imgExt}`;
//     const filePath = path.join(os.tmpdir(), imgFileName);

//     imgToBeUploded = { filePath, mimetype };

//     file.pipe(fs.createWriteStream(filePath));
//   });
//   busboy.on("finish", () => {
//     admin
//       .storage()
//       .bucket()
//       .upload(imgToBeUploded.filePath, {
//         resumable: false,
//         metadata: {
//           metadata: {
//             contentType: imgToBeUploded.mimetype
//           }
//         }
//       })
//       .then(() => {
//         const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imgFileName}?alt=media`;
//         return db.doc(`/users/${req.user.userName}`).update({ imageUrl });
//       })
//       .then(() => {
//         return res.json({ massege: "Image Uploded sucessfully" });
//       })
//       .catch(err => {
//         console.error(err);
//         return res.status(500).json({ error: err.code });
//       });
//   });
//   busboy.end(req.rawBody);
// };

// //get any user's detailes
// exports.getUserDetails = (req, res) => {
//   let userData = {};
//   db.doc(`/users/${req.params.userName}`)
//     .get()
//     .then(doc => {
//       if (doc.exists) {
//         userData.user = doc.data();
//         return db
//           .collection("posts")
//           .where("userName", "==", req.params.userName)
//           .orderBy("createdAt", "desc")
//           .get();
//       } else {
//         return res.status(404).json({ errror: "User not found" });
//       }
//     })
//     .then(data => {
//       userData.posts = [];
//       data.forEach(doc => {
//         userData.posts.push({
//           body: doc.data().body,
//           createdAt: doc.data().createdAt,
//           userName: doc.data().userName,
//           userImage: doc.data().userImage,
//           likeCount: doc.data().likeCount,
//           commentCount: doc.data().commentCount,
//           postId: doc.id
//         });
//       });
//       return res.json(userData);
//     })
//     .catch(err => {
//       console.error(err);
//       return res.status(500).json({ error: err.code });
//     });
// };

// exports.markNotificationsRead = (req, res) => {
//   let batch = db.batch();
//   req.body.forEach(notificationId => {
//     const notification = db.doc(`/notifications/${notificationId}`);
//     batch.update(notification, { read: true });
//   });
//   batch
//     .commit()
//     .then(() => {
//       return res.json({ message: "Notifications marked read" });
//     })
//     .catch(err => {
//       console.error(err);
//       return res.status(500).json({ error: err.code });
//     });
// };
