const sequelize = require('./index');
require('./associations');
const models = require('./models');

// add database functions here
module.exports = {
  findOrCreateUser: function findOrCreateUser(userProfile, accessToken, callback) {
    models.User.findOrCreate({
      where: { fbId: userProfile.id },
      defaults: {
        name: userProfile.displayName,
        // fbToken: accessToken,
      },
    })
      .spread((user, created) => {
        console.log(user.get({
          plain: true,
        }));
        console.log(created);
        callback(user);
      });
  },
  findOrCreateVote: function findOrCreateVote(userId, submissionId, cb) {
    models.Vote.findOrCreate({
      where: {
        userId,
        submissionId,
      },
      // defaults: {
      // },
    }).spread((vote, created) => {
      cb(created);
    }).catch((err) => {
      console.log(err, 'this is error after spread');
    });
  },
  findAllChallenges: function findAllChallenges(req, res) {
    models.Challenge.findAll().then((challenges) => {
      const challengeData = [];
      challenges.forEach((challenge) => {
        challengeData.push(challenge.dataValues);
      });
      res.send(challengeData);
    });
  },
  findSpecificChallenge: function findSpecificChallenge(req, res, challengeId) {
    console.log('placeholder for a more modular specific challenge finder');
  },
  getLeaderboardData: (callback) => {
    models.User.findAll({
      order: [['score', 'DESC']],
      include: [
        {
          model: models.Badge,
        },
        {
          model: models.Challenge,
        },
        {
          model: models.Submission,
        },
      ],
    })
      .then((users) => {
        callback(null, users);
      })
      .catch((err) => {
        console.log(err);
        callback(err);
      });
  },
  findOrCreateSubmission: function findOrCreateSubmission(userId, itemId, image, cb) {
    models.Submission.findOrCreate({
      where: {
        userId,
        itemId,
      },
      defaults: {
        image,
      },
    }).spread((submission, created) => {
      cb(created);
    }).catch((err) => {
      console.log(err, 'this is error after spread');
    });
  },
  userChallengeExists: (userId, challengeId) =>
    models.UserChallenges.findOne({ where: { userId, challengeId } }),

  getUserChallengeSubmissions: (userId, challengeId) =>
    models.Challenge.findById(challengeId)
      .then(challenge => challenge.getItems())
      .then((items) => {
        const promises = [];
        // get all user submissions for this challenge
        items.forEach((item) => {
          promises.push(models.Submission.findOne({
            where: {
              userId,
              itemId: item.dataValues.id,
            },
          }));
        });
        return Promise.all(promises);
      })
      .catch((err) => {
        console.error(err);
      }),
  completeChallenge: (userId, challengeId) =>
    models.UserChallenges.create({
      userId,
      challengeId,
    })
      .then(() =>
        models.Challenge.findById(challengeId)
          .then(challenge => challenge.dataValues.value))
      .then((value) => {
        models.User.findById(userId)
          .then(user =>
            user.updateAttributes({
              score: user.dataValues.score + value,
            }));
      })
      .catch((err) => {
        console.log('error completing challenge', err);
      }),
  addBadge: (userId, badgeId) =>
    models.UserBadges.create({
      userId,
      badgeId,
    }),
  getChallengeById: challengeId =>
    models.Challenge.findById(challengeId),
  getChallengeByTitle: title =>
    models.Challenge.findOne({
      where: { title },
    }),
  createChallenge: challenge =>
    models.Challenge.create(challenge),
  addChallengeItem: (challengeId, item) =>
    models.Item.create({
      challengeId,
      name: item,
    }),
  getSubmissionsData: () =>
    models.Submission.findAll({
      include: [
        {
          model: models.User,
        },
        {
          model: models.Item,
        },
      ],
    }),
  findUserSubmissions: id =>
    models.Submission.findAll({
      where: { userId: id },
      include: [
        {
          model: models.User,
        },
        {
          model: models.Item,
        },
      ],
    }),
  getPhotoChallenges: () =>
    models.Challenge.findAll({
      where: {
        longitude: null,
        latitude: null,
      },
    }),
  getGeoChallenges: () =>
    models.Challenge.findAll()
      .then(challenges =>
        challenges.filter(challenge =>
          challenge.dataValues.longitude && challenge.dataValues.latitude)),
  checkLocation: (latitude, longitude, challengeId) =>
    models.Challenge.findById(challengeId)
      .then((challenge) => {
        const upperLat = challenge.dataValues.latitude + challenge.dataValues.range;
        const lowerLat = challenge.dataValues.latitude - challenge.dataValues.range;
        const upperLon = challenge.dataValues.longitude + challenge.dataValues.range;
        const lowerLon = challenge.dataValues.longitude - challenge.dataValues.range;
        if (latitude <= upperLat && latitude >= lowerLat && longitude <= upperLon && longitude >= lowerLon) {
          return true;
        }
        return false;
      }),
};

