const TOKEN_TYPE = require('./constent')

//###############################################################################
//#                                                                             #
//#  PARSER                                                                     #
//#                                                                             #
//###############################################################################

class AST {}

class BinOp {
  constructor(left, op, right) {
    this.left = left
    this.token = this.op = op
    this.right = right
  }
}

class Num {
  constructor(token) {
    this.token = token
    this.value = token.value
  }
}

class UnaryOp {
  constructor(op, expr) {
    this.token = this.op = op
    this.expr = expr
  }
}

class Compound {
  constructor() {
    this.children = []
  }
}

class Assign {
  constructor(left, op, right) {
    this.left = left
    this.token = this.op = op
    this.right = right
  }
}

class Var {
  constructor(token) {
    this.token = token
    this.value = token.value
  }
}

class NoOp {}

class Program {
  constructor(name, block) {
    this.name = name
    this.block = block
  }
}

class Block {
  constructor(declarations, compoundStatement) {
    this.declarations = declarations
    this.compoundStatement = compoundStatement
  }
}

class VarDecl {
  constructor(varNode, typeNode) {
    this.varNode = varNode
    this.typeNode = typeNode
  }
}

class ProcedureDecl {
  constructor(procName, blockNode) {
    this.procName = procName
    this.blockNode = blockNode
  }
}

class Type {
  constructor(token) {
    this.token = token
    this.value = token.value
  }
}

// Parser tokens => code
class Parser {
  constructor(lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }

