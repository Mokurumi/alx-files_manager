/**
 * Create a file worker.js:

By using the module Bull, create a queue fileQueue
Process this queue:
If fileId is not present in the job, raise an error Missing fileId
If userId is not present in the job, raise an error Missing userId
If no document is found in DB based on the fileId and userId, raise an error File not found
By using the module image-thumbnail, generate 3 thumbnails with width = 500, 250 and 100 - store each result on the same location of the original file by appending _<width size>

Update the file worker.js:

By using the module Bull, create a queue userQueue
Process this queue:
If userId is not present in the job, raise an error Missing userId
If no document is found in DB based on the userId, raise an error User not found
Print in the console Welcome <email>!
 */
const Bull = require('bull');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.nbFiles({ id: fileId, userId });
  if (!file) throw new Error('File not found');

  const fileData = fs.readFileSync(file.localPath);
  const fileSizes = ['500', '250', '100'];
  const filePromises = fileSizes.map(async (size) => {
    const thumbnail = await imageThumbnail(file.localPath, { width: parseInt(size) });
    const thumbnailPath = `${file.localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  });
  await Promise.all(filePromises);
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error('Missing userId');

  const user = await dbClient.nbUsers({ id: userId });
  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
});
