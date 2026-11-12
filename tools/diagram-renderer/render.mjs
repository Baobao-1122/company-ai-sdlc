import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const TOOL_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const CALLER_DIRECTORY = process.env.INIT_CWD ?? process.cwd();
const CONFIG_PATH = path.join(TOOL_DIRECTORY, 'mermaid.config.json');
const DEFAULT_FORMAT = 'both';
const DEFAULT_PNG_SCALE = 3;
const SUPPORTED_FORMATS = new Set(['svg', 'png', 'both']);
const DEFAULT_BROWSER_PATHS = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/chromium'],
  win32: [
    path.join(process.env.PROGRAMFILES ?? '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
  ],
};

function printUsage() {
  console.log(`Usage:
  pnpm diagram:render -- <input.mmd> [--output-dir <directory>] [--format svg|png|both] [--png-scale <number>]

Defaults:
  --output-dir  The input file's directory
  --format      both
  --png-scale   ${DEFAULT_PNG_SCALE}`);
}

function fail(message) {
  console.error(`Diagram render failed: ${message}`);
  process.exitCode = 1;
}

function getOptionValue(argumentsList, index, optionName) {
  const value = argumentsList[index + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`${optionName} requires a value.`);
  }

  return value;
}

function parseArguments(argumentsList) {
  const options = {
    inputPath: undefined,
    outputDirectory: undefined,
    format: DEFAULT_FORMAT,
    pngScale: DEFAULT_PNG_SCALE,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === '--') {
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      return { help: true };
    }

    if (argument === '--output-dir' || argument === '-o') {
      options.outputDirectory = getOptionValue(argumentsList, index, argument);
      index += 1;
      continue;
    }

    if (argument === '--format') {
      options.format = getOptionValue(argumentsList, index, argument);
      index += 1;
      continue;
    }

    if (argument === '--png-scale') {
      options.pngScale = Number(getOptionValue(argumentsList, index, argument));
      index += 1;
      continue;
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unsupported option "${argument}".`);
    }

    if (options.inputPath) {
      throw new Error('Only one Mermaid input file can be rendered at a time.');
    }

    options.inputPath = argument;
  }

  if (!options.inputPath) {
    throw new Error('An input Mermaid file is required.');
  }

  if (!SUPPORTED_FORMATS.has(options.format)) {
    throw new Error('--format must be svg, png, or both.');
  }

  if (!Number.isFinite(options.pngScale) || options.pngScale <= 0) {
    throw new Error('--png-scale must be a positive number.');
  }

  return options;
}

async function assertReadableFile(filePath, description) {
  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new Error(`${description} is not readable: ${filePath}`);
  }
}

function getMmdcEntryPoint() {
  const packageEntryPoint = require.resolve('@mermaid-js/mermaid-cli');
  return path.join(path.dirname(packageEntryPoint), 'cli.js');
}

async function findBrowserPath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...(DEFAULT_BROWSER_PATHS[process.platform] ?? []),
  ].filter(Boolean);

  for (const candidatePath of candidates) {
    try {
      await access(candidatePath, constants.X_OK);
      return candidatePath;
    } catch {
      continue;
    }
  }

  return undefined;
}

async function createPuppeteerConfig() {
  const executablePath = await findBrowserPath();
  if (!executablePath) {
    return undefined;
  }

  const directoryPath = await mkdtemp(path.join(tmpdir(), 'company-ai-sdlc-mermaid-'));
  const configPath = path.join(directoryPath, 'puppeteer.config.json');
  await writeFile(configPath, `${JSON.stringify({ executablePath })}\n`, 'utf8');
  return { directoryPath, configPath };
}

async function renderFormat({ inputPath, outputPath, pngScale, puppeteerConfigPath }) {
  const argumentsList = [
    '-i',
    inputPath,
    '-o',
    outputPath,
    '-c',
    CONFIG_PATH,
  ];

  if (puppeteerConfigPath) {
    argumentsList.push('-p', puppeteerConfigPath);
  }

  if (path.extname(outputPath) === '.png') {
    argumentsList.push('-s', String(pngScale));
  }

  try {
    await execFileAsync(process.execPath, [getMmdcEntryPoint(), ...argumentsList], {
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const details = [error.stderr, error.stdout, error.message]
      .filter((value) => typeof value === 'string' && value.length > 0)
      .join('\n')
      .trim();
    throw new Error(details || `Unable to render ${outputPath}.`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const inputPath = path.resolve(CALLER_DIRECTORY, options.inputPath);
  if (path.extname(inputPath).toLowerCase() !== '.mmd') {
    throw new Error('The input file must use the .mmd extension.');
  }

  await assertReadableFile(inputPath, 'Input file');
  await assertReadableFile(CONFIG_PATH, 'Mermaid configuration');

  const outputDirectory = path.resolve(
    CALLER_DIRECTORY,
    options.outputDirectory ?? path.dirname(inputPath),
  );
  await mkdir(outputDirectory, { recursive: true });

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPaths = [];

  if (options.format === 'svg' || options.format === 'both') {
    outputPaths.push(path.join(outputDirectory, `${baseName}.svg`));
  }

  if (options.format === 'png' || options.format === 'both') {
    outputPaths.push(path.join(outputDirectory, `${baseName}.png`));
  }

  const puppeteerConfig = await createPuppeteerConfig();

  try {
    for (const outputPath of outputPaths) {
      await renderFormat({
        inputPath,
        outputPath,
        pngScale: options.pngScale,
        puppeteerConfigPath: puppeteerConfig?.configPath,
      });
      console.log(`Created ${outputPath}`);
    }
  } finally {
    if (puppeteerConfig) {
      await rm(puppeteerConfig.directoryPath, { force: true, recursive: true });
    }
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
