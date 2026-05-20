const redis = require('../config/redis');

const cache = (ttl = 60) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  res.sendResponse = res.json.bind(res);
  res.json = (data) => {
    redis.setex(key, ttl, JSON.stringify(data));
    res.sendResponse(data);
  };
  next();
};

module.exports = cache;