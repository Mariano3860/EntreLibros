import { fireEvent, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const translations = vi.hoisted(() => ({
  'community.messages.agreement.confirmation.title': 'Confirmación de acuerdo',
  'community.messages.agreement.confirmation.status': 'Confirmado por {{name}}',
  'community.messages.agreement.confirmation.ariaLabel':
    'Acuerdo confirmado por {{name}}: {{meetingPoint}}, {{date}} a las {{time}} para el libro {{book}}',
  'community.messages.agreement.proposal.title': 'Propuesta de acuerdo',
  'community.messages.agreement.proposal.ariaLabel':
    'Propuesta de acuerdo: {{meetingPoint}}, {{date}} a las {{time}} para el libro {{book}}',
  'community.messages.agreement.change.title': 'Cambio propuesto',
  'community.messages.agreement.change.ariaLabel':
    'Cambio propuesto: {{meetingPoint}}, {{date}} a las {{time}} para el libro {{book}}',
  'community.messages.agreement.cancellation.title': 'Acuerdo cancelado',
  'community.messages.agreement.cancellation.ariaLabel':
    'Acuerdo cancelado por {{name}} para el libro {{book}}',
  'community.messages.agreement.cancellation.by': 'Cancelado por {{name}}',
  'community.messages.agreement.cancellation.reason': 'Motivo: {{reason}}',
  'community.messages.agreement.cancellation.proposeNew':
    'Proponer un nuevo acuerdo',
  'community.messages.agreement.fields.place': 'Lugar',
  'community.messages.agreement.fields.schedule': 'Día y horario',
  'community.messages.agreement.fields.book': 'Libro',
  'community.messages.agreement.actions.suggestChange': 'Proponer cambio',
  'community.messages.agreement.actions.confirm': 'Confirmar',
  'community.messages.agreement.actions.cancel': 'Cancelar acuerdo',
  'community.messages.agreement.status.pending': 'Pendiente',
  'community.messages.agreement.status.cancelled': 'Acuerdo cancelado',
  'community.messages.bookBubble.otherUser': 'la otra persona',
  'community.messages.bookBubble.mine': 'Tu libro',
  'community.messages.bookBubble.theirs': 'Libro de {{name}}',
  'community.messages.bookBubble.coverAlt': 'Portada de {{title}}',
})) as Record<string, string>

vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next')
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        const template = translations[key] ?? options?.defaultValue ?? key
        if (!options) return template
        return template.replace(/{{(.*?)}}/g, (_: string, varName: string) => {
          const trimmed = varName.trim()
          const value = options[trimmed]
          return value !== undefined ? String(value) : ''
        })
      },
      i18n: { changeLanguage: () => Promise.resolve() },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
  }
})

import { BubbleAgreementConfirmation } from '@components/messages/components/BubbleAgreement/BubbleAgreementConfirmation'
import { BubbleAgreementChange } from '@components/messages/components/BubbleAgreement/BubbleAgreementChange'
import { BubbleAgreementCancellation } from '@components/messages/components/BubbleAgreement/BubbleAgreementCancellation'
import { BubbleAgreementProposal } from '@components/messages/components/BubbleAgreement/BubbleAgreementProposal'
import { BubbleBase } from '@components/messages/components/BubbleBase/BubbleBase'
import { BubbleText } from '@components/messages/components/BubbleText/BubbleText'

import { renderWithProviders } from '../../test-utils'

