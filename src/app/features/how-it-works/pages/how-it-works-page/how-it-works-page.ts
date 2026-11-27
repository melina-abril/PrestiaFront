import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works-page',
  imports: [RouterLink],
  templateUrl: './how-it-works-page.html',
  styleUrl: './how-it-works-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksPage {}
