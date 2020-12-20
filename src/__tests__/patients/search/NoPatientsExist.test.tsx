import { render as rtlRender, screen } from '@testing-library/react'
import React from 'react'

import NoPatientsExist from '../../../patients/search/NoPatientsExist'

describe('NoPatientsExist', () => {
  const render = () => rtlRender(<NoPatientsExist />)

  it('should render an icon and a button with typography', () => {
    render()

    expect(
      screen.getByRole('heading', {
        name: /patients\.nopatients/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /patients\.newpatient/i,
      }),
    ).toBeInTheDocument()
  })
})
