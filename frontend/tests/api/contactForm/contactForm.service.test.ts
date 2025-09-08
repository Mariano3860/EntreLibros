import { describe, expect, test } from 'vitest'

import { submitContactForm } from '@src/api/contactForm/contactForm.service'

describe('contactForm service', () => {
  test('submits successfully', async () => {
    const response = await submitContactForm({
      name: 'John',
      email: 'john@example.com',
      message: 'Hello',
    })
    expect(response).toMatchObject({
      message: '¡Gracias por tu mensaje! Te responderemos lo antes posible.',
    })
  })

  test('handles server error', async () => {
    await expect(
      submitContactForm({
        name: 'John 400',
        email: 'john@example.com',
        message: 'Hello',
      })
    ).rejects.toMatchObject({ response: { status: 400 } })
  })
})
