const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
    this.database = this.client.db(database);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = this.database.collection('users');
    return users.countDocuments();
  }

  async nbFiles() {
    const files = this.database.collection('files');
    return files.countDocuments();
  }

  //findUserByEmail
  async findUserByEmail(email) {
    const users = this.database.collection('users');
    return users.findOne({ email });
  }

  //createUser;
  async createUser(email, password) {
    const users = this.database.collection('users');
    const newUser = { email, password };
    const result = await users.insertOne(newUser);
    return { _id: result.insertedId, email, password };
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
