import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import AccountDetails from './AccountDetails';
import userEvent from '@testing-library/user-event';

// Mock LiveCount component as it is not relevant to this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

afterEach(cleanup);

describe('Correct user requests', () => {
  it('displays user details correctly', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const firstName = await waitFor(() => getByTestId('fname'));
    const lastName = await waitFor(() => getByTestId('lname'));
    const email = await waitFor(() => getByTestId('email'));
    const dateOfBirth = await waitFor(() => getByTestId('dateOfBirth'));

    expect(firstName).toHaveTextContent('Voornaam: Harry');
    expect(lastName).toHaveTextContent('Achternaam: Styles');
    expect(email).toHaveTextContent('Email: harry@gmail.com');
    expect(dateOfBirth).toHaveTextContent('Geboortedatum: 1994-02-01');
  });
  it('displays error correctly', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('Correct edit screen', () => {
  it('displays user details correctly', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'male',
      city: 'Leiden',
      university: 'Technische Universiteit Delft',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);

    const firstName = await waitFor(() => getByTestId('fnameEdit'));
    const lastName = await waitFor(() => getByTestId('lnameEdit'));
    const email = await waitFor(() => getByTestId('emailEdit'));
    const date = await waitFor(() => getByTestId('dateEdit'));
    const man = await waitFor(() => getByTestId('ManEdit'));
    const vrouw = await waitFor(() => getByTestId('VrouwEdit'));
    const anders = await waitFor(() => getByTestId('AndersEdit'));
    const city = await waitFor(() => getByTestId('cityEdit'));
    const university = await waitFor(() => getByTestId('universityEdit'));

    expect(firstName.value).toBe('Harry');
    expect(lastName.value).toBe('Styles');
    expect(email.value).toBe('harry@gmail.com');
    expect(date.value).toBe('1994-02-01');
    expect(man.value).toBe('Man');
    expect(man.checked).toBeTruthy();
    expect(city.value).toBe('Leiden');
    expect(vrouw.value).toBe('Vrouw');
    expect(vrouw.checked).toBeFalsy();
    expect(anders.value).toBe('Anders');
    expect(anders.checked).toBeFalsy();
    expect(university.value).toBe('Technische Universiteit Delft');
  });

  it('changes values correctly', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'male',
      city: 'Leiden',
      university: 'Technische Universiteit Delft',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );
    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);

    const firstName = await waitFor(() => getByTestId('fnameEdit'));
    const lastName = await waitFor(() => getByTestId('lnameEdit'));
    const date = await waitFor(() => getByTestId('dateEdit'));
    const man = await waitFor(() => getByTestId('ManEdit'));
    const vrouw = await waitFor(() => getByTestId('VrouwEdit'));
    let city = await waitFor(() => getByTestId('cityEdit'));
    const university = await waitFor(() => getByTestId('universityEdit'));

    firstName.setSelectionRange(0, 5);
    userEvent.type(firstName, 'Liam');
    lastName.setSelectionRange(0, 6);
    userEvent.type(lastName, 'Payne');
    userEvent.type(date, '1993-08-29');
    userEvent.selectOptions(city, 'Delft');
    userEvent.click(vrouw);
    userEvent.selectOptions(university, 'Rijksuniversiteit Groningen');

    expect(firstName.value).toBe('Liam');
    expect(lastName.value).toBe('Payne');
    expect(date.value).toBe('1993-08-29');
    expect(man.value).toBe('Man');
    expect(man.checked).toBeFalsy();
    expect(city.value).toBe('Delft');
    expect(vrouw.checked).toBeTruthy();
    expect(university.value).toBe('Rijksuniversiteit Groningen');
  });

  it('displays submit error correctly', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'male',
      city: 'Leiden',
      university: 'Technische Universiteit Delft',
    });
    mock.onPatch('/users/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);

    const save = await waitFor(() => getByTestId('save'));
    userEvent.click(save);
    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Opslaan van je gegevens is mislukt');
  });
});

describe('genderRefactor correctly', () => {
  it('displays man', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'male',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);
    const man = await waitFor(() => getByTestId('ManEdit'));
    const vrouw = await waitFor(() => getByTestId('VrouwEdit'));
    const anders = await waitFor(() => getByTestId('AndersEdit'));

    expect(man.value).toBe('Man');
    expect(man.checked).toBeTruthy();
    expect(vrouw.value).toBe('Vrouw');
    expect(vrouw.checked).toBeFalsy();
    expect(anders.value).toBe('Anders');
    expect(anders.checked).toBeFalsy();
  });

  it('displays vrouw', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'female',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);
    const man = await waitFor(() => getByTestId('ManEdit'));
    const vrouw = await waitFor(() => getByTestId('VrouwEdit'));
    const anders = await waitFor(() => getByTestId('AndersEdit'));

    expect(man.value).toBe('Man');
    expect(man.checked).toBeFalsy();
    expect(vrouw.value).toBe('Vrouw');
    expect(vrouw.checked).toBeTruthy();
    expect(anders.value).toBe('Anders');
    expect(anders.checked).toBeFalsy();
  });

  it('displays anders', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'other',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    const edit = await waitFor(() => getByTestId('edit'));
    userEvent.click(edit);
    const man = await waitFor(() => getByTestId('ManEdit'));
    const vrouw = await waitFor(() => getByTestId('VrouwEdit'));
    const anders = await waitFor(() => getByTestId('AndersEdit'));

    expect(man.value).toBe('Man');
    expect(man.checked).toBeFalsy();
    expect(vrouw.value).toBe('Vrouw');
    expect(vrouw.checked).toBeFalsy();
    expect(anders.value).toBe('Anders');
    expect(anders.checked).toBeTruthy();
  });
});

describe('Delete functionality', () => {
  it('deletes succesfully', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'other',
    });
    mock.onDelete('/users/1234').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    await waitFor(() => getByTestId('screen'));
    userEvent.click(await waitFor(() => getByTestId('check')));
    userEvent.click(await waitFor(() => getByTestId('delete')));

    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Je account is verwijderd');
  });

  it('delete error', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
      email: 'harry@gmail.com',
      dateOfBirth: '1994-02-01T00:00:00.000Z',
      gender: 'other',
    });
    mock.onDelete('/users/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <AccountDetails />
      </BrowserRouter>
    );

    await waitFor(() => getByTestId('screen'));
    userEvent.click(await waitFor(() => getByTestId('check')));
    userEvent.click(await waitFor(() => getByTestId('delete')));

    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Verwijderen is mislukt');
  });
});
