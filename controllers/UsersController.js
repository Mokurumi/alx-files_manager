const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const usersCollection = dbClient.database.collection('users');
    const userExists = await usersCollection.findOne({ email });

    if (userExists) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = await dbClient.nbUsers({ email, hashedPassword });

    const fileQueue = new Bull('fileQueue');
    await fileQueue.add({ userId: newUser.id });

    return res.status(201).send({ id: newUser.id, email: newUser.email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token') || '';
    const user = await redisClient.get(`auth_${token}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    return res.status(200).send({ id: user.id, email: user.email });
  }
}

module.exports = UsersController;
