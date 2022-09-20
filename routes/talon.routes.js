const Router = require("express");
const Talon = require("../models/Talon");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");

const router = new Router();
router.post("/talon", async (req, res) => {
  try {
    const { firstname, lastname, birthday, doctor, date, time, token } =
      req.body;
    if (!date) {
      return res.json({ message: "Введите дату" });
    }
    const talons = await Talon.findOne({ date: date, time: time });
    if (!talons) {
      if (token) {
        console.log("vjfkfeeff");
        const decoded = jwt.verify(token, config.get("secretKey"));
        const user = await User.findOne({ _id: decoded.id });

        const talon = new Talon({
          firstname: user.firstname,
          lastname: user.lastname,
          birthday: user.birthday,
          doctor,
          date,
          time,
          userId: user.id,
        });
        await talon.save();
      } else {
        const talon = new Talon({
          firstname,
          lastname,
          birthday,
          doctor,
          date,
          time,
        });
        await talon.save();
      }
      return res.json({ message: "Талон был создан" });
    } else {
      return res.json({
        message: "Талон на это время уже заказан. Попробуйте другое",
      });
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "Ошибка" });
  }
});

router.get("/talon", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (user.isAdmin) {
      const talons = await Talon.find({});
      console.log(talons);
      return res.json({ message: talons });
    } else {
      if (user.isDoctor) {
        const talons = await Talon.find({ doctor: user.firstname });
        console.log(talons);
        return res.json({ message: talons });
      } else {
        const talons = await Talon.find({ userId: user.id });
        console.log(talons);
        return res.json({ message: talons });
      }
    }
  } catch (e) {
    console.log(e);
    res.send({ message: "Ошибка" });
  }
});
module.exports = router;
