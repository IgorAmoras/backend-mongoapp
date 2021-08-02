const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const authMiddleware = require('../middlewares/middlewareAuth')
const {validateUser} = require('../middlewares/sessionAuth')
const authConfig = require("../config/auth.json");
const router = express.Router();

const generateToken = (params = {}) =>
  jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    if (
      await User.findOne({
        email,
      })
    )
      return res.status(400).send({
        error: "User already exists",
      });
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({
      user,
      token: generateToken({
        id: user.id,
      }),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error: "Registration error",
    });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user)
    return res.status(400).json({
      error: "User does not exist or not found",
    });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({
      error: "wrong password you fool",
    });

  user.password = undefined;

  return res.status(200).json({
    user,
    token: generateToken({
      id: user.id,
    }),
  });
});

router.post("/forgot-password", async (req, res) => {
  console.log("aaaa");
  const { email } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user)
      return res.status(400).json({
        error: "User does not exist or not found",
      });

    const token = crypto.randomBytes(10).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    mailer.sendMail(
      {
        to: email,
        from: "igoramoras3@gmail.com",
        template: "auth/forgot_password",
        context: { token },
      },
      (error) => {
        if (error) {
          res.status(400).send({ error: "It is not possible send an email" });
          console.error(error);
        }

        return res.status(200).send({ Message: "Success" });
      }
    );
  } catch (error) {
    res.status(400).send({
      error: "There has been an error on forgot email request",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user)
      return res.status(400).json({
        error: "User does not exist or not found",
      });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Wrong token" });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: "Token expired, slow dowg" });

    user.password = password;

    await user.save();

    return res.status(200).send({ Success: user });
  } catch (error) {
    return res.status(400).send({ error: "Cannot reset you fool" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const user = await User.find();

    return res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: "Huge error" });
  }
});

router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndDelete({_id: userId});
    return res.status(200).send({ deleted: user });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: "Error on deleting user" });
  }
});

router.get("/users/:email", authMiddleware, validateUser, async (req, res) => {
  const { user } = req
  return res.status(200).send({ user })
})
router.get("/user/:userId", async(req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    return res.status(200).send({user})
  } catch (error) {
    return res.status(500).send({error})
  }
})

router.put("/users/:userId", async (req, res) => {
  User.updateOne({_id: req.params.userId}, req.body, function(err, doc){
    if(err) {console.error(err); return res.status(500).send({err})}
    return res.status(200).send({doc})
  })
})
module.exports = (app) => app.use("/auth", router);
