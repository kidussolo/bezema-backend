const firebase = require("firebase");
const config = require("../config/firebase");
firebase.initializeApp(config);
const { db, admin } = require("../config/admin");
const {loginValidate, profileValidate, passwordValidate }= require("../config/validation");
exports.login = (req, res) => {
 
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const { valid, errors } = loginValidate(user);
  if (!valid) return res.status(400).json(errors);
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        return res
          .status(403)
          .json({ general: "Invalid username or password" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData= doc.data();
        userData.email = req.user.email;
      }
      return res.json(userData);
    })

    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
exports.updateUserInfo = (req, res) => {


  let {valid, errors} = profileValidate(req.body)
  if (!valid) return res.status(400).json(errors);
  let userData = {
    "firstname": req.body.fname,
    "lastname":req.body.lname
  }
  let userRecord = this.updateEmail(req.user.uid, req.body.email)
  if(userRecord === 'false') return res.json("Email update failed")
  db.doc(`/users/${req.user.handle}`)
  .update(userData)
  .then(doc => {
   
    //userRecord.profile = doc.data()
    return res.json("Profile updated successfully")
 
  })
 
   .catch(err => {
    console.error(err);
    return res.status(500).json({ error:err.code });
  });
}

exports.updateEmail = (uid, uemail) => {
 
  admin.auth().updateUser(uid, {email : uemail})
    .then(userRecord =>{
      
      return "true"
    })
    .catch(() => {
      return "false"
    });
}
exports.updatePassword = (req, res) => {
  let {valid, errors} = passwordValidate(req.body)
  if (!valid) return res.status(400).json(errors);
 
  admin.auth().updateUser(req.user.uid, {password : req.body.new})
  .then(() =>{
   
    return res.json("successful")
  })
  .catch(() => {
    return res.json("Can't update password")
  });

 
}