import * as acorn from 'acorn';

export interface SyntaxErrorDetails {
  message: string;
  line: number; // 1-indexed
  column: number; // 0-indexed
  severity: 'error' | 'warning';
}

interface Bracket {
  char: string;
  line: number;
  col: number;
  pos: number;
}

/**
 * Checks for matched parentheses, square brackets, and curly braces.
 * Ignores strings (single, double, and backticks) and comments (single line and block).
 */
export function checkBracketMatching(code: string): { error: string; line: number; col: number; pos: number } | null {
  const stack: Bracket[] = [];
  let line = 1;
  let col = 0;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    if (char === '\n') {
      line++;
      col = 0;
      continue;
    }
    col++;
    
    // Ignore line comments
    if (char === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') {
        i++;
      }
      line++;
      col = 0;
      continue;
    }
    
    // Ignore block comments
    if (char === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') {
          line++;
          col = 0;
        } else {
          col++;
        }
        i++;
      }
      i++; // skip /
      continue;
    }
    
    // Ignore single quote strings
    if (char === "'") {
      i++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\\') i++; // escape
        if (code[i] === '\n') {
          line++;
          col = 0;
        } else {
          col++;
        }
        i++;
      }
      continue;
    }
    
    // Ignore double quote strings
    if (char === '"') {
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') i++; // escape
        if (code[i] === '\n') {
          line++;
          col = 0;
        } else {
          col++;
        }
        i++;
      }
      continue;
    }
    
    // Ignore template literals (backticks)
    if (char === '`') {
      i++;
      while (i < code.length && code[i] !== '`') {
        if (code[i] === '\\') i++; // escape
        if (code[i] === '\n') {
          line++;
          col = 0;
        } else {
          col++;
        }
        i++;
      }
      continue;
    }
    
    // Check brackets
    if (char === '{' || char === '(' || char === '[') {
      stack.push({ char, line, col: col - 1, pos: i });
    } else if (char === '}' || char === ')' || char === ']') {
      if (stack.length === 0) {
        return {
          error: `Unmatched closing bracket '${char}'`,
          line,
          col: col - 1,
          pos: i
        };
      }
      const last = stack.pop()!;
      if (
        (char === '}' && last.char !== '{') ||
        (char === ')' && last.char !== '(') ||
        (char === ']' && last.char !== '[')
      ) {
        return {
          error: `Mismatched closing bracket '${char}' for opening '${last.char}'`,
          line,
          col: col - 1,
          pos: i
        };
      }
    }
  }
  
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return {
      error: `Unclosed opening bracket '${last.char}'`,
      line: last.line,
      col: last.col,
      pos: last.pos
    };
  }
  
  return null;
}

/**
 * Preprocesses TS / JSX code so it can be parsed by acorn as valid ES6.
 * Replaces TS annotations, types, interfaces, and JSX with empty spaces/brackets to preserve original character positions.
 */
function preprocessCodeForAcorn(code: string): string {
  let clean = code;
  
  // 1. Strip imports
  clean = clean.replace(/import\s+[^;]+;/g, (match) => ' '.repeat(match.length));
  
  // 2. Strip exports of interface/type
  clean = clean.replace(/export\s+interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, (match) => ' '.repeat(match.length));
  clean = clean.replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, (match) => ' '.repeat(match.length));
  clean = clean.replace(/export\s+type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, (match) => ' '.repeat(match.length));
  clean = clean.replace(/type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, (match) => ' '.repeat(match.length));
  
  // 3. Strip common TS type annotations like ": string", ": Video[]", ": Record<string, boolean>", etc.
  clean = clean.replace(/:\s*(?:string|number|boolean|any|void|string\[\]|number\[\]|Video|Comment|Creator|Record<[^>]+>)/g, (match) => ' '.repeat(match.length));
  
  // 4. Strip "as string" or "as any"
  clean = clean.replace(/\s+as\s+(?:string|number|boolean|any|void)/g, (match) => ' '.repeat(match.length));

  // 5. Replace JSX tags with valid JS brackets and values to preserve positions
  // Self-closing tags: <Foo x="y" /> -> null
  clean = clean.replace(/<[A-Za-z0-9_.]+(?:\s+[a-zA-Z0-9_-]+(?:=(?:{[^}]+}|"[^"]*"|'[^']*'|[a-zA-Z0-9_]+))?)*\s*\/>/g, (match) => 'null' + ' '.repeat(match.length - 4));
  // Opening tags: <div ...> -> (
  clean = clean.replace(/<[A-Za-z0-9_.]+(?:\s+[a-zA-Z0-9_-]+(?:=(?:{[^}]+}|"[^"]*"|'[^']*'|[a-zA-Z0-9_]+))?)*\s*>/g, (match) => '(' + ' '.repeat(match.length - 1));
  // Closing tags: </div> -> )
  clean = clean.replace(/<\/[A-Za-z0-9_.]+\s*>/g, (match) => ')' + ' '.repeat(match.length - 1));

  return clean;
}

/**
 * Parses the file content in real-time and returns syntax errors if found.
 */
export function checkFileSyntax(filePath: string, content: string): SyntaxErrorDetails | null {
  if (!content.trim()) return null;

  // 1. Check JSON files
  if (filePath.endsWith('.json')) {
    try {
      JSON.parse(content);
      return null;
    } catch (e: any) {
      const message = e.message || 'JSON Syntax Error';
      // Try to extract position
      const match = message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        const lines = content.substring(0, pos).split('\n');
        return {
          message: message.replace(/at position \d+/, '').trim(),
          line: lines.length,
          column: lines[lines.length - 1].length,
          severity: 'error'
        };
      }
      return {
        message,
        line: 1,
        column: 0,
        severity: 'error'
      };
    }
  }

  // 2. Bracket matching check for JS/TS/JSX/TSX (highly accurate)
  const bracketError = checkBracketMatching(content);
  if (bracketError) {
    return {
      message: bracketError.error,
      line: bracketError.line,
      column: bracketError.col,
      severity: 'error'
    };
  }

  // 3. Acorn parsing check for deeper ES syntax errors
  try {
    const preprocessed = preprocessCodeForAcorn(content);
    acorn.parse(preprocessed, {
      ecmaVersion: 'latest',
      sourceType: 'module'
    });
    return null;
  } catch (e: any) {
    if (e.loc) {
      return {
        message: e.message.replace(/\(\d+:\d+\)$/, '').trim(),
        line: e.loc.line,
        column: e.loc.column,
        severity: 'error'
      };
    }
    return null;
  }
}
