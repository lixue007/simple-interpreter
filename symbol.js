//###############################################################################
//#                                                                             #
//#  SYMBOLS and SYMBOL TABLE                                                   #
//#                                                                             #
//###############################################################################
const { NodeVisitor } = require('./interpreter')

class Symbol {
  constructor(name, type = null) {
    this.name = name
    this.type = type
  }
}

class VarSymbol extends Symbol {
  constructor(name, type) {
    super(name, type)
  }

  str() {
    return `<${this.name}:${this.type}>`
  }
}

class BuiltinTypeSymbol extends Symbol {
  constructor(name) {
    super(name)
  }

  str() {
    return this.name
  }
}

class SymbolTable {
  constructor() {
    this.symbols = {}
    this.initBuiltins()
  }

  initBuiltins() {
    this.define(new BuiltinTypeSymbol('INTEGER'))
    this.define(new BuiltinTypeSymbol('REAL'))
  }

  str() {
    return `Symbols:${JSON.stringify(this.symbols)}`
  }

  define(symbol) {
    // console.log('Define: ', symbol)
    this.symbols[symbol.name] = symbol
  }

  lookup(name) {
    // console.log('Lookup: ', name)
    return this.symbols[name]
  }
}

class SymbolTableBuilder extends NodeVisitor {
  constructor() {
    super()
    this.symtab = new SymbolTable()
    this.visit_Program = this.visit_Program.bind(this)
    this.visit_Block = this.visit_Block.bind(this)
    this.visit_VarDecl = this.visit_VarDecl.bind(this)
    this.visit_BinOp = this.visit_BinOp.bind(this)
    this.visit_Num = this.visit_Num.bind(this)
    this.visit_UnaryOp = this.visit_UnaryOp.bind(this)
    this.visit_Compound = this.visit_Compound.bind(this)
    this.visit_Assign = this.visit_Assign.bind(this)
    this.visit_Var = this.visit_Var.bind(this)
    this.visit_NoOp = this.visit_NoOp.bind(this)
  }

  visit_Block(node) {
    for (let declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }

  visit_Program(node) {
    this.visit(node.block)
  }

  visit_BinOp(node) {
    this.visit(node.left)
    this.visit(node.right)
  }

  visit_Num(node) {
    return null
  }

  visit_UnaryOp(node) {
    this.visit(node.expr)
  }

  visit_Compound(node) {
    for (let child of node.children) {
      this.visit(child)
    }
  }

  visit_NoOp(node) {
    return null
  }

  visit_VarDecl(node) {
    const typeName = node.typeNode.value
    const typeSymbol = this.symtab.lookup(typeName)
    const varName = node.varNode.value
    const varSymbol = new VarSymbol(varName, typeSymbol)
    this.symtab.define(varSymbol)
  }

  visit_Assign(node) {
    const varName = node.left.value
    const varSymbol = this.symtab.lookup(varName)
    if (!varSymbol) {
      throw Error(`${varName} has not current symbol`)
    }
    this.visit(node.right)
  }

  visit_Var(node) {
    const varName = node.value
    const varSymbol = this.symtab.lookup(varName)
    if (!varSymbol) {
      throw Error(`${varName} has not current symbol`)
    }
  }
}

module.exports = { SymbolTableBuilder }