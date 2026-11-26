import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiProblemError } from '../../../../core/http/api-error';
import { CONTACT_REASONS, ContactReason, ContactRequest } from '../../models/contact.models';
import { ContactService } from '../../data-access/contact.service';

type ContactField = 'nombre' | 'correo' | 'telefono' | 'motivo' | 'mensaje' | 'aceptaPrivacidad';

function trimmedLength(minimum: number, maximum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (typeof value !== 'string' || value.length === 0) return null;
    const length = value.trim().length;
    if (length < minimum) return { minlength: true };
    if (length > maximum) return { maxlength: true };
    return null;
  };
}

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly contactService = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly reasons = CONTACT_REASONS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, trimmedLength(2, 60)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^\+?[0-9]{9,15}$/)]],
    motivo: ['' as ContactReason | '', [Validators.required]],
    mensaje: ['', [Validators.required, trimmedLength(20, 1000)]],
    aceptaPrivacidad: [false, [Validators.requiredTrue]],
    web: [''],
  });
  protected readonly sending = signal(false);
  protected readonly success = signal(false);
  protected readonly submitError = signal<string | null>(null);
  private readonly serverErrors = signal<Record<string, string[]>>({});

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (Object.keys(this.serverErrors()).length) this.serverErrors.set({});
      if (this.success()) this.success.set(false);
    });
  }

  protected errorFor(field: ContactField): string {
    const serverError = this.serverErrors()[field]?.[0];
    if (serverError) return serverError;
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) return '';
    if (control.hasError('required') || control.hasError('requiredTrue')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (field === 'telefono' && control.hasError('pattern')) return 'Ingresa entre 9 y 15 dígitos, con + inicial opcional.';
    if (control.hasError('minlength')) return field === 'nombre' ? 'Usa al menos 2 caracteres.' : 'Usa al menos 20 caracteres.';
    if (control.hasError('maxlength')) return field === 'nombre' ? 'Usa hasta 60 caracteres.' : 'Usa hasta 1.000 caracteres.';
    return 'Revisa este campo.';
  }

  protected submit(): void {
    if (this.sending()) return;
    this.success.set(false);
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    const request: ContactRequest = {
      nombre: value.nombre.trim(),
      correo: value.correo.trim(),
      ...(value.telefono.trim() ? { telefono: value.telefono.trim() } : {}),
      motivo: value.motivo as ContactReason,
      mensaje: value.mensaje.trim(),
      aceptaPrivacidad: true,
      web: value.web,
    };
    this.sending.set(true);
    this.contactService.createContactMessage(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.success.set(true);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        this.submitError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Has enviado demasiados mensajes. Inténtalo más tarde.'
          : 'No pudimos enviar tu mensaje. Inténtalo de nuevo.');
        if (error instanceof ApiProblemError && Object.keys(error.fieldErrors).length) {
          this.serverErrors.set(error.fieldErrors);
          this.form.markAllAsTouched();
          this.focusFirstInvalid();
        }
      },
    });
  }

  private focusFirstInvalid(): void {
    const fields: readonly ContactField[] = ['nombre', 'correo', 'telefono', 'motivo', 'mensaje', 'aceptaPrivacidad'];
    const first = fields.find((field) => this.form.controls[field].invalid || !!this.serverErrors()[field]?.length);
    if (first) document.getElementById(`contact-${first}`)?.focus();
  }
}
