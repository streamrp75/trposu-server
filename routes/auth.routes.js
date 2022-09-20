const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const config = require("config");
const authMiddleware = require("../middleware/auth.middleware");

const router = new Router();
router.post(
  "/registration",
  [
    check("email", "Некоректный email").isEmail(),
    check("password", "Пароль должен быть больше 2 и менее 12 знаков").isLength(
      { min: 3, max: 12 }
    ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Некорректный запрос", errors });
      }
      const {
        email,
        username,
        password,
        firstname,
        lastname,
        birthday,
        isDoctor,
      } = req.body;

      const candidateEmail = await User.findOne({ email });
      const candidateUsername = await User.findOne({ username });
      if (candidateEmail || candidateUsername) {
        return res.status(400).json({
          message: "Пользователь с такой почтой или логином уже существует",
        });
      }
      const hashPassword = await bcrypt.hash(String(password), 8);
      const user = new User({
        email,
        username,
        password: hashPassword,
        firstname,
        lastname,
        birthday,
        isDoctor,
      });
      await user.save();
      return res.json({ message: "Пользователь был создан" });
    } catch (e) {
      console.log(e);
      res.send({ message: "Ашибка" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const isPassValid = bcrypt.compareSync(
      String(password),
      String(user.password)
    );
    if (!isPassValid) {
      return res.status(400).json({ message: "Неправильный пароль" });
    }
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        birthday: user.birthday,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Ошибка" });
  }
});

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        birthday: user.birthday,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Ошибка" });
  }
});

module.exports = router;
