import '@testing-library/jest-dom'
import { vi } from 'vitest'

import { ReactComponent } from './__mocks__/svgMock'

vi.mock('@/assets', () => ({
  Logo: ReactComponent,
}))
