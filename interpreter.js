const TOKEN_TYPE = require('./constent')

//###############################################################################
//#                                                                             #
//#  INTERPRETER                                                                #
//#                                                                             #
//###############################################################################

class NodeVisitor {
  getNodeName(node) {
    return node.__proto__.constructor.name
  }

  genericVisit(node) {
    throw Error(`No visit_${this.getNodeName(node)} method`)
  }

  visit(node) {
    const method_name = 'visit_' + this.getNodeName(node)
    const visitor = this[method_name] || this.genericVisit(node)
    return visitor(node)
  }
}

class Interpreter extends NodeVisitor {
  constructor(tree) {
    super()
    this.tree = tree
    this.GLOBAL_SCOPE = {}
    this.visit_Program = this.visit_Program.bind(this)
    this.visit_Block = this.visit_Block.bind(this)
    this.visit_VarDecl = this.visit_VarDecl.bind(this)
    this.visit_Type = this.visit_Type.bind(this)
    this.visit_BinOp = this.visit_BinOp.bind(this)
    this.visit_Num = this.visit_Num.bind(this)
    this.visit_UnaryOp = this.visit_UnaryOp.bind(this)
    this.visit_Compound = this.visit_Compound.bind(this)
    this.visit_Assign = this.visit_Assign.bind(this)
    this.visit_Var = this.visit_Var.bind(this)
    this.visit_NoOp = this.visit_NoOp.bind(this)
  }

  visit_Program(node) {
    this.visit(node.block)
  }

  visit_Block(node) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }

    this.visit(node.compoundStatement)
  }

  visit_VarDecl(node) {
    return null
  }

  visit_Type(node) {
    return null
  }

  visit_BinOp(node) {
    if (node.op.type === TOKEN_TYPE.PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (node.op.type === TOKEN_TYPE.MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (node.op.type === TOKEN_TYPE.MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (node.op.type === TOKEN_TYPE.INTEGER_DIV) {
      return this.visit(node.left) / this.visit(node.right)
    } else if (node.op.type === TOKEN_TYPE.FLOAT_DIV) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }

  visit_Num(node) {
    return node.value
  }

  visit_UnaryOp(node) {
    const op = node.op.type
    if (op === TOKEN_TYPE.PLUS) {
      return +this.visit(node.expr)
    } else if (op === TOKEN_TYPE.MINUS) {
      return -this.visit(node.expr)
    }
  }

  visit_Compound(node) {
    for (let child of node.children) {
      if (child) {
        this.visit(child)
      }
    }
  }

  visit_Assign(node) {
    const var_name = node.left.value
    this.GLOBAL_SCOPE[var_name] = this.visit(node.right)
  }

  visit_Var(node) {
    const var_name = node.value
    const val = this.GLOBAL_SCOPE[var_name]
    if (!val) {
      throw Error(`no value ${var_name}`)
    }
    return val
  }

  visit_NoOp(node) {
    return null
  }

  visit_ProcedureDecl(node) {
    return null
  }

  interpret() {
    const tree = this.tree
    if (!tree) {
      return ''
    }
    return this.visit(tree)
  }
}

module.exports = { NodeVisitor, Interpreter }
