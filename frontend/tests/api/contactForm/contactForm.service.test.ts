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
      message: 'contact.success.submitted',
      contact: {
        id: expect.any(Number),
        name: 'John',
        email: 'john@example.com',
        message: 'Hello',
      },
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
