import { Component, signal } from '@angular/core';
import { TruthTableComponent } from './truth-table/truth-table.component';
import { LegendComponent } from './legend/legend.component';
import { CardComponent } from "./card/card.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [TruthTableComponent, LegendComponent, CardComponent],
})
export class AppComponent {
  title = 'truth-table-gen';
  expression = signal('a & b');

  updateExpression(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.expression.set(target.value);
  }
}
