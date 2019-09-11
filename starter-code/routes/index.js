const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");

/* GET home page */
router.get("/", (req, res, next) => {
  const user=req.session.loggedInUser
  res.render("index",{user});
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.render("signup", { message: "The fields cannot be empty" });
    return;
  }

  User.findOne({username: username}).then(user => {
    if (user) {
      res.render("signup", {
        message: "Username already exists. Please choose another username"
      });
    } else {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      User.create({ username:username, password:hash })
        .then(user => {
          res.redirect("/");
        })
        .catch(err => {
          next(err);
        });
    }
  });
});

router.get("/login",(req,res,next)=>{
res.render("login")
})

router.post("/login",(req,res,next)=>{
  const {username, password}=req.body
  User.findOne({username}).then(user=>{
    if(!user){
      res.render("login",{message:"Invalid credentials"})
      return;
    }
    if (bcrypt.compareSync(password,user.password)){
      req.session.loggedInUser=user;
      res.render("main")
    }
    else{
      res.render("login",{message:"Invalid credentials"})
    }
  })

})

const logInCheck=()=>{
return(req,res,next)=>{
  if (req.session.loggedInUser){
    next()
  }else{
    res.redirect("/login")
  }
}
}

router.get("/private",logInCheck(),(req,res,next)=>{
  res.render("private")
})

module.exports = router;
