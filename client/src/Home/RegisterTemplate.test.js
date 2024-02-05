import React from 'react';
import { render } from '@testing-library/react';
import RegisterTemplate from './RegisterTemplate';
import userEvent from '@testing-library/user-event';

let container;
// Mock Live Count Manipulator as this is not part of this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('Registertemplate renders', () => {
  const { queryByTestId } = render(<RegisterTemplate />);

  expect(queryByTestId('form')).toBeTruthy();
});

it('input fields have attribute required', () => {
  const { queryByTestId } = render(<RegisterTemplate />);
  expect(queryByTestId('fname')).toHaveAttribute('required');
  expect(queryByTestId('lname')).toHaveAttribute('required');
  expect(queryByTestId('email')).toHaveAttribute('required');
  expect(queryByTestId('password')).toHaveAttribute('required');
  expect(queryByTestId('passwordRepeat')).toHaveAttribute('required');
  expect(queryByTestId('dateOfBirth')).toHaveAttribute('required');
});

describe('visibility password', () => {
  it('password has type password', () => {
    const { getByTestId } = render(<RegisterTemplate />);
    expect(getByTestId('password').type).toEqual('password');
    expect(getByTestId('passwordRepeat').type).toEqual('password');
  });

  it('password becomes visible on click', () => {
    const { getByTestId } = render(<RegisterTemplate />);
    userEvent.click(getByTestId('visibility'));
    expect(getByTestId('password').type).toEqual('text');
    expect(getByTestId('passwordRepeat').type).toEqual('text');
  });

  it('password is invisible on two clicks', () => {
    const { getByTestId } = render(<RegisterTemplate />);
    userEvent.click(getByTestId('visibility'));
    userEvent.click(getByTestId('visibility'));
    expect(getByTestId('password').type).toEqual('password');
    expect(getByTestId('passwordRepeat').type).toEqual('password');
  });
});
