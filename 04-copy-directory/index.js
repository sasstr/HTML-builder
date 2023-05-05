const { createReadStream, createWriteStream } = require('fs');
const { join } = require('path');
const { pipeline } = require('stream/promises');
const { mkdir, rm, readdir, access } = require('fs/promises');
const sourcePath = join(__dirname, 'files');
const targetPath = join(__dirname, 'files-copy');

const copyDir = async (sourceDir, targetDir) => {
  const isPath = async (path) => {
    try {
      await access(path);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (await isPath(targetDir)) {
    await rm(targetDir, { recursive: true, force: true });
    await mkdir(targetDir);
  } else {
    await mkdir(targetDir, { recursive: true });
  }

  const files = await readdir(sourceDir, { withFileTypes: true });

  files.forEach((file) => {
    if (file.isDirectory()) {
      return copyDir(join(sourceDir, file.name), join(targetDir, file.name));
    }
    if (file.isFile()) {
      const readStream = createReadStream(join(sourceDir, file.name));
      const writeStream = createWriteStream(join(targetDir, file.name));
      pipeline(readStream, writeStream);
    }
  });
};

copyDir(sourcePath, targetPath);
