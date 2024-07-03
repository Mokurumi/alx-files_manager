const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Bull = require('bull');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postNew(req, res) {
    const { name, type, parentId, isPublic, data } = req.body;
    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type))
      return res.status(400).send({ error: 'Missing type' });
    if (!data && type !== 'folder')
      return res.status(400).send({ error: 'Missing data' });

    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const parent = parentId ? await dbClient.files.findById(parentId) : null;
    if (parentId && !parent)
      return res.status(400).send({ error: 'Parent not found' });
    if (parentId && parent.type !== 'folder')
      return res.status(400).send({ error: 'Parent is not a folder' });

    const file = {
      userId: user,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };

    if (type === 'folder') {
      const newFolder = await dbClient.files.create(file);
      return res.status(201).send(newFolder);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });
    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, data, 'base64');

    const newFile = await dbClient.files.create({ ...file, localPath });
    return res.status(201).send(newFile);
  }

  static async getOne(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: req.params.id,
      userId: user,
    });
    if (!file) return res.status(404).send({ error: 'Not found' });

    return res.status(200).send(file);
  }

  static async getAll(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;
    const files = await dbClient.files
      .find({ parentId, userId: user })
      .skip(page * 20)
      .limit(20);
    return res.status(200).send(files);
  }

  static async putPublish(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: req.params.id,
      userId: user,
    });
    if (!file) return res.status(404).send({ error: 'Not found' });

    file.isPublic = true;
    await file.save();
    return res.status(200).send(file);
  }

  static async putUnpublish(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: req.params.id,
      userId: user,
    });
    if (!file) return res.status(404).send({ error: 'Not found' });

    file.isPublic = false;
    await file.save();
    return res.status(200).send(file);
  }

  static async getFile(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: req.params.id,
      userId: user,
    });
    if (!file) return res.status(404).send({ error: 'Not found' });

    if (file.type === 'folder')
      return res.status(400).send({ error: "A folder doesn't have content" });

    return res.status(200).send(file);
  }

  static async postUpload(req, res) {
    const { name, type, parentId, isPublic, data } = req.body;
    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type))
      return res.status(400).send({ error: 'Missing type' });
    if (!data && type !== 'folder')
      return res.status(400).send({ error: 'Missing data' });

    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const parent = parentId ? await dbClient.files.findById(parentId) : null;
    if (parentId && !parent)
      return res.status(400).send({ error: 'Parent not found' });
    if (parentId && parent.type !== 'folder')
      return res.status(400).send({ error: 'Parent is not a folder' });

    const file = {
      userId: user,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };

    if (type === 'folder') {
      const newFolder = await dbClient.files.create(file);
      return res.status(201).send(newFolder);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });
    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, data, 'base64');

    const newFile = await dbClient.files.create({ ...file, localPath });
    const fileQueue = new Bull('fileQueue');
    await fileQueue.add({ userId: user, fileId: newFile._id });
    return res.status(201).send(newFile);
  }

  static async getShow(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: req.params.id,
      userId: user,
    });
    if (!file) return res.status(404).send({ error: 'Not found' });

    return res.status(200).send(file);
  }

  static async getIndex(req, res) {
    const user = await redisClient.get(`auth_${req.header('X-Token')}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;
    const files = await dbClient.files
      .find({ parentId, userId: user })
      .skip(page * 20)
      .limit(20);
    return res.status(200).send(files);
  }
}

module.exports = FilesController;
