import { render, waitFor, screen } from '@testing-library/react'
import addMinutes from 'date-fns/addMinutes'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as ButtonBarProvider from '../../../page-header/button-toolbar/ButtonBarProvider'
import * as titleUtil from '../../../page-header/title/TitleContext'
import ViewAppointments from '../../../scheduling/appointments/ViewAppointments'
import AppointmentRepository from '../../../shared/db/AppointmentRepository'
import PatientRepository from '../../../shared/db/PatientRepository'
import Appointment from '../../../shared/model/Appointment'
import Patient from '../../../shared/model/Patient'
import { RootState } from '../../../shared/store'

const { TitleProvider } = titleUtil

beforeEach(() => {
  jest.clearAllMocks()
})

const setup = () => {
  const expectedAppointment = {
    id: '123',
    rev: '1',
    patient: '1234',
    startDateTime: new Date().toISOString(),
    endDateTime: addMinutes(new Date(), 60).toISOString(),
    location: 'location',
    reason: 'reason',
  } as Appointment
  const expectedPatient = {
    id: '123',
    fullName: 'patient full name',
  } as Patient
  jest.spyOn(titleUtil, 'useUpdateTitle').mockReturnValue(jest.fn())
  jest.spyOn(ButtonBarProvider, 'useButtonToolbarSetter').mockImplementation(() => jest.fn())
  jest.spyOn(AppointmentRepository, 'findAll').mockResolvedValue([expectedAppointment])
  jest.spyOn(PatientRepository, 'find').mockResolvedValue(expectedPatient)

  const mockStore = createMockStore<RootState, any>([thunk])

  return {
    expectedPatient,
    expectedAppointment,
    ...render(
      <Provider store={mockStore({ appointments: { appointments: [expectedAppointment] } } as any)}>
        <MemoryRouter initialEntries={['/appointments']}>
          <TitleProvider>
            <ViewAppointments />
          </TitleProvider>
        </MemoryRouter>
      </Provider>,
    ),
  }
}

describe('ViewAppointments', () => {
  it('should have called the useUpdateTitle hook', async () => {
    setup()

    await waitFor(() => {
      expect(titleUtil.useUpdateTitle).toHaveBeenCalled()
    })
  })

  it('should add a "New Appointment" button to the button tool bar', async () => {
    setup()

    await waitFor(() => {
      expect(ButtonBarProvider.useButtonToolbarSetter).toHaveBeenCalled()
    })
  })

  it('should render a calendar with the proper events', async () => {
    const { container, expectedPatient, expectedAppointment } = setup()

    await waitFor(() => {
      expect(screen.getByText(expectedPatient.fullName as string)).toBeInTheDocument()
    })

    const expectedAppointmentStartDate = new Date(expectedAppointment.startDateTime)
    const expectedStart = `${expectedAppointmentStartDate.getHours()}:${expectedAppointmentStartDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    const expectedAppointmentEndDate = new Date(expectedAppointment.endDateTime)
    const expectedEnd = `${expectedAppointmentEndDate.getHours()}:${expectedAppointmentEndDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`

    expect(container.querySelector('.fc-content-col .fc-time')).toHaveAttribute(
      'data-full',
      expect.stringContaining(expectedStart),
    )
    expect(container.querySelector('.fc-content-col .fc-time')).toHaveAttribute(
      'data-full',
      expect.stringContaining(expectedEnd),
    )
  })
})
