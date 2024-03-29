const faker = require('faker');
const { User } = require('../../../server/models');

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: 'male',
        university: 'Erasmus Universiteit Rotterdam',
        city: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if firstName is invalid', async () => {
      newUser.firstName = 'A';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if lastName is invalid', async () => {
      newUser.lastName = 'A';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111111';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is unknown', async () => {
      newUser.role = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user password when toJSON is called', () => {
      const newUser = {
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: 'male',
        university: 'Erasmus Universiteit Rotterdam',
        city: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
      expect(new User(newUser).toJSON()).not.toHaveProperty('password');
    });
  });
});