  error() {
    throw Error('Invalid character')
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error()
    }
  }

  program() {
    // program : PROGRAM variable SEMI block DOT
    this.eat(TOKEN_TYPE.PROGRAM)
    const varNode = this.variable()
    const progName = varNode.value
    this.eat(TOKEN_TYPE.SEMI)
    const blockNode = this.block()
    const programNode = new Program(progName, blockNode)
    this.eat(TOKEN_TYPE.DOT)
    return programNode
  }

  block() {
    // block : declarations compound_statement
    const declarationNodes = this.declarations()
    const compoundStatementNode = this.compoundStatement()
    const node = new Block(declarationNodes, compoundStatementNode)
    return node
  }

  declarations() {
    /* declarations : VAR (variable_declaration SEMI)+
     *   | empty
     */
    const declarations = []
    if (this.currentToken.type == TOKEN_TYPE.VAR) {
      this.eat(TOKEN_TYPE.VAR)
      while (this.currentToken.type == TOKEN_TYPE.ID) {
        const varDecl = this.variableDeclaration()
        declarations.push(...varDecl)
        this.eat(TOKEN_TYPE.SEMI)
      }
    }

    while (this.currentToken.type === TOKEN_TYPE.PROCEDURE) {
      this.eat(TOKEN_TYPE.PROCEDURE)
      const procName = this.currentToken.value
      this.eat(TOKEN_TYPE.ID)
      this.eat(TOKEN_TYPE.SEMI)
      const blockNode = this.block()
      const procDecl = new ProcedureDecl(procName, blockNode)
      declarations.push(procDecl)
      this.eat(TOKEN_TYPE.SEMI)
    }
    return declarations
  }

  variableDeclaration() {
    // variable_declaration : ID (COMMA ID)* COLON type_spec
    const varNodes = [new Var(this.currentToken)]
    this.eat(TOKEN_TYPE.ID)
    while (this.currentToken.type === TOKEN_TYPE.COMMA) {
      this.eat(TOKEN_TYPE.COMMA)
      varNodes.push(new Var(this.currentToken))
      this.eat(TOKEN_TYPE.ID)
    }

    this.eat(TOKEN_TYPE.COLON)
    const typeNode = this.typeSpec()

    const varDeclarations = []

    for (const varNode of varNodes) {
      varDeclarations.push(new VarDecl(varNode, typeNode))
    }

    return varDeclarations
  }

  typeSpec() {
    /**
     *  type_spec : INTEGER
     *            | REAL
     */
    const t = this.currentToken
    if (this.currentToken.type === TOKEN_TYPE.INTEGER) {
      this.eat(TOKEN_TYPE.INTEGER)
    } else {
      this.eat(TOKEN_TYPE.REAL)
    }
    return new Type(t)
  }

  factor() {
    const token = this.currentToken
    if (token.type == TOKEN_TYPE.PLUS) {
      this.eat(TOKEN_TYPE.PLUS)
      const node = new UnaryOp(token, this.factor())
      return node
    } else if (token.type == TOKEN_TYPE.MINUS) {
      this.eat(TOKEN_TYPE.MINUS)
      const node = new UnaryOp(token, this.factor())
      return node
    } else if (token.type === TOKEN_TYPE.INTEGER_CONST) {
      this.eat(TOKEN_TYPE.INTEGER_CONST)
      return new Num(token)
    } else if (token.type === TOKEN_TYPE.REAL_CONST) {
      this.eat(TOKEN_TYPE.REAL_CONST)
      return new Num(token)
    } else if (token.type === TOKEN_TYPE.LPAREN) {
      this.eat(TOKEN_TYPE.LPAREN)
      const node = this.expr()
      this.eat(TOKEN_TYPE.RPAREN)
      return node
    } else {
      const node = this.variable()
      return node
    }
  }

  term() {
    // term : factor ((MUL | DIV) factor)*
    let node = this.factor()

    while (
      this.currentToken.type === TOKEN_TYPE.MUL ||
      this.currentToken.type === TOKEN_TYPE.INTEGER_DIV ||
      this.currentToken.type === TOKEN_TYPE.FLOAT_DIV
    ) {
      const token = this.currentToken
      if (token.type === TOKEN_TYPE.MUL) {
        this.eat(TOKEN_TYPE.MUL)
      } else if (token.type === TOKEN_TYPE.INTEGER_DIV) {
        this.eat(TOKEN_TYPE.INTEGER_DIV)
      } else if (token.type === TOKEN_TYPE.FLOAT_DIV) {
        this.eat(TOKEN_TYPE.FLOAT_DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }

  expr() {
    /**
     *  expr   : term ((PLUS | MINUS) term)*
     *  term   : factor ((MUL | DIV) factor)*
     *  factor : INTEGER | LPAREN expr RPAREN
     */
    let node = this.term()
    while (
      this.currentToken.type === TOKEN_TYPE.PLUS ||
      this.currentToken.type === TOKEN_TYPE.MINUS
    ) {
      const token = this.currentToken
      if (token.type === TOKEN_TYPE.PLUS) {
        this.eat(TOKEN_TYPE.PLUS)
        // result = result + this.term()
      } else if (token.type === TOKEN_TYPE.MINUS) {
        this.eat(TOKEN_TYPE.MINUS)
        // result = result - this.term()
      }
      node = new BinOp(node, token, this.term())
    }

    return node
  }

  empty() {
    return new NoOp()
  }

  variable() {
    const node = new Var(this.currentToken)
    this.eat(TOKEN_TYPE.ID)
    return node
  }

  assignmentStatement() {
    const left = this.variable()
    const token = this.currentToken
    this.eat(TOKEN_TYPE.ASSIGN)
    const right = this.expr()
    const node = new Assign(left, token, right)
    return node
  }

  statement() {
    let node
    if (this.currentToken.type === TOKEN_TYPE.BEGIN) {
      node = this.compoundStatement()
    } else if (this.currentToken.type === TOKEN_TYPE.ID) {
      node = this.assignmentStatement()
    } else {
      node = this.empty()
    }
    return node
  }

  statementList() {
    const node = this.statement()
    const results = [node]

    while (this.currentToken.type === TOKEN_TYPE.SEMI) {
      this.eat(TOKEN_TYPE.SEMI)
      results.push(this.statement())
    }

    if (this.currentToken.type === TOKEN_TYPE.ID) {
      this.error()
    }

    return results
  }

  compoundStatement() {
    this.eat(TOKEN_TYPE.BEGIN)
    const nodes = this.statementList()
    this.eat(TOKEN_TYPE.END)
    const root = new Compound()
    for (let node of nodes) {
      root.children.push(node)
    }
    return root
  }

  parse() {
    const node = this.program()
    if (this.currentToken.type !== TOKEN_TYPE.EOF) {
      return this.error()
    }
    return node
  }
}

module.exports = Parser
