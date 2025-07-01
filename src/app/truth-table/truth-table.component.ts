import { Component, computed, input } from '@angular/core';
import { EvalService } from '../services/eval/eval.service';

export type TruthValues = Record<string, boolean>;

@Component({
  selector: 'app-truth-table',
  standalone: true,
  imports: [],
  templateUrl: './truth-table.component.html',
  styleUrl: './truth-table.component.scss',
})
export class TruthTableComponent {
  constructor(private evalService: EvalService) {}

  expression = input.required<string>();

  vars = computed(() => {
    const chars = this.expression().split('');
    const uniqueVars = new Set<string>(
      chars.filter((c) => c.match(/[a-zA-Z]/))
    );
    return Array.from(uniqueVars).sort();
  });

  rows = computed<TruthValues[]>(() => {
    return this.combinationsOf(this.vars());
  });

  private combinationsOf(cols: string[]): TruthValues[] {
    const [first, ...rest] = cols;
    if (cols.length <= 0) return [];
    if (cols.length === 1) return [{ [first]: false }, { [first]: true }];

    return [
      ...this.combinationsOf(rest).map((c) => ({ [first]: false, ...c })),
      ...this.combinationsOf(rest).map((c) => ({ [first]: true, ...c })),
    ];
  }

  evaluateRow(row: TruthValues): boolean {
    return this.evalService.evaluateExpression(this.expression(), row);
  }
}
