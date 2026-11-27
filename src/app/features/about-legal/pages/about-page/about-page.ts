import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIVACY_POLICY } from '../../models/privacy-policy';
import { LEGAL_DOCUMENTS } from '../../models/legal-documents';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly documents = LEGAL_DOCUMENTS;
  protected readonly preview = PRIVACY_POLICY;
}
