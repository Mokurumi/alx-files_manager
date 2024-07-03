const crypto = require('crypto');
const Bull = require('bull');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const fileQueue = new Bull('fileQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });

    const user = await dbClient.findUserByEmail(email);
    if (user) return res.status(400).send({ error: 'Already exist' });

    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    const newUser = await dbClient.createUser(email, hashedPassword);

    await fileQueue.add({ userId: newUser._id });

    return res.status(201).send({ id: newUser._id, email: newUser.email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token') || '';
    const user = await redisClient.get(`auth_${token}`);

    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const parsedUser = JSON.parse(user);
    return res
      .status(200)
      .send({ id: parsedUser._id, email: parsedUser.email });
  }
}

module.exports = UsersController;
