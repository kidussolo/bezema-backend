const { admin, db } = require("../config/admin");
const config = require("../config/firebase");
exports.getAllPosts = (req, res) => {
  idToken = req.headers.authorization.split("Bearer ")[1];
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          image: doc.data().imageUrl,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(posts);
    })
    .catch(err => console.error(err));
};

exports.addNewPost = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  idToken = req.headers.authorization.split("Bearer ")[1];
  const busboy = new BusBoy({ headers: req.headers });
  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif"
    ) {
      return res
        .status(400)
        .json({ error: `Wrong file type submitted ${filename == ""}` });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  let formData = new Map();
  busboy.on("field", function(fieldname, val) {
    formData.set(fieldname, val);
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const newPost = {
          title: formData.get("title"),
          description: formData.get("description"),
          createdAt: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${idToken}`
        };

        db.collection("posts")
          .add(newPost)
          .then(doc => {
            res.json({ message: `Post ${doc.id} added successfully` });
          })
          .catch(err => {
            res.status(500).json({ error: "something went wrong" });
            console.log(err);
          });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch(err => {
        console.error(err);
        return res
          .status(500)
          .json({ error: "something went wrong with image" });
      });
  });
  busboy.end(req.rawBody);
};
exports.getOnePost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      postData = doc.data();
      postData.postId = doc.id;
      return res.json(postData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
exports.updatePost = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  idToken = req.headers.authorization.split("Bearer ")[1];
  const busboy = new BusBoy({ headers: req.headers });
  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (filename == "") {
      imageFileName = "";
    } else {
      if (
        mimetype !== "image/jpeg" &&
        mimetype !== "image/png" &&
        mimetype !== "image/gif"
      ) {
        return res
          .status(400)
          .json({ error: `Wrong file type submitted ${filename}` });
      }
      // my.image.png => ['my', 'image', 'png']

      const imageExtension = filename.split(".")[
        filename.split(".").length - 1
      ];
      // 32756238461724837.png
      imageFileName = `${Math.round(
        Math.random() * 1000000000000
      ).toString()}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
    }
  });
  let formData = new Map();
  busboy.on("field", function(fieldname, val) {
    formData.set(fieldname, val);
  });

  busboy.on("finish", () => {
    const Post = {
      title: formData.get("title"),
      description: formData.get("description"),
      createdAt: new Date().toISOString()
    };
    if (imageFileName == "") {
      const document = db.doc(`/posts/${req.params.postId}`);
      document
        .update(Post)
        .then(doc => {
          res.json({ message: `Post ${doc.id} updated successfully` });
        })
        .catch(err => {
          res.status(500).json({ error: "something went wrong" });
          console.log(err);
        });
    } else if (imageFileName != "") {
      Post.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${idToken}`;
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const document = db.doc(`/posts/${req.params.postId}`);
          document
            .update(Post)
            .then(doc => {
              res.json({ message: `Post ${doc.id} updated successfully` });
            })
            .catch(err => {
              res.status(500).json({ error: "something went wrong" });
              console.log(err);
            });
        })
        .catch(err => {
          res.status(500).json({ error: "something went wrong with file" });
          console.log(err);
        });
    }
  });
  busboy.end(req.rawBody);
};
exports.deletePost = (req, res) => {
  const document = db.doc(`/posts/${req.params.postId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Post deleted successfully" });
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};
