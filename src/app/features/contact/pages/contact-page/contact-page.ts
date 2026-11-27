import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ContactService } from '../../data-access/contact.service';
import { CONTACT_REASONS, ContactReason, ContactRequest } from '../../models/contact.models';

type ContactField = 'name' | 'email' | 'phone' | 'reason' | 'message' | 'privacyAccepted';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly contactService = inject(ContactService);
  protected readonly reasons = CONTACT_REASONS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', Validators.pattern(/^$|^\+?[0-9]{9,15}$/)],
    reason: ['' as ContactReason | '', Validators.required],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
    privacyAccepted: [false, Validators.requiredTrue],
    web: [''],
  });
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly submitError = signal<string | null>(null);
  private readonly fieldErrors = signal<Record<string, string[]>>({});

  protected errorFor(field: ContactField): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    const serverError = this.fieldErrors()[field]?.[0];
    if (serverError) return serverError;
    if (!control.errors) return '';
    if (control.hasError('requiredTrue')) return 'Acepta la política de privacidad.';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (control.hasError('pattern')) return 'Usa entre 9 y 15 dígitos, con un signo + inicial opcional.';
    if (control.hasError('minlength')) return field === 'message' ? 'Usa al menos 20 caracteres.' : 'Usa al menos 2 caracteres.';
    if (control.hasError('maxlength')) return field === 'message' ? 'Usa hasta 1.000 caracteres.' : 'El texto es demasiado largo.';
    return 'Revisa este campo.';
  }

  protected clearFieldError(field: ContactField): void {
    this.fieldErrors.update((errors) => {
      const updated = { ...errors };
      delete updated[field];
      return updated;
    });
    this.sent.set(false);
  }

  protected submit(): void {
    if (this.sending()) return;
    this.sent.set(false);
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.reason || !value.privacyAccepted) return;
    const request: ContactRequest = {
      name: value.name.trim(),
      email: value.email.trim(),
      phone: value.phone,
      reason: value.reason,
      message: value.message.trim(),
      privacyAccepted: true,
      web: value.web,
    };
    this.sending.set(true);
    this.contactService.createContactMessage(request).subscribe({
      next: () => {
        this.sending.set(false);
        this.fieldErrors.set({});
        this.form.reset();
        this.sent.set(true);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        if (error instanceof ApiProblemError) {
          this.fieldErrors.set(error.fieldErrors);
          if (Object.keys(error.fieldErrors).length > 0) {
            this.form.markAllAsTouched();
            this.focusFirstInvalid();
          }
        }
        this.submitError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Has enviado demasiados mensajes. Inténtalo más tarde.'
          : 'No pudimos enviar tu mensaje. Inténtalo de nuevo.');
      },
    });
  }

  private focusFirstInvalid(): void {
    const fields: readonly ContactField[] = ['name', 'email', 'phone', 'reason', 'message', 'privacyAccepted'];
    const first = fields.find((field) => this.form.controls[field].invalid || !!this.fieldErrors()[field]?.length);
    if (first) document.getElementById(`contact-${first}`)?.focus();
  }
}
