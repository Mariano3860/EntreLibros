import { describe, expect, test } from 'vitest';
import {
  AgreementStateError,
  transitionAgreement,
} from '../../src/services/agreementState.js';

describe('agreement state machine', () => {
  test.each([
    ['proposed', 'confirm', 'partially_confirmed'],
    ['partially_confirmed', 'confirm', 'confirmed'],
    ['confirmed', 'complete', 'completed'],
    ['proposed', 'cancel', 'cancelled'],
    ['partially_confirmed', 'reject', 'rejected'],
  ] as const)('%s + %s -> %s', (state, command, expected) => {
    expect(transitionAgreement(state, command, 'valid reason')).toBe(expected);
  });

  test('requires a reason for cancellation and rejection', () => {
    expect(() => transitionAgreement('proposed', 'cancel')).toThrow(
      new AgreementStateError('reason_required')
    );
    expect(() => transitionAgreement('proposed', 'reject', ' ')).toThrow(
      new AgreementStateError('reason_required')
    );
  });

  test('rejects invalid transitions', () => {
    expect(() => transitionAgreement('cancelled', 'confirm')).toThrow(
      new AgreementStateError('invalid_transition')
    );
    expect(() => transitionAgreement('confirmed', 'cancel', 'late')).toThrow(
      new AgreementStateError('invalid_transition')
    );
  });
});
