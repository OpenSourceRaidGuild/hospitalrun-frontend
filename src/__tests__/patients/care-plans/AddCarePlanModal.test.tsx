import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import AddCarePlanModal from '../../../patients/care-plans/AddCarePlanModal'
import PatientRepository from '../../../shared/db/PatientRepository'
import CarePlan from '../../../shared/model/CarePlan'
import Patient from '../../../shared/model/Patient'

describe('Add Care Plan Modal', () => {
  jest.setTimeout(15000)

  const patient = {
    id: '0012',
    diagnoses: [
      { id: '123', name: 'too skinny', diagnosisDate: new Date().toISOString() },
      { id: '456', name: 'headaches', diagnosisDate: new Date().toISOString() },
    ],
    carePlans: [] as CarePlan[],
  } as Patient

  const setup = () => {
    const onCloseSpy = jest.fn()
    jest.spyOn(PatientRepository, 'find').mockResolvedValue(patient)
    jest.spyOn(PatientRepository, 'saveOrUpdate')
    const history = createMemoryHistory()
    // eslint-disable-next-line react/prop-types
    return {
      ...render(
        <Router history={history}>
          <AddCarePlanModal patient={patient} show onCloseButtonClick={onCloseSpy} />
        </Router>,
      ),
      onCloseSpy,
    }
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render a modal', () => {
    setup()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const title = screen.getByText(/patient\.carePlan\.new/i, { selector: 'div' })
    expect(title).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /patient\.carePlan\.new/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actions.cancel/i })).toBeInTheDocument()
  })

  it('should render the care plan form', () => {
    setup()
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('should call the on close function when the cancel button is clicked', async () => {
    const { onCloseSpy } = setup()
    userEvent.click(
      screen.getByRole('button', {
        name: /close/i,
      }),
    )

    expect(onCloseSpy).toHaveBeenCalledTimes(1)
  })

  it('should save care plan when the save button is clicked and close', async () => {
    const expectedCarePlan = {
      title: 'Feed Harry Potter',
      description: 'eat food',
      diagnosisId: '123', // condition
    }

    const { onCloseSpy } = setup()

    const diagnosisId = screen.getAllByPlaceholderText('-- Choose --')[0] as HTMLInputElement
    userEvent.type(diagnosisId, `{arrowdown}{enter}`)

    const title = screen.getByPlaceholderText(/patient\.careplan\.title/i)
    const description = screen.getAllByRole('textbox')[1]

    userEvent.type(title, expectedCarePlan.title)
    userEvent.type(description, expectedCarePlan.description)

    await waitFor(() =>
      userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /patient\.carePlan\.new/i,
        }),
      ),
    )

    await waitFor(() => {
      expect(PatientRepository.saveOrUpdate).toHaveBeenCalled()
    })

    expect(PatientRepository.saveOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        carePlans: expect.arrayContaining([expect.objectContaining(expectedCarePlan)]),
      }),
    )
    expect(onCloseSpy).toHaveBeenCalledTimes(1)
  })
})
