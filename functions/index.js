const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");

app.use(cors());

const {
  // getAllPosts,
  newPost,
  // getPost,
  // commentOnPost,
  // likeOnPost,
  // unlikeOnPost,
  // deletePost
} = require("./routes/post");
const {
  signup,
  login,
  // uplodImage,
  addUserDetails
  // getAuthenticatedUser,
  // getUserDetails,
  // markNotificationsRead
} = require("./routes/user");
const { FBAuth } = require("./util/FBAuth");
const { db } = require("./util/admin");

// app.get("/posts", getAllPosts);
app.post("/post", FBAuth, newPost);
// app.get("/post/:postId", getPost);
// app.delete("/post/:postId", FBAuth, deletePost);
// app.post("/post/:postId/comment", FBAuth, commentOnPost);
// app.get("/post/:postId/like", FBAuth, likeOnPost);
// app.get("/post/:postId/unlike", FBAuth, unlikeOnPost);

//Signup route
app.post("/signup", signup);
//login
app.post("/login", login);

// app.post("/user/image", FBAuth, uplodImage);
app.post("/user", FBAuth, addUserDetails);
// app.get("/user", FBAuth, getAuthenticatedUser);
// app.get("/user/:userName", getUserDetails);
// app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

// // trriger notification on like
// exports.createNotificationOnLike = functions.firestore
//   .document("likes/{id}")
//   .onCreate(snapshot => {
//     return db
//       .doc(`/posts/${snapshot.data().postId}`)
//       .get()
//       .then(doc => {
//         if (doc.exists && doc.data().userName !== snapshot.data().userName) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toISOString(),
//             recipient: doc.data().userName,
//             sender: snapshot.data().userName,
//             type: "like",
//             read: false,
//             postId: doc.id
//           });
//         }
//       })
//       .catch(err => console.error(err));
//   });
// //delete unlike notification

// exports.deleteNotificationOnUnLike = functions.firestore
//   .document("likes/{id}")
//   .onDelete(snapshot => {
//     return db
//       .doc(`/notifications/${snapshot.id}`)
//       .delete()
//       .catch(err => {
//         console.error(err);
//         return;
//       });
//   });

// // trriger notification on comment
// exports.createNotificationOnComment = functions.firestore
//   .document("comments/{id}")
//   .onCreate(snapshot => {
//     return db
//       .doc(`/posts/${snapshot.data().postId}`)
//       .get()
//       .then(doc => {
//         if (doc.exists && doc.data().userName !== snapshot.data().userName) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toISOString(),
//             recipient: doc.data().userName,
//             sender: snapshot.data().userName,
//             type: "comment",
//             read: false,
//             postId: doc.id
//           });
//         }
//       })
//       .catch(err => {
//         console.error(err);
//         return;
//       });
//   });

// exports.onUserImageChange = functions.firestore
//   .document("/users/{userId}")
//   .onUpdate(change => {
//     if (change.before.data().imageUrl !== change.after.data().imageUrl) {
//       const batch = db.batch();
//       return db
//         .collection("posts")
//         .where("userName", "==", change.before.data().userName)
//         .get()
//         .then(data => {
//           data.forEach(doc => {
//             const post = db.doc(`/posts/${doc.id}`);
//             batch.update(post, { userImage: change.after.data().imageUrl });
//           });
//           return batch.commit();
//         });
//     } else return true;
//   });

// exports.onPostDelete = functions.firestore
//   .document("/posts/{postId}")
//   .onDelete((snapshot, context) => {
//     const postId = context.params.postId;
//     const batch = db.batch();
//     return db
//       .collection("comments")
//       .where("postId", "==", postId)
//       .get()
//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/comments/${doc.id}`));
//         });
//         return db
//           .collection("likes")
//           .where("postId", "==", postId)
//           .get();
//       })
//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/likes/${doc.id}`));
//         });
//         return db
//           .collection("notifications")
//           .where("postId", "==", postId)
//           .get();
//       })
//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/notifications/${doc.id}`));
//         });
//         return batch.commit();
//       })
//       .catch(err => console.error(err));
//   });
