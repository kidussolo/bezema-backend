const functions = require("firebase-functions");

const express = require("express");
const AuthM = require("./config/middleware");
const app = express();
const cors = require("cors");
app.use(cors());
const {
  getAllPosts,
  addNewPost,
  getOnePost,
  updatePost,
  deletePost
} = require("./includes/posts");
const {
  login,
  getAuthenticatedUser,
  updateUserInfo,
  updatePassword
} = require("./includes/users");

app.get("/getposts", AuthM, getAllPosts);
app.get("/getOnepost/:postId", AuthM, getOnePost);
app.post("/addpost", AuthM, addNewPost);
app.delete("/post/:postId", AuthM, deletePost);
app.post("/editpost/:postId", AuthM, updatePost);

app.post("/login", login);
app.get("/getuser", AuthM, getAuthenticatedUser);
app.post("/edit-profile", AuthM, updateUserInfo);
app.post("/reset-password", AuthM, updatePassword);

exports.api = functions.https.onRequest(app);
