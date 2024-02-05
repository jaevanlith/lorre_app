import csc from 'country-state-city';

const schools = [
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

/**
 * This function returns the array of schools.
 * It will be called in the component didMount in the children classes
 */
export const getSchools = () => {
  return schools;
};

/**This function returns the list of dutch cities
 * Fisrt it gets the different provinces of the Netherlands. In the library NL had country ID 155
 * After that it gets all the cities of each province and adds them to an array.
 * Lastly we add the 'anders' functionality
 */
export const filterCity = () => {
  let states = csc.getStatesOfCountry('155');
  let dutchCities = [];
  dutchCities.push('Woonplaats');
  states.map((provincie) => {
    let cities = csc.getCitiesOfState(provincie.id);
    cities.map((city) => {
      dutchCities.push(city.name);
      return dutchCities;
    });
    return dutchCities;
  });
  dutchCities.push('Andere woonplaats');
  const uniqueCities = [...new Set(dutchCities)];
  return uniqueCities;
};

/**
 * This method checks if the newly submitted passwords are equal.
 * If not it will return false.
 * If they are it will return true and the form will be submitted.
 */
export const passwordIsValid = (password, passwordRepeat) => {
  if (password.value === passwordRepeat.value) {
    return true;
  } else {
    return false;
  }
};

/**
 * This method turns the user form to a json object.
 * @param {user} user
 */
export const formToObject = (user) => {
  const dataForm = new FormData();
  for (var i = 0; i < 9; i++) {
    if (user[i].value && !(i === 4)) {
      if (user[i].name === 'gender') {
        let gender = user[i].value;
        if (gender === 'Man') {
          gender = 'male';
        } else if (gender === 'Vrouw') {
          gender = 'female';
        } else if (gender === 'Anders') {
          gender = 'other';
        }
        dataForm.append(user[i].name, gender);
      } else {
        dataForm.append(user[i].name, user[i].value);
      }
    }
  }
  let jsonObject = {};
  for (const [key, value] of dataForm) {
    jsonObject[key] = value;
  }
  return jsonObject;
};

/**
 * This method will translate the errors from English to Dutch
 * @param {*} errMessage , error message returned from the server in English.
 */
export const translateErrors = (errMessage) => {
  if (errMessage === 'Email already taken') {
    return 'E-mailadres is al in gebruik';
  } else if (errMessage === '"email" must be a valid email') {
    return 'E-mailadres is ongeldig';
  } else if (errMessage === 'password must be at least 8 characters') {
    return 'Wachtwoord moet tenminste 8 tekens bevatten';
  } else if (
    errMessage === 'Password must contain at least one letter and one number' ||
    errMessage === 'password must contain at least 1 letter and 1 number'
  ) {
    return 'Wachtwoord moet tenminste 1 letter en 1 cijfer bevatten';
  } else {
    return 'Er is iets misgegaan';
  }
};

/**
 * Checks whether the user is 18 or older.
 * Returns true is they are and false if they are not.
 * @param {*} date The current date at the moment of submitting the form.
 * @param {*} DoB The date of birth from the user as they have filled in.
 */
export const checkDate = (date, DoB) => {
  const dateNow = new Date(date);
  const birthDate = new Date(DoB);
  var age = dateNow.getFullYear() - birthDate.getFullYear();
  var m = dateNow.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && dateNow.getDate() < birthDate.getDate())) {
    age = age - 1;
  }
  if (age < 18) {
    return false;
  }
  return true;
};
