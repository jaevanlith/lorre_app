const request = require('supertest');
const faker = require('faker');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const app = require('../../server/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../server/models');
const { userOne, userTwo, admin, insertUsers, genders, uni } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('User routes', () => {
  describe('POST /api/users', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email().toLowerCase(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        password: 'password1',
        role: 'user',
      };
    });

    test('should return 201 and successfully create new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: expect.anything(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        university: newUser.university,
        isCheckedIn: false,
      });

      const userid = res.body.id;
      const dbUser = await User.findById(userid);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        id: userid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        dateOfBirth: new Date(newUser.dateOfBirth),
        gender: newUser.gender,
        university: newUser.university,
        isCheckedIn: false,
      });
    });

    test('should be able to create an admin as well', async () => {
      await insertUsers([admin]);
      newUser.role = 'admin';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.role).toBe('admin');

      const dbUser = await User.findById(res.body.id);
      expect(dbUser.role).toBe('admin');
    });

    test('should return 401 error is access token is missing', async () => {
      await request(app).post('/api/users').send(newUser).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      await insertUsers([admin]);
      newUser.password = 'passwo1';

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      await insertUsers([admin]);
      newUser.password = 'password';

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = '1111111';

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if role is neither user nor admin', async () => {
      await insertUsers([admin]);
      newUser.role = 'invalid';

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/users', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        id: userOne._id.toHexString(),
        email: userOne.email,
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        city: userOne.city,
        dateOfBirth: userOne.dateOfBirth,
        gender: userOne.gender,
        isCheckedIn: userOne.isCheckedIn,
        university: userOne.university,
        role: userOne.role,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/api/users').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ firstName: userOne.firstName })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });

    test('should correctly apply filter on role field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: 'user' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(admin._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
      expect(res.body.results[1].id).toBe(userOne._id.toHexString());
      expect(res.body.results[2].id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,firstName:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [userOne, userTwo, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.firstName < b.firstName ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
      expect(res.body.results[1].id).toBe(userTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
    });
  });

  describe('GET /api/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        email: userOne.email,
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        dateOfBirth: userOne.dateOfBirth,
        city: userOne.city,
        gender: userOne.gender,
        isCheckedIn: userOne.isCheckedIn,
        university: userOne.university,
        role: userOne.role,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).get(`/api/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/api/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .get(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/api/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).delete(`/api/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`/api/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .delete(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/api/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/users/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        email: faker.internet.email().toLowerCase(),
        city: faker.address.city(),
        password: 'newPassword1',
      };

      const res = await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        firstName: updateBody.firstName,
        lastName: updateBody.lastName,
        dateOfBirth: updateBody.dateOfBirth,
        gender: updateBody.gender,
        city: updateBody.city,
        isCheckedIn: userOne.isCheckedIn,
        university: updateBody.university,
        email: updateBody.email,
        role: userOne.role,
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({
        id: userOne._id.toHexString(),
        firstName: updateBody.firstName,
        lastName: updateBody.lastName,
        dateOfBirth: new Date(updateBody.dateOfBirth),
        gender: updateBody.gender,
        city: updateBody.city,
        isCheckedIn: userOne.isCheckedIn,
        university: updateBody.university,
        email: updateBody.email,
        role: userOne.role,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { firstName: faker.name.findName() };

      await request(app).patch(`/api/users/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { firstName: faker.name.findName() };

      await request(app)
        .patch(`/api/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { firstName: faker.name.findName() };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { firstName: faker.name.findName() };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { firstName: faker.name.findName() };

      await request(app)
        .patch(`/api/users/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should not return 400 if email is my email', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 if password length is less than 8 characters', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'passwo1' };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password does not contain both letters and numbers', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'password' };

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/users/search/inclusive', () => {
    test('should return 200 and correctly apply filter on keyword field (same fields matching)', async () => {
      const sameNameOne = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'faker',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      const sameNameTwo = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'faker',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      await insertUsers([sameNameOne, sameNameTwo, admin]);

      const keyword = 'faker';

      const res = await request(app)
        .get(`/api/users/search/inclusive?keyword=${keyword}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(2);
      expect(res.body[0].firstName).toEqual(keyword);
      expect(res.body[1].firstName).toEqual(keyword);
    });

    test('should return 200 and correctly apply filter on keyword field (different fields matching)', async () => {
      const firstNameMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'faker',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      const lastNameMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: faker.name.firstName(),
        lastName: 'faker',
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      await insertUsers([firstNameMatch, lastNameMatch, admin]);

      const keyword = 'faker';

      const res = await request(app)
        .get(`/api/users/search/inclusive?keyword=${keyword}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(2);
      expect(res.body[0].firstName).toEqual(keyword);
      expect(res.body[1].lastName).toEqual(keyword);
    });

    test('should return 200 and correctly apply filter on keyword field (partial matches)', async () => {
      const partialMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: 'faker@skt.kr',
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      await insertUsers([partialMatch, admin]);

      const keyword = 'faker';

      const res = await request(app)
        .get(`/api/users/search/inclusive?keyword=${keyword}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(1);
      expect(res.body[0].email).toContain(keyword);
    });

    test('should return 200 and correctly apply filter on keyword field (case-insensitive)', async () => {
      const lowerCaseMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'dusty',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      const upperCaseMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'Dusty',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      await insertUsers([lowerCaseMatch, upperCaseMatch, admin]);

      const keyword = 'dusty';

      const res = await request(app)
        .get(`/api/users/search/inclusive?keyword=${keyword}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(2);
      expect(res.body[0].firstName).toEqual(keyword);
      expect(res.body[1].firstName.toLowerCase()).toEqual(keyword);
    });

    test('should return 200 and correctly apply filter on keyword field (full name)', async () => {
      const fullNameMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'Matcha',
        lastName: 'Latte',
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      const notFullNameMatch = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'Matcha',
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past().toISOString(),
        gender: faker.random.arrayElement(genders),
        university: faker.random.arrayElement(uni),
        city: faker.address.city(),
        email: faker.internet.email().toLowerCase(),
        isCheckedIn: faker.random.boolean(),
        password: 'password1',
        role: 'user',
      };

      await insertUsers([fullNameMatch, notFullNameMatch, admin]);

      const keyword = 'Matcha Latte';

      const res = await request(app)
        .get(`/api/users/search/inclusive?keyword=${keyword}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(1);
      expect(res.body[0].firstName).toEqual(fullNameMatch.firstName);
      expect(res.body[0].lastName).toEqual(fullNameMatch.lastName);
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/api/users/search/inclusive?keyword=user').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying query users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/api/users/search/inclusive?keyword=user')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 if keyword field is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/api/users/search/inclusive')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if keyword field is empty', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app)
        .get('/api/users/search/inclusive?keyword=')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /api/users/updateRole/:userId', () => {
    test('should return 200 and successfully update user if admin is updating role of another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { role: 'admin' };

      await request(app)
        .patch(`/api/users/updateRole/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 403 if user is updating their role', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { role: 'admin' };

      await request(app)
        .patch(`/api/users/updateRole/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 if user is updating role of another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { role: 'admin' };

      await request(app)
        .patch(`/api/users/updateRole/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /api/users/updateCheckIn/:userId', () => {
    test('should return 200 and successfully update user if admin is updating check-in status of another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { isCheckedIn: true };

      await request(app)
        .patch(`/api/users/updateCheckIn/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 403 if user is updating their check-in status', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { isCheckedIn: true };

      await request(app)
        .patch(`/api/users/updateCheckIn/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 if user is updating check-in status of another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { isCheckedIn: true };

      await request(app)
        .patch(`/api/users/updateCheckIn/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /api/users/currentCheckIns/', () => {
    test('should correctly apply filter on isCheckedIn field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const n = await User.count({ isCheckedIn: true });

      const res = await request(app)
        .get('/api/users/currentCheckIns/total')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +1', async () => {
      await insertUsers([userOne, userTwo, admin]);

      let n = await User.count({ isCheckedIn: true });
      n += 1;

      const res = await request(app)
        .get('/api/users/currentCheckIns/plus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +2', async () => {
      await insertUsers([userOne, userTwo, admin]);

      let n = await User.count({ isCheckedIn: true });
      n += 2;

      const res = await request(app)
        .get('/api/users/currentCheckIns/plus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +2 -1', async () => {
      await insertUsers([userOne, userTwo, admin]);

      let n = await User.count({ isCheckedIn: true });
      n += 1;

      const res = await request(app)
        .get('/api/users/currentCheckIns/minus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +2 -2', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const n = await User.count({ isCheckedIn: true });

      const res = await request(app)
        .get('/api/users/currentCheckIns/minus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +2 -3', async () => {
      await insertUsers([userOne, userTwo, admin]);

      let n = await User.count({ isCheckedIn: true });
      if (n > 0) n -= 1;
      if (n < 0) n = 0;

      const res = await request(app)
        .get('/api/users/currentCheckIns/minus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });

    test('should correctly apply isCheckedIn +2 -4', async () => {
      await insertUsers([userOne, userTwo, admin]);

      let n = await User.count({ isCheckedIn: true });
      if (n > 0) n -= 2;
      if (n < 0) n = 0;

      const res = await request(app)
        .get('/api/users/currentCheckIns/minus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(n.toString());
    });
  });

  describe('POST /api/users/checkOutAll', () => {
    test('should correctly check out all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const n = await User.count();

      const res = await request(app)
        .post('/api/users/checkOutAll')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.nModified).toEqual(n);
    });
  });

  describe('POST /api/users/changeStatus', () => {
    test('should correctly change the status', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/api/users/changeStatus')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('open');
    });
  });

  describe('PATCH /api/users/changePassword/:userId', () => {
    test('should return 200 and successfully update password if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        oldPassword: userOne.password,
        newPassword: 'newPassword1',
      };

      await request(app)
        .patch(`/api/users/changePassword/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.oldPassword);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { oldPassword: userOne.password, newPassword: 'newPassword1' };

      await request(app).patch(`/api/users/changePassword/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating password of another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { oldPassword: userOne.password, newPassword: 'newPassword1' };

      await request(app)
        .patch(`/api/users/changePassword/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { oldPassword: userOne.password, newPassword: 'newPassword1' };

      await request(app)
        .patch(`/api/users/changePassword/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password length is less than 8 characters', async () => {
      await insertUsers([userOne]);
      const updateBody = { oldPassword: userOne.password, newPassword: 'passwo1' };

      await request(app)
        .patch(`/api/users/changePassword/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password does not contain both letters and numbers', async () => {
      await insertUsers([userOne]);
      const updateBody = { oldPassword: userOne.password, newPassword: 'password' };

      await request(app)
        .patch(`/api/users/changePassword/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/api/users/changePassword/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if old password is incorrect', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        oldPassword: 'wrongPassword1',
        newPassword: 'newPassword1',
      };

      jest.spyOn(User.prototype, 'isPasswordMatch').mockImplementation(() => false);

      await request(app)
        .patch(`/api/users/changePassword/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
