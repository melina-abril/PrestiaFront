import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ContactService } from '../../data-access/contact.service';
import { CONTACT_REASON_OPTIONS, ContactReason, ContactRequest } from '../../models/contact.models';

type ContactField = 'nombre' | 'correo' | 'telefono' | 'motivo' | 'mensaje' | 'aceptaPrivacidad';

const FIELD_IDS: readonly ContactField[] = ['nombre', 'correo', 'telefono', 'motivo', 'mensaje', 'aceptaPrivacidad'];

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly contactService = inject(ContactService);

  protected readonly reasons = CONTACT_REASON_OPTIONS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^$|^\+?[0-9]{9,15}$/)]],
    motivo: ['' as ContactReason | '', [Validators.required]],
    mensaje: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
    aceptaPrivacidad: [false, [Validators.requiredTrue]],
  });
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly sendError = signal<string | null>(null);
  private readonly serverErrors = signal<Record<string, string[]>>({});

  protected markTouched(field: ContactField): void {
    this.form.controls[field].markAsTouched();
  }

  protected errorFor(field: ContactField): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    const serverError = this.serverErrors()[field]?.[0];
    if (serverError) return serverError;
    if (!control.errors) return '';
    if (control.hasError('required') || control.hasError('requiredTrue')) {
      return field === 'aceptaPrivacidad' ? 'Acepta la política de privacidad.' : 'Este campo es obligatorio.';
    }
    if (field === 'nombre') return 'Usa entre 2 y 60 caracteres.';
    if (field === 'correo') return 'Ingresa un correo válido.';
    if (field === 'telefono') return 'Ingresa entre 9 y 15 dígitos, con + inicial opcional.';
    if (field === 'mensaje') return 'Usa entre 20 y 1.000 caracteres.';
    return 'Selecciona un motivo válido.';
  }

  protected submit(): void {
    this.sent.set(false);
    this.sendError.set(null);
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    const request: ContactRequest = {
      nombre: value.nombre.trim(),
      correo: value.correo.trim(),
      telefono: value.telefono.trim(),
      motivo: value.motivo as ContactReason,
      mensaje: value.mensaje.trim(),
      aceptaPrivacidad: true,
      web: '',
    };
    this.sending.set(true);
    this.contactService.createContactMessage(request).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.sent.set(true);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        if (error instanceof ApiProblemError) {
          this.serverErrors.set(error.fieldErrors);
          if (error.status !== 429 && Object.keys(error.fieldErrors).length) {
            for (const field of FIELD_IDS) {
              if (error.fieldErrors[field]?.length) this.form.controls[field].markAsTouched();
            }
            this.focusFirstInvalid();
          }
          this.sendError.set(error.status === 429
            ? 'Has enviado demasiados mensajes. Inténtalo más tarde.'
            : 'No pudimos enviar tu mensaje. Inténtalo de nuevo.');
        } else {
          this.sendError.set('No pudimos enviar tu mensaje. Inténtalo de nuevo.');
        }
      },
    });
  }

  private focusFirstInvalid(): void {
    const field = FIELD_IDS.find((name) => this.form.controls[name].invalid || !!this.serverErrors()[name]?.length);
    if (field) document.getElementById(`contact-${field}`)?.focus();
  }
}
