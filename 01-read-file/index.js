const { createReadStream } = require('fs');
const { join } = require('path');
const { stdout } = process;
const { pipeline } = require('stream/promises');

const path = join(__dirname, 'text.txt');
const readStream = createReadStream(path);
const writeStream = stdout;
pipeline(readStream, writeStream);
