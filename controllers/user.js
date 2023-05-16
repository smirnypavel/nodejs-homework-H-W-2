const { User } = require("../models/user");
const { HttpError } = require("../helpers");

async function verifyUser(req, res, next) {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (user === null) {
      throw HttpError(401, "Invalid token");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }
    await User.findByIdAndUpdate(
      user._id,
      { verificationToken: null },
      { verify: true }
    );
    return res.status(200).json({ mesage: " Verification successful " });
  } catch (error) {
    return next(error);
  }
}

module.exports = { verifyUser };
