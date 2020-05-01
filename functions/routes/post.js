const { db } = require("../util/admin");


exports.getUserPosts = (req, res) => {

  db.collection("posts").where("userId","==",req.user.userId)
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
 
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          full_name: doc.data().full_name,
          createdAt: doc.data().createdAt,
          userId:doc.data().userId,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });

      return res.json(posts);
    })
    .catch(err => console.error(err));
};

exports.getAllPosts = (req, res) => {

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
 
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          full_name: doc.data().full_name,
          createdAt: doc.data().createdAt,
          userId:doc.data().userId,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });

      return res.json(posts);
    })
    .catch(err => console.error(err));
};

exports.newPost = (req, res) => {
  const newPost = {
    body: req.body.body,
    tags: req.body.tags,
    full_name: req.user.full_name,
    userId:req.user.userId,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };



  db.collection("posts").add(newPost)
    .then(doc => {
      // let resPost = newPost;
      // resPost.postId = doc.id;
      res.json({ massege: `document ${doc.id} created Sucessfully` });
    })
    .catch(err => {
      res.status(500).json(err);
      console.error(err);
    });
};



exports.getPostComment = (req, res) => {


  console.log("-----------",req.params.postId)


  db.collection("comments").where("postId","==",req.params.postId)
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let comments = [];
 
      data.forEach(doc => {
        comments.push({
          commentId: doc.id,
          body: doc.data().body,
          full_name: doc.data().full_name,
          createdAt: doc.data().createdAt,
          userId:doc.data().userId,
          userImage: doc.data().userImage,
          postId:doc.data().postId
        });
      });

      return res.json(comments);
    })
    .catch(err => console.error(err));
};




exports.getPost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "post not found" });
      }
      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then(data => {
      postData.comments = [];
      data.forEach(doc => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnPost = (req, res) => {


  if (req.body.body.trim() === ""){
    return res.status(400).json({ comment: "Must not be empty" });
  }
    

  const comment = {
    body: req.body.body,
    full_name: req.user.full_name,
    userId:req.user.userId,
    userImage: req.user.imageUrl,
    postId:req.params.postId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(comment);
    })
    .then(() => {
      res.json(comment);
    })
    .catch(err => {
    
      res.status(500).json({ error: "Something went wrong" });
    });
};

//like on post
exports.likeOnPost = (req, res) => {

  
  const likeDocument = db
    .collection("likes")
    .where("userId", "==", req.user.userId)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  postDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "post not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            postId: req.params.postId,
            userId: req.user.userId
          })
          .then(() => {
            if (postData.likeCount >= 0) {
              postData.likeCount++;
            } else {
              postData.likeCount = 0;
            }
            return postDocument.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return res.status(400).json({ error: "post already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
//unlike on post
exports.unlikeOnPost = (req, res) => {

  console.log()
  const likeDocument = db
    .collection("likes")
    .where("userId", "==", req.user.userId)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  postDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "post not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "post unliked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            if (postData.likeCount >= 0) {
              postData.likeCount--;
            } else {
              postData.likeCount = 0;
            }
            return postDocument.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
//Delete a post
exports.deletePost = (req, res) => {

  const document = db.doc(`/posts/${req.params.postId}`);
  // console.log("post Id",req.params.postId)
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
       else {
        return document.delete();
      }
    })
    .then(() => {
      res.status(200).json({ message: "Post deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
