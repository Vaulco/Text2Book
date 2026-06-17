import {
  CommandTarget,
  GenerationFormat,
  IBookParameters,
  JavaVersion,
  MinecraftCharacter,
  MinecraftVersion,
} from '../global/types';
import glyphs from '../data/glyphs.json';
import createStringWrapper from './createStringWrapper';

function createCharacterLexicon() {
  const characterLexicon: MinecraftCharacter[] = [];
  for (const glyph of glyphs) {
    characterLexicon.push({ char: glyph.char, pixels: glyph.pixels });
  }
  return characterLexicon;
}

function escapeCharacters(
  inputText: string,
  generationFormat: GenerationFormat,
  javaVersion: JavaVersion
): string {
  if (generationFormat === 'text') {
    return inputText.trim();
  }

  const escapedText = inputText
    .replace(/"/g, '\\\\"')
    .replace(/'/g, "\\'")
    .trim();

  const newlineEscape = javaVersion === '1.21.5+' ? '\\n' : '\\\\n';

  return escapedText.replace(/\n/g, newlineEscape);
}

function encapsulateText(
  inputText: string,
  generationFormat: GenerationFormat,
  javaVersion: JavaVersion
) {
  if (generationFormat === 'text') return inputText;

  if (javaVersion === '1.13+') {
    return `"{\\"text\\":\\"${inputText}\\"}"`;
  } else if (javaVersion === '1.14+' || javaVersion === '1.20.5+') {
    return `'["${inputText}"]'`;
  } else if (javaVersion === '1.21.5+') {
    return `"${inputText}"`;
  }

  return '';
}

function finalizeBook(
  pages: string[],
  title: string,
  author: string,
  nameSuffix: string,
  generationFormat: GenerationFormat,
  minecraftVersion: MinecraftVersion,
  javaVersion: JavaVersion,
  booksCounter: number
): string {
  const suffix = nameSuffix.replace('[n]', booksCounter.toString());
  const titleWithSuffix = title + suffix;

  if (generationFormat === 'commands') {
    if (minecraftVersion === 'java') {
      if (javaVersion === '1.13+' || javaVersion === '1.14+') {
        return `/give @p written_book{pages:[${pages.join(',')}],title:"${titleWithSuffix}",author:"${author}"}`;
      } else if (javaVersion === '1.20.5+' || javaVersion === '1.21.5+') {
        return `/give @p written_book[minecraft:written_book_content={pages:[${pages.join(',')}],title:"${titleWithSuffix}",author:"${author}"}]`;
      }
    } else if (minecraftVersion === 'bedrock') {
      return `/give @p written_book[minecraft:written_book_content={pages:[${pages.join(',')}],title:"${titleWithSuffix}",author:"${author}"}]`;
    }
  } else if (generationFormat === 'text') {
    return pages.join('\n\n--- page break ---\n\n');
  }

  return '';
}

function padChapterBreaks(lines: string[], linesPerPage: number): string[] {
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('Chapter') && result.length > 0) {
      const remainder = result.length % linesPerPage;
      if (remainder !== 0) {
        const paddingNeeded = linesPerPage - remainder;
        for (let j = 0; j < paddingNeeded; j++) {
          result.push('');
        }
      }
    }

    result.push(line);
  }

  return result;
}

function createBook(
  lines: string[],
  linesPerPage: number,
  title: string,
  author: string,
  nameSuffix: string,
  generationFormat: GenerationFormat,
  minecraftVersion: MinecraftVersion,
  javaVersion: JavaVersion,
  booksCounter: number
) {
  let counter = 0;
  let workerLine = '';
  const pages: string[] = [];

  lines.forEach((line) => {
    workerLine += line + '\n';
    counter++;

    if (counter === linesPerPage) {
      const escapedText = escapeCharacters(workerLine, generationFormat, javaVersion);
      const page = encapsulateText(escapedText, generationFormat, javaVersion);

      workerLine = '';
      counter = 0;

      pages.push(page);
    }
  });

  if (workerLine.length > 0) {
    const escapedText = escapeCharacters(workerLine, generationFormat, javaVersion);
    const page = encapsulateText(escapedText, generationFormat, javaVersion);
    pages.push(page);
  }

  return finalizeBook(
    pages,
    title,
    author,
    nameSuffix,
    generationFormat,
    minecraftVersion,
    javaVersion,
    booksCounter
  );
}

function calculateLineLimit(
  linesPerPage: number,
  generationFormat: GenerationFormat,
  minecraftVersion: MinecraftVersion
): number {
  if (generationFormat === 'commands') {
    return minecraftVersion === 'bedrock' ? linesPerPage * 50 : linesPerPage * 100;
  } else if (generationFormat === 'text') {
    return linesPerPage;
  }
  return 0;
}

function getCharacterLimitFromCommandTarget(target: CommandTarget) {
  if (target === 'player') {
    return 256;
  } else if (target === 'commandblock') {
    return 32500;
  } else {
    return 0;
  }
}

function createBookGenerator({
  generationFormat,
  minecraftVersion,
  title,
  author,
  linesPerPage = 14,
  nameSuffix = '',
  javaVersion,
  text,
  commandTarget,
}: IBookParameters) {
  const lineLimit = calculateLineLimit(linesPerPage, generationFormat, minecraftVersion);
  const lexicon = createCharacterLexicon();
  const stringWrapper = createStringWrapper(lexicon);
  const lines = stringWrapper.getSplitString(text);
  const paddedLines = padChapterBreaks(lines, linesPerPage);

  const library = [];
  let booksCounter = 0;
  let startIndex = 0;
  let indexOffset = 0;

  while (startIndex < paddedLines.length) {
    const endIndex = Math.min(startIndex + lineLimit - indexOffset, paddedLines.length);
    const splicedLines = paddedLines.slice(startIndex, endIndex);

    const book = createBook(
      splicedLines,
      linesPerPage,
      title,
      author,
      nameSuffix,
      generationFormat,
      minecraftVersion,
      javaVersion,
      booksCounter
    );

    if (book.length > getCharacterLimitFromCommandTarget(commandTarget)) {
      indexOffset++;
      continue;
    }

    library.push(book);

    startIndex = endIndex;
    indexOffset = 0;
    booksCounter++;
  }

  return {
    book: library,
    unsupportedCharacters: [...new Set(stringWrapper.unsupportedCharacters)],
  };
}

export default createBookGenerator;