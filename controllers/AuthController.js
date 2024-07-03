const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).send({ error: 'Unauthorized' });

    const buff = Buffer.from(auth.split(' ')[1], 'base64');
    const [email, password] = buff.toString('utf-8').split(':');

    if (!email || !password)
      return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.users.findOne({
      email,
      password: crypto.createHash('sha1').update(password).digest('hex'),
    });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;
