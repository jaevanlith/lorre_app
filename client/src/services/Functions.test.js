import { getSchools, filterCity, passwordIsValid, formToObject, translateErrors, checkDate } from './Functions';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('schools returns right array', () => {
  const schoolsExpected = [
    'Onderwijsinstelling',
    'Erasmus Universiteit Rotterdam',
    'Protestantse Theologische Universiteit',
    'Theologische Universiteit Apeldoorn',
    'Theologische Universiteit Kampen',
    'Radboud Universiteit Nijmegen',
    'Rijksuniversiteit Groningen',
    'Technische Universiteit Delft',
    'Technische Universiteit Eindhoven',
    'Universiteit Leiden',
    'Universiteit Maastricht',
    'Universiteit Twente',
    'Universiteit Utrecht',
    'Universiteit van Amsterdam',
    'Tilburg University',
    'Universiteit voor Humanistiek',
    'Vrije Universiteit Amsterdam',
    'Wageningen Universiteit',
    'Nyenrode Business Universiteit',
    'Hogeschool Avans',
    'Hogeschool Windesheim',
    'Hanzehogeschool',
    'NHL Stenden Hogeschool',
    'Fontys Hogeschool',
    'HAN',
    'Hogeschool Saxion',
    'Hogeschool Rotterdam',
    'Hogeschool Inholland',
    'Hogeschool van Amsterdam',
    'Haagse Hogeschool',
    'Hogeschool Leiden',
    'Hogeschool Utrecht',
    'Andere Hogeschool',
    'Anders',
  ];

  expect(getSchools()).toEqual(schoolsExpected);
});

it('filterCity returns array with right length', () => {
  const cities = filterCity();
  expect(cities.length).toEqual(594);
});

it('test passwords are valid', () => {
  const password = { id: '1', value: 'hoi' };
  const repeatPassword = { id: '2', value: 'hoi' };
  expect(passwordIsValid(password, repeatPassword)).toBeTruthy();
});

it('passwords are invalid', () => {
  const password = { id: '1', value: 'Hoi' };
  const repeatPassword = { id: '2', value: 'hoi' };
  expect(passwordIsValid(password, repeatPassword)).toBeFalsy();
});

it('returns correct JSON object', () => {
  const user = [
    { id: '1', name: 'firstName', value: 'Harry' },
    { id: '2', name: 'lastName', value: 'Styles' },
    { id: '3', name: 'email', value: 'harry@gmail.com' },
    { id: '4', name: 'password', value: 'AdoreYou1' },
    { id: '5', name: 'passwordRepeat', value: 'AdoreYou1' },
    { id: '6', name: 'dateOfBirth', value: '1994-02-01' },
    { id: '7', name: 'gender', value: 'Man' },
    { id: '8', name: 'city', value: 'Leiden' },
    { id: '9', name: 'university', value: 'Technische Universiteit Delft' },
  ];

  const jsonObjectExpect = {
    firstName: 'Harry',
    lastName: 'Styles',
    email: 'harry@gmail.com',
    password: 'AdoreYou1',
    dateOfBirth: '1994-02-01',
    gender: 'male',
    city: 'Leiden',
    university: 'Technische Universiteit Delft',
  };

  const jsonObject = formToObject(user);
  expect(jsonObjectExpect).toEqual(jsonObject);
});

it('returns correct JSON object only required fields', () => {
  const user = [
    { id: '1', name: 'firstName', value: 'Harry' },
    { id: '2', name: 'lastName', value: 'Styles' },
    { id: '3', name: 'email', value: 'harry@gmail.com' },
    { id: '4', name: 'password', value: 'AdoreYou1' },
    { id: '5', name: 'passwordRepeat', value: 'AdoreYou1' },
    { id: '6', name: 'dateOfBirth', value: '1994-02-01' },
    { id: '7', name: 'gender', value: '' },
    { id: '8', name: 'city', value: '' },
    { id: '9', name: 'university', value: '' },
  ];

  const jsonObjectExpect = {
    firstName: 'Harry',
    lastName: 'Styles',
    email: 'harry@gmail.com',
    password: 'AdoreYou1',
    dateOfBirth: '1994-02-01',
  };

  const jsonObject = formToObject(user);
  expect(jsonObjectExpect).toEqual(jsonObject);
});

it('returns translated errors correctly', () => {
  const emailError1 = 'Email already taken';
  const emailError2 = '"email" must be a valid email';
  const passwordError1 = 'password must be at least 8 characters';
  const passwordError2 = 'Password must contain at least one letter and one number';
  const passwordError3 = 'password must contain at least 1 letter and 1 number';
  const otherError = 'Password is too short';

  expect(translateErrors(emailError1)).toEqual('E-mailadres is al in gebruik');
  expect(translateErrors(emailError2)).toEqual('E-mailadres is ongeldig');
  expect(translateErrors(passwordError1)).toEqual('Wachtwoord moet tenminste 8 tekens bevatten');
  expect(translateErrors(passwordError2)).toEqual('Wachtwoord moet tenminste 1 letter en 1 cijfer bevatten');
  expect(translateErrors(passwordError3)).toEqual('Wachtwoord moet tenminste 1 letter en 1 cijfer bevatten');
  expect(translateErrors(otherError)).toEqual('Er is iets misgegaan');
});

describe('Test date check', () => {
  it('checks person of age 20 correctly', () => {
    const today = '2021-01-07';
    const birthDate = '2000-02-24';

    expect(checkDate(today, birthDate)).toBeTruthy();
  });

  it('checks person of age 18 correctly', () => {
    const today = '2021-01-07';
    const birthDate = '2002-02-24';

    expect(checkDate(today, birthDate)).toBeTruthy();
  });

  it('checks person of age 17 correctly', () => {
    const today = '2021-01-07';
    const birthDate = '2003-02-24';

    expect(checkDate(today, birthDate)).toBeFalsy();
  });

  it('checks person of age 18 today', () => {
    const today = '2021-01-07';
    const birthDate = '2003-01-07';

    expect(checkDate(today, birthDate)).toBeTruthy();
  });

  it('checks person of age 18 tomorrow', () => {
    const today = '2021-01-07';
    const birthDate = '2003-01-08';

    expect(checkDate(today, birthDate)).toBeFalsy();
  });
});
