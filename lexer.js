const TOKEN_TYPE = require('./constent')

// 词法分析 code => tokens
//###############################################################################
//#                                                                             #
//#  LEXER                                                                      #
//#                                                                             #
//###############################################################################

function token(type, value) {
  return {
    type,
    value,
  }
}

const RESERVED_KEYWORDS = {
  PROGRAM: token(TOKEN_TYPE.PROGRAM, 'PROGRAM'),
  VAR: token(TOKEN_TYPE.VAR, 'VAR'),
  DIV: token(TOKEN_TYPE.INTEGER_DIV, 'DIV'),
  INTEGER: token(TOKEN_TYPE.INTEGER, 'INTEGER'),
  REAL: token(TOKEN_TYPE.REAL, 'REAL'),
  BEGIN: token(TOKEN_TYPE.BEGIN, 'BEGIN'),
  END: token(TOKEN_TYPE.END, 'END'),
  PROCEDURE: token(TOKEN_TYPE.PROCEDURE, 'PROCEDURE'),
}

class Lexer {
  constructor(text) {
    this.text = text
    this.pos = 0
    this.currentChar = this.text[this.pos]
  }

  error() {
    throw Error('Invalid character')
  }

  advance() {
    this.pos += 1
    if (this.pos > this.text.length - 1) {
      this.currentChar = null
    } else {
      this.currentChar = this.text[this.pos]
    }
  }

  peek() {
    const peek_pos = this.pos + 1
    if (peek_pos > this.text.length - 1) {
      return null
    }
    return this.text[peek_pos]
  }

  skipWhitespace() {
    while (
      this.currentChar !== null &&
      (this.currentChar === ' ' || this.currentChar === '\n')
    ) {
      this.advance()
    }
  }

  skipComment() {
    while (this.currentChar !== '}') {
      this.advance()
    }

    this.advance()
  }

  number() {
    let result = ''

    while (this.currentChar != null && !isNaN(Number(this.currentChar))) {
      result += this.currentChar
      this.advance()
    }

    if (this.currentChar === '.') {
      result += this.currentChar
      this.advance()
      while (this.currentChar != null && !isNaN(Number(this.currentChar))) {
        result += this.currentChar
        this.advance()
      }
      return token('REAL_CONST', Number(result))
    }

    return token('INTEGER_CONST', Number(result))
  }

  _id() {
    let result = ''

    while (this.currentChar != null && /[0-9A-Za-z]/.test(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    const t = RESERVED_KEYWORDS[result.toUpperCase()] || token(TOKEN_TYPE.ID, result)
    return t
  }

  getNextToken() {
    while (this.currentChar != null) {
      if (this.currentChar === ' ' || this.currentChar === '\n') {
        this.skipWhitespace()
        continue
      }

      if (this.currentChar === '{') {
        this.advance()
        this.skipComment()
        continue
      }

      if (/[A-Za-z]/.test(this.currentChar)) {
        return this._id()
      }

      if (!isNaN(Number(this.currentChar))) {
        return this.number()
      }

      if (this.currentChar === ':' && this.peek() === '=') {
        this.advance()
        this.advance()
        return token(TOKEN_TYPE.ASSIGN, ':=')
      }

      if (this.currentChar === ';') {
        this.advance()
        return token(TOKEN_TYPE.SEMI, ';')
      }

      if (this.currentChar === ':') {
        this.advance()
        return token(TOKEN_TYPE.COLON, ':')
      }

      if (this.currentChar === ',') {
        this.advance()
        return token(TOKEN_TYPE.COMMA, ',')
      }

      if (this.currentChar === '+') {
        this.advance()
        return token(TOKEN_TYPE.PLUS, '+')
      }

      if (this.currentChar === '-') {
        this.advance()
        return token(TOKEN_TYPE.MINUS, '-')
      }

      if (this.currentChar === '*') {
        this.advance()
        return token(TOKEN_TYPE.MUL, '*')
      }

      if (this.currentChar === '/') {
        this.advance()
        return token(TOKEN_TYPE.FLOAT_DIV, '/')
      }

      if (this.currentChar === '(') {
        this.advance()
        return token(TOKEN_TYPE.LPAREN, '(')
      }

      if (this.currentChar === ')') {
        this.advance()
        return token(TOKEN_TYPE.RPAREN, ')')
      }

      if (this.currentChar === '.') {
        this.advance()
        return token(TOKEN_TYPE.DOT, '.')
      }

      this.error()
    }
    return token(TOKEN_TYPE.EOF, null)
  }
}

module.exports = Lexer
