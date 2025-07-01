import { Injectable } from '@angular/core';
import { TruthValues } from '../../truth-table/truth-table.component';

const operatorPrecedence = {
  '&': 4,
  '^': 3,
  '|': 2,
  '->': 1,
  '<->': 0,
};

type Operator = keyof typeof operatorPrecedence;

function isOperator(symbol: string): symbol is Operator {
  return symbol in operatorPrecedence;
}

interface BaseNode {
  type: 'var' | 'operator' | 'negation';
  children: (BaseNode | null)[] | null;
}

interface VarNode extends BaseNode {
  type: 'var';
  children: null;
  var: string;
}

interface OperatorNode extends BaseNode {
  type: 'operator';
  children: [AstNode, AstNode];
  operator: Operator;
}

interface NegationNode extends BaseNode {
  type: 'negation';
  children: [AstNode];
}

type AstNode = VarNode | OperatorNode | NegationNode | null;

type ParseResult = [AstNode, string[]];

class ParseError extends Error {
  constructor(message: string, public index: number) {
    super(message);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EvalService {
  constructor() {}

  evaluateExpression(expression: string, truthValues: TruthValues): boolean {
    const tokens = this.tokenize(expression);
    const [root] = this.parse(null, tokens);
    return this.evaluateAst(root, truthValues);
  }

  private tokenize(expression: string): string[] {
    const tokens = [];
    let level = 0;
    let group = '';
    for (let i = 0; i < expression.length; i++) {
      const symbol = expression[i];
      if (symbol.match(/\s/)) {
        continue;
      } else if (symbol === '(') {
        level++;
      } else if (symbol === ')') {
        level--;
        if (level === 0) {
          group += symbol;
          tokens.push(group);
          group = '';
          continue;
        }
      }

      if (level > 0) {
        group += symbol;
        continue;
      }

      if (symbol === '-') {
        i++;
        if (expression[i] !== '>') {
          throw new ParseError('Expected >', i);
        }
        tokens.push('->');
      } else if (symbol === '<') {
        i++;
        if (expression[i] !== '-') {
          throw new ParseError('Expected -', i);
        }
        i++;
        if (expression[i] !== '>') {
          throw new ParseError('Expected >', i);
        }
        tokens.push('<->');
      } else {
        tokens.push(symbol);
      }
    }
    return tokens;
  }

  private parse(
    root: AstNode,
    tokens: string[],
    precedence: number = 0
  ): ParseResult {
    const [first] = tokens;
    if (tokens.length === 0) {
      return [root, []];
    } else if (first === '~') {
      return this.handleNegation(tokens, precedence);
    } else if (isOperator(first)) {
      return this.handleOperator(
        root,
        tokens as [Operator, ...string[]],
        precedence
      );
    } else {
      return this.handleToken(tokens, precedence);
    }
  }

  private handleNegation(tokens: string[], precedence: number): ParseResult {
    const [_, second, ...rest] = tokens;
    const node: NegationNode = {
      type: 'negation',
      children: [this.parseToken(second)],
    };
    return this.parse(node, rest, precedence);
  }

  private handleOperator(
    root: AstNode,
    tokens: [Operator, ...string[]],
    precedence: number
  ): ParseResult {
    const [first, ...rest] = tokens;
    const currentPrecedence = operatorPrecedence[first];
    if (currentPrecedence < precedence) {
      return [root, tokens];
    }
    const [restNode, leftover] = this.parse(null, rest, currentPrecedence);
    const operatorNode: OperatorNode = {
      type: 'operator',
      operator: first,
      children: [root, restNode],
    };
    return this.parse(operatorNode, leftover);
  }

  private parseToken(token: string): AstNode {
    if (token.startsWith('(')) {
      const innerExpression = token.slice(1, -1);
      const groupTokens = this.tokenize(innerExpression);
      const [groupNode] = this.parse(null, groupTokens);
      return groupNode;
    } else {
      return {
        type: 'var',
        var: token,
        children: null,
      };
    }
  }

  private handleToken(tokens: string[], precedence: number): ParseResult {
    const [token, ...rest] = tokens;

    if (token.startsWith('(')) {
      const innerExpression = token.slice(1, -1);
      const groupTokens = this.tokenize(innerExpression);
      const [groupNode] = this.parse(null, groupTokens);
      return this.parse(groupNode, rest, precedence);
    } else {
      const node: VarNode = {
        type: 'var',
        var: token,
        children: null,
      };
      return this.parse(node, rest, precedence);
    }
  }

  private evaluateAst(root: AstNode, truthValues: TruthValues): boolean {
    if (root === null) {
      return false;
    }

    switch (root.type) {
      case 'var':
        return truthValues[root.var];
      case 'negation':
        const [child] = root.children;
        return !this.evaluateAst(child, truthValues);
      case 'operator':
        const [left, right] = root.children;
        const leftValue = this.evaluateAst(left, truthValues);
        const rightValue = this.evaluateAst(right, truthValues);
        switch (root.operator) {
          case '&':
            return leftValue && rightValue;
          case '|':
            return leftValue || rightValue;
          case '->':
            return !leftValue || rightValue;
          case '^':
            return (!leftValue && rightValue) || (leftValue && !rightValue);
          case '<->':
            return leftValue === rightValue;
          default:
            throw new Error('Unsupported Operator');
        }
      default:
        throw new Error('Invalid tree node');
    }
  }
}
