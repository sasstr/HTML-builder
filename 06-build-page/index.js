const { createReadStream, createWriteStream } = require('fs');
const { join, extname } = require('path');
const { mkdir, rm, readdir, access, readFile, writeFile }  = require('fs/promises');
const { pipeline } = require('stream/promises');
const { once } = require('events');
const { EOL } = require('os');

const targetPath = join(__dirname, 'project-dist');

// Функция проверяет существование директории
const isPath = async (path) => {
  try {
    await access(path);
    return true;
  } catch (error) {
    return false;
  }
};
// Функция создает директорию
const createTargetDirectory = async (targetDir) => {
  if (await isPath(targetDir)) {
    await rm(targetDir, { force: true, recursive: true });
  }
  await mkdir(targetDir);
};
// Функция копирует Assets в папку назначения project-dist/assets
const copyAssets = async (sourceDir, targetDir) => {
  await createTargetDirectory(targetDir);

  const files = await readdir(sourceDir, { withFileTypes: true });

  files.forEach((file) => {
    if (file.isDirectory()) {
      return copyAssets(join(sourceDir, file.name), join(targetDir, file.name));
    }
    if (file.isFile()) {
      const readStream = createReadStream(join(sourceDir, file.name));
      const writeStream = createWriteStream(join(targetDir, file.name));
      pipeline(readStream, writeStream);
    }
  });
};

// Функция объединяет css файл из многих
const mergeCssFiles = async (sourceDir, targetDir) => {
  const targetStreamPath = join(targetDir, 'style.css');
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

// Функция вставляет шаблоны в файл
const insertHtmlTemplates = async (sourceDir, targetDir) => {
  let templateFile = await readFile(join(__dirname, 'template.html'), {
    encoding: 'utf-8',
  });
  const pattern = /{{([^{}]+)}}/g;
  const overlap = templateFile.matchAll(pattern);
  const entryTemplates = Array.from(overlap);
  if (!entryTemplates.length) { return; }
  const arrTemplates = entryTemplates.map((template) => readFile(join(sourceDir, `${template[1]}.html`), { encoding: 'utf-8', }));
  const templates = await Promise.all(arrTemplates);
  entryTemplates.forEach((temp, i) => {
    templateFile = templateFile.replace(temp[0], templates[i]);
  });
  await writeFile(join(targetDir, 'index.html'), templateFile, {
    encoding: 'utf-8',
  });
};
// Функция собирает итоговый build
const buildProjectDist = async (targetDir) => {
  const sourcePathAssets = join(__dirname, 'assets');
  const targetPathAssets = join(targetDir, 'assets');
  const sourcePathCss = join(__dirname, 'styles');
  const sourcePathComponents = join(__dirname, 'components');

  await createTargetDirectory(targetDir);
  copyAssets(sourcePathAssets, targetPathAssets).
    then(mergeCssFiles(sourcePathCss, targetDir)). 
    then(insertHtmlTemplates(sourcePathComponents, targetDir)).
    catch(err => console.log(err));
};

buildProjectDist(targetPath);
