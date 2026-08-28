import { describe, expect, test } from 'vitest'

import { isPublicFlagEnabled } from '@utils/runtimeEnv'

describe('runtime environment flags', () => {
  test.each(['true', 'TRUE', '1', 'yes', ' Yes '])(
    'accepts %s as enabled',
    (value) => {
      expect(isPublicFlagEnabled(value)).toBe(true)
    }
  )

  test.each(['false', '0', 'no', '', 'auto', undefined])(
    'rejects %s as disabled',
    (value) => {
      expect(isPublicFlagEnabled(value)).toBe(false)
    }
  )
})
