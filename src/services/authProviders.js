const jwt = require('jsonwebtoken');
const APIError = require('../utils/APIError');
const logger = require('../config/logger');

const moduleError = new APIError({
  source: 'authProviders.service',
});

exports.providersConfig = {
  // connect: homeConnectConfig,
  // shopify: shopifyConfig,
};

// exports.connect = async (access_token, profile, refreshToken) => {
//   const decoded = jwt.decode(access_token);
//   const oauthId = decoded.sub.toString(10);
//   const oauthTokenExp = decoded.exp;
//   return {
//     service: 'connect',
//     oauthId,
//     isActive: true,
//     isUserAuthService: true,
//     oauthTokenExp,
//     handleOAuth: async (User) => {
//       try {
//         const [user, created] = await User.findOrCreate({
//           where: {
//             oauthId,
//           },
//           defaults: {
//             isActive: true,
//             properties: await User.getDefaultProperties(),
//             subscriptionDetails: {},
//             role: User.getRoles()[0],
//             oauthId,
//             oauthToken: access_token,
//             oauthTokenExp,
//             oauthRefreshToken: refreshToken,
//             countryCode: shopifyConfig.defaultCountryCode,
//           },
//         });
//         if (!created) {
//           user.isActive = true;
//           user.oauthToken = access_token;
//           user.oauthTokenExp = oauthTokenExp;
//           user.oauthRefreshToken = refreshToken;
//           await user.save();
//         }
//         return user;
//       } catch (err) {
//         moduleError.message = err.message;
//         moduleError.source = 'authProviders.service.connect.handleOAuth';
//         logger.error(moduleError);
//         throw moduleError;
//       }
//     },
//   };
// };
