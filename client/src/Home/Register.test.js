import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Register from './Register';
import userEvent from '@testing-library/user-event';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';

let container;

jest.mock('./Components/Menu.js', () => () => <div />);

// Mock Live Count Manipulator as this is not part of this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
  cleanup();
});

it('can render and update registration', () => {
  // Test render and mount
  act(() => {
    ReactDOM.render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
      container
    );
  });
  const label = container.querySelector('p');
  expect(label.textContent).toBe('Maak een nieuw account');

  let fname = document.getElementById('1');
  let lname = document.getElementById('2');
  let email = document.getElementById('3');
  let password = document.getElementById('4');
  let confirmPassword = document.getElementById('5');
  let dateOfBirth = document.getElementById('6');

  //Test whether the state is empty
  expect(fname.value).toBe('');
  expect(lname.value).toBe('');
  expect(email.value).toBe('');
  expect(password.value).toBe('');
  expect(confirmPassword.value).toBe('');
  expect(dateOfBirth.value).toBe('');

  //fill in all required fileds
  userEvent.type(fname, 'Harry');
  userEvent.type(lname, 'Styles');
  userEvent.type(email, 'a@b.c');
  userEvent.type(password, 'hoi');
  userEvent.type(confirmPassword, 'hoi');
  userEvent.type(dateOfBirth, '1994-02-01');

  //Test whether the state is updated
  expect(fname.value).toBe('Harry');
  expect(lname.value).toBe('Styles');
  expect(email.value).toBe('a@b.c');
  expect(password.value).toBe('hoi');
  expect(confirmPassword.value).toBe('hoi');
  expect(dateOfBirth.value).toBe('1994-02-01');
});

describe('Submit passes', () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = { replace: jest.fn() };
  });

  afterAll(() => {
    window.location = location;
  });

  it('mocks `replace`', () => {
    expect(jest.isMockFunction(window.location.replace)).toBe(true);
  });

  it('submit correctly', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/register').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    //Check that the user is not able to see the radio buttons with the label admin and user
    expect(getByTestId('screen')).not.toHaveTextContent('Admin');
    expect(getByTestId('screen')).not.toHaveTextContent('User');

    let fname = document.getElementById('1');
    let lname = document.getElementById('2');
    let email = document.getElementById('3');
    let password = document.getElementById('4');
    let confirmPassword = document.getElementById('5');
    let dateOfBirth = document.getElementById('6');

    userEvent.type(fname, 'Harry');
    userEvent.type(lname, 'Styles');
    userEvent.type(email, 'a@b.c');
    userEvent.type(password, 'hoi');
    userEvent.type(confirmPassword, 'hoi');
    userEvent.type(dateOfBirth, '1994-02-01');

    userEvent.click(getByTestId('submit-button'));
    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith('/Login'));
  });
});

describe('Submit fails', () => {
  it('displays message when there is a 500 error', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/register').reply(500, {
      code: 500,
      message: 'Something went wrong',
    });

    const { findByTestId } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    userEvent.click(await findByTestId('submit-button'));

    const failMessage = await findByTestId('fail-message');

    expect(failMessage).toBeTruthy();
  });

  it('displays message when there is a 400 error', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/register').reply(400, {
      code: 400,
      message: 'password is invalid',
    });

    const { findByTestId } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    userEvent.click(await findByTestId('submit-button'));

    const failUser = await findByTestId('userFailed-message');

    expect(failUser).toBeTruthy();
  });

  it('Shows error password', async () => {
    // const mock = new MockAdapter(API);
    // mock.onPost('/auth/register').reply(200);
    const { findByTestId } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    let fname = document.getElementById('1');
    let lname = document.getElementById('2');
    let email = document.getElementById('3');
    let password = document.getElementById('4');
    let confirmPassword = document.getElementById('5');
    let dateOfBirth = document.getElementById('6');

    userEvent.type(fname, 'Harry');
    userEvent.type(lname, 'Styles');
    userEvent.type(email, 'harry@email.com');
    userEvent.type(password, 'hoiLouis1');
    userEvent.type(confirmPassword, 'Hoilouis1');
    userEvent.type(dateOfBirth, '1994-02-01');

    userEvent.click(await findByTestId('submit-button'));

    let screen = await findByTestId('screen');
    expect(screen).toHaveTextContent('Wachtwoorden komen niet overeen');
  });

  it('Shows error too young', async () => {
    // const mock = new MockAdapter(API);
    // mock.onPost('/auth/register').reply(200);
    const { findByTestId } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    let fname = document.getElementById('1');
    let lname = document.getElementById('2');
    let email = document.getElementById('3');
    let password = document.getElementById('4');
    let confirmPassword = document.getElementById('5');
    let dateOfBirth = document.getElementById('6');

    userEvent.type(fname, 'Harry');
    userEvent.type(lname, 'Styles');
    userEvent.type(email, 'harry@email.com');
    userEvent.type(password, 'hoiLouis1');
    userEvent.type(confirmPassword, 'hoiLouis1');
    userEvent.type(dateOfBirth, '2005-02-01');

    userEvent.click(await findByTestId('submit-button'));

    let msg = await findByTestId('userFailed-message');
    expect(msg).toHaveTextContent('Sorry je bent te jong. Je moet minstens 18 zijn om binnen te komen');
  });
});
