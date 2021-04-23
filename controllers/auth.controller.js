const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET || "secretkey";
const { nanoid } = require("nanoid");
exports.signup = (req, res) => {
  try {
    const newUser = new User({
      _id: nanoid(),
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      phoneno: req.body.phoneno,
    });

    User.findOne(
      { username: req.body.username, email: req.body.email },
      (err, user) => {
        if (err) {
          return res.status(500).end();
        } else if (!user) {
          newUser.save();
          const jwttoken = jwt.sign(
            {
              id: newUser._id,
              username: newUser.username,
              email: newUser.email,
            },
            secret,
            { expiresIn: 86400 }
          );
          return res
            .status(200)
            .json({
              id: newUser._id,
              token: jwttoken,
              username: newUser.username,
            })
            .end();
        } else {
          return res.status(500).end();
        }
      }
    );
  } catch (error) {
    res.status(500).end();
  }
};

exports.login = (req, res) => {
  User.findOne(
    { $or: [{ username: req.body.username }, { email: req.body.username }] },
    (err, user) => {
      if (err) return res.status(500).end();
      if (!user) return res.status(401).end();

      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!validPassword) {
        return res
          .status(401)
          .send({
            message: "Invalid Password",
          })
          .end();
      }

      const jwttoken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        secret,
        { expiresIn: 86400 }
      );

      res
        .status(200)
        .json({
          id: user._id,
          token: jwttoken,
          username: user.username,
        })
        .end();
    }
  );
};

exports.forgotpassword = (req, res) => {
  const { username, email, phoneno, passwordresettoken } = req.body;

  if ([username, email, phoneno, passwordresettoken].includes(undefined))
    return res.status(400).send();

  User.findOne(
    {
      username,
      email,
      phoneno,
    },
    (err, user) => {
      if (err) return res.status(500).end();
      if (!user) return res.status(401).end();

      jwt.verify(passwordresettoken, secret, (err, _) => {
        console.log(err);
        if (err) {
          return res.status(403).send();
        }
        if (passwordresettoken !== user.passwordresettoken) {
          return res.status(401).end();
        }

        const jwttoken = jwt.sign(
          { id: user._id, username: user.username, email: user.email },
          secret,
          { expiresIn: 86400 }
        );
        user.password = bcrypt.hashSync(req.body.password, 8);
        user.passwordresettoken = "";
        user.save();
        return res
          .status(200)
          .json({
            id: user._id,
            token: jwttoken,
            username: user.username,
          })
          .end();
      });
    }
  );
};

exports.requestPasswordReset = (req, res) => {
  const { username, email, phoneno } = req.body;
  if ([username, email, phoneno].includes(undefined))
    return res.status(400).send();

  User.findOne(
    {
      username,
      email,
      phoneno,
    },
    (err, user) => {
      if (err) return res.status(500).end();
      if (!user) return res.status(401).end();

      const jwttoken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        secret,
        { expiresIn: 600 }
      );
      user.passwordresettoken = jwttoken;
      user.save();
      return res.status(200).json({ passwordresettoken: jwttoken }).end();
    }
  );
};
