const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

/**
 * Verifies the user making the request has the correct rights
 * @param requiredRights The rights needed for authorization. Multiple strings allowed.
 * @param rightsOnly Set to true if only correct rights determine whether the request is authorized, false if matching userid and rights are both valid authorization.
 * @returns {function(*=, *=, *=): Promise<unknown>}
 */
const verifyCallback = (req, resolve, reject, requiredRights, rightsOnly) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    // if it's rightsOnly but you dont have required rights, matching userid doesnt matter.
    if (rightsOnly && !hasRequiredRights) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
    // if you don't have the required rights and you aren't the same user, reject too.
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve(); // resolve only if it's rightsOnly & you either have the required rights or a matching id, or it's rightsOnly and you have the required rights.
};

/**
 * Authorizes a user
 * @param rightsOnly Set to true if only correct rights determine whether the request is authorized, false if matching userid and rights are both valid authorization.
 * @param requiredRights The rights needed for authorization. Multiple strings allowed.
 * @returns {function(*=, *=, *=): Promise<unknown>}
 */
const auth = (rightsOnly, ...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights, rightsOnly))(
      req,
      res,
      next
    );
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
