import { Component } from '@angular/core';

@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss',
})
export class LegendComponent {
  operators = [
    {
      symbol: '~',
      name: 'NOT (Negation)',
      description: 'True when operand is false',
    },
    {
      symbol: '&',
      name: 'AND (Conjunction)',
      description: 'True when both operands are true',
    },
    {
      symbol: '|',
      name: 'OR (Disjunction)',
      description: 'True when at least one operand is true',
    },
    {
      symbol: '^',
      name: 'XOR (Exclusive OR)',
      description: 'True when operands have different truth values',
    },
    {
      symbol: '->',
      name: 'IF (Implication)',
      description: 'False only when first is true and second is false',
    },
    {
      symbol: '<->',
      name: 'IF AND ONLY IF (Biconditional)',
      description: 'True when both operands have the same truth value',
    },
  ];
}
