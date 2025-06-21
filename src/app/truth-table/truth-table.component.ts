import { Component, computed, input } from '@angular/core';

type TruthValue = "T" | "F";
type TableRow = Record<string, TruthValue>;

@Component({
  selector: 'app-truth-table',
  standalone: true,
  imports: [],
  templateUrl: './truth-table.component.html',
  styleUrl: './truth-table.component.scss',
})
export class TruthTableComponent {
  expression = input.required<string>();
  vars = computed(() => {
    const chars = this.expression().split('');
    const uniqueVars = new Set<string>(
      chars.filter((c) => c.match(/[a-zA-Z]/))
    );
    return Array.from(uniqueVars).sort();
  });
  rows = computed<TableRow[]>(() => {
    return this.combinationsOf(this.vars());
  })

  combinationsOf(cols: string[]): TableRow[] {
    const [first, ...rest] = cols;
    if (cols.length <= 0) return [];
    if (cols.length === 1) return [{ [first]: "T"}, {[first]: "F"}];

    return [
      ...this.combinationsOf(rest).map(c => ({ [first]: "T" as TruthValue, ...c })),
      ...this.combinationsOf(rest).map(c => ({ [first]: "F" as TruthValue, ...c })),
    ]
  }
}
