export type AgreementState =
  | 'proposed'
  | 'partially_confirmed'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed';

export type AgreementCommand = 'confirm' | 'cancel' | 'reject' | 'complete';

export class AgreementStateError extends Error {
  constructor(public readonly code: 'invalid_transition' | 'reason_required') {
    super(`agreements.errors.${code}`);
    this.name = 'AgreementStateError';
  }
}

export function transitionAgreement(
  state: AgreementState,
  command: AgreementCommand,
  reason?: string
): AgreementState {
  if ((command === 'cancel' || command === 'reject') && !reason?.trim()) {
    throw new AgreementStateError('reason_required');
  }
  if (command === 'confirm') {
    if (state === 'proposed') return 'partially_confirmed';
    if (state === 'partially_confirmed') return 'confirmed';
  }
  if (
    command === 'cancel' &&
    ['proposed', 'partially_confirmed'].includes(state)
  ) {
    return 'cancelled';
  }
  if (
    command === 'reject' &&
    ['proposed', 'partially_confirmed'].includes(state)
  ) {
    return 'rejected';
  }
  if (command === 'complete' && state === 'confirmed') return 'completed';
  throw new AgreementStateError('invalid_transition');
}