describe('Message bubbles', () => {
  test('renders BubbleBase with optional sections', () => {
    const { getByRole } = renderWithProviders(
      <BubbleBase
        role="me"
        tone="success"
        header={<span>Encabezado</span>}
        actions={<button type="button">Acción</button>}
        meta={<span>meta</span>}
        ariaLabel="Etiqueta descriptiva"
      >
        <span>Contenido del mensaje</span>
      </BubbleBase>
    )

    const group = getByRole('group', { name: 'Etiqueta descriptiva' })
    const utils = within(group)
    expect(utils.getByText('Encabezado')).toBeInTheDocument()
    expect(utils.getByText('Contenido del mensaje')).toBeInTheDocument()
    expect(utils.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
    expect(utils.getByText('meta')).toBeInTheDocument()
  })

  test('renders BubbleText with book preview and ownership label', () => {
    const { getByRole, getByText } = renderWithProviders(
      <BubbleText
        role="them"
        tone="info"
        text="Hola, este es un mensaje"
        book={{
          title: '1984',
          author: 'George Orwell',
          cover: '/covers/1984.jpg',
          ownership: 'theirs',
          ownerName: 'Julia',
        }}
        time="18:45"
      />
    )

    expect(getByText('Hola, este es un mensaje')).toBeInTheDocument()
    expect(getByRole('img', { name: 'Portada de 1984' })).toHaveAttribute(
      'src',
      '/covers/1984.jpg'
    )
    expect(getByText('Libro de Julia')).toBeInTheDocument()
    expect(getByText('1984')).toBeInTheDocument()
    expect(getByText('George Orwell')).toBeInTheDocument()
    expect(getByText('18:45')).toBeInTheDocument()
  })

  test('renders BubbleAgreementConfirmation with meeting summary', () => {
    const { getByRole, getByText } = renderWithProviders(
      <BubbleAgreementConfirmation
        agreement={{
          meetingPoint: 'Librería Central',
          area: 'Palermo',
          date: '12/10',
          time: '19:00',
          bookTitle: 'Sapiens',
        }}
        confirmedBy="Ana"
        time="20:15"
      />
    )

    expect(
      getByRole('group', {
        name: /Acuerdo confirmado por Ana/i,
      })
    ).toBeInTheDocument()
    expect(getByText('Confirmado por Ana')).toBeInTheDocument()
    expect(getByText('Librería Central — Palermo')).toBeInTheDocument()
    expect(getByText('12/10 · 19:00')).toBeInTheDocument()
    expect(getByText('Sapiens')).toBeInTheDocument()
    expect(getByText('20:15')).toBeInTheDocument()
  })

  test('renders BubbleAgreementProposal with actions', () => {
    const onSuggestChange = vi.fn()
    const onConfirm = vi.fn()

    const { getByRole, getByText } = renderWithProviders(
      <BubbleAgreementProposal
        proposal={{
          meetingPoint: 'Plaza Italia',
          area: 'Palermo',
          date: '15/11',
          time: '10:30',
          bookTitle: 'El Aleph',
        }}
        time="09:00"
        onSuggestChange={onSuggestChange}
        onConfirm={onConfirm}
      />
    )

    expect(
      getByRole('group', { name: /Propuesta de acuerdo/i })
    ).toBeInTheDocument()
    expect(getByText('Plaza Italia — Palermo')).toBeInTheDocument()
    expect(getByText('15/11 · 10:30')).toBeInTheDocument()
    expect(getByText('El Aleph')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Proponer cambio' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Proponer cambio' }))
    expect(onSuggestChange).toHaveBeenCalledTimes(1)
    fireEvent.click(getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(getByText('09:00')).toBeInTheDocument()
  })

  test('renders BubbleAgreementChange with status and handlers', () => {
    const onConfirm = vi.fn()
    const onSuggest = vi.fn()
    const onCancel = vi.fn()

    const { getByRole, getByText } = renderWithProviders(
      <BubbleAgreementChange
        proposal={{
          meetingPoint: 'Café Central',
          area: 'Centro',
          date: '20/11',
          time: '18:00',
          bookTitle: 'Rayuela',
        }}
        time="17:45"
        statusLabel="Pendiente"
        onConfirm={onConfirm}
        onSuggestChange={onSuggest}
        onCancel={onCancel}
      />
    )

    expect(
      getByRole('group', { name: /Cambio propuesto/i })
    ).toBeInTheDocument()
    expect(getByText('Pendiente')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    fireEvent.click(getByRole('button', { name: 'Proponer cambio' }))
    expect(onSuggest).toHaveBeenCalledTimes(1)
    fireEvent.click(getByRole('button', { name: 'Cancelar acuerdo' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  test('renders BubbleAgreementCancellation with details', () => {
    const onProposeNew = vi.fn()

    const { getByRole, getByText } = renderWithProviders(
      <BubbleAgreementCancellation
        cancelledBy="Lucía"
        reason="El libro ya no está disponible"
        details={{
          meetingPoint: 'Parque Norte',
          area: 'Belgrano',
          date: '22/11',
          time: '16:30',
          bookTitle: 'Ficciones',
        }}
        time="16:00"
        statusLabel="Acuerdo cancelado"
        onProposeNew={onProposeNew}
      />
    )

    expect(
      getByRole('group', { name: /Acuerdo cancelado/i })
    ).toBeInTheDocument()
    expect(
      getByText('Acuerdo cancelado', { selector: 'p' })
    ).toBeInTheDocument()
    expect(getByText('Cancelado por Lucía')).toBeInTheDocument()
    expect(
      getByText('Motivo: El libro ya no está disponible')
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Proponer un nuevo acuerdo' }))
    expect(onProposeNew).toHaveBeenCalledTimes(1)
  })
})
