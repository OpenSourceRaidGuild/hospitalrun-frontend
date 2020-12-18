import { render, screen } from '@testing-library/react'
import React from 'react'

import NoPatientsExist from '../../../patients/search/NoPatientsExist'

describe('NoPatientsExist', () => {
  const setup = () => render(<NoPatientsExist />)

  it('should render an icon and a button with typography', () => {
    setup()

    expect(screen.getByRole('heading', { name: /patients.noPatients/i })).toBeInTheDocument()
    expect(screen.getByText('patients.noPatients')).toBeInTheDocument()

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('patients.newPatient')).toBeInTheDocument()
  })
})
