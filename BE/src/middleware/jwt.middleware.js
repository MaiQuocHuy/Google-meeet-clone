const JWT = require("jsonwebtoken");
var createError = require("http-errors");

const decodeToken = async (token) => {
  return JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        throw createError.Unauthorized();
      }
      createError.Unauthorized(err.message);
    }

    if (decoded) return decoded;
  });
};

const verifyToken = async (req, res, next) => {
  try {
    let userToken = req.headers["token"];
    if (userToken) {
      var decode = await decodeToken(userToken);
      if (decode) {
        if (!req.value) req.value = {};
        if (!req.value.decode) req.value.decode = {};
        req.value.decode = decode;
        // res.send("ok")
        next();
      }
    } else {
      throw createError.Unauthorized("User need to login");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
};
