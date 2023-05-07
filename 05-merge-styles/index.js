const { join, extname } = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { readdir } = require('fs/promises');
const { once } = require('events');
const { EOL } = require('os');

const sourcePath = join(__dirname, 'styles');
const targetPath = join(__dirname, 'project-dist');

// Функция собирающая в один файл все CSS файлы
const getBundleCss = async (sourceDir, targetDir) => {
  const targetStreamPath = join(targetDir, 'bundle.css');
  const writeStream = createWriteStream(targetStreamPath);
  const files = await readdir(sourceDir, { withFileTypes: true });
  const cssFiles = files.filter((file) => file.isFile() && extname(file.name) === '.css' );
  const cssFileNames = cssFiles.map((file) => file.name);

  for (let cssFileName of cssFileNames) {
    const readStream = createReadStream(join(sourceDir, cssFileName));
    readStream.pipe(writeStream, { end: false });
    await once(readStream, 'end');
    writeStream.write(EOL);
  }

  writeStream.close();
};

getBundleCss(sourcePath, targetPath);
