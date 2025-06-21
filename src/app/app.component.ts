import { Component, signal } from '@angular/core';
import { TruthTableComponent } from './truth-table/truth-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [TruthTableComponent]
})
export class AppComponent {
  title = 'truth-table-gen';
  expression = signal('');

  updateExpression(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.expression.set(target.value);
  }
}
