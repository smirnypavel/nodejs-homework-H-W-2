const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendMail } = require("../helpers");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const crypto = require("crypto");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const hasPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = crypto.randomUUID();

  const newUser = await User.create({
    ...req.body,
    password: hasPassword,
    avatarURL,
    verificationToken,
  });

  await sendMail({
    to: email,
    subject: `Welcome to my project dear !!!`,
    html: `<h1>Привет ${email}</h1>
    <p>
    <br>Мы рады видеть вас в нашем онлайн-сообществе!
    <br>Пожалуйста, подтвердите свою электронную почту, чтобы завершить регистрацию:
   
    <br> Нажмите на ссылку для подтверждения аккаунта.
    <br> После этого вы сможете войти в свой аккаунт и начать пользоваться нашим сервисом.
    <br>Если вы не регистрировались у нас, просто проигнорируйте это письмо.
    
    <br>Спасибо и до скорой встречи!
    
    <br>С уважением,
    <br>Команда "PhoneBook"</p> 
    <a href="http://127.0.0.1:5000/api/users/verify/${verificationToken}">Confirm your email</a> `,
  });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.verify) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }

  const verificationToken = crypto.randomUUID();

  await User.findByIdAndUpdate(user._id, { verificationToken });

  await sendMail({
    to: email,
    subject: "Verification Email",
    html: `<h1>Verification Email</h1>
      <p>Please click the following link to verify your email:</p>
      <a href="http://127.0.0.1:5000/api/users/verify/${verificationToken}">Verify Email</a>`,
  });

  return res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (user.verify === false) {
    throw HttpError(401, "Email is not verified");
  }

  const payload = {
    contactId: user._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email,
      subscription: "starter",
    },
  });
};

const getCurrent = async (req, res, next) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.json(204, "No Content");
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  const img = await jimp.read(tempUpload);
  img.resize(250, 250).writeAsync(tempUpload);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  resendVerificationEmail: ctrlWrapper(resendVerificationEmail),
};
