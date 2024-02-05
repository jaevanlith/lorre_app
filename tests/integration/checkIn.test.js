const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../server/app');
const setupTestDB = require('../utils/setupTestDB');
const { CheckIn } = require('../../server/models');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const {
  checkInOne,
  checkInTwo,
  dbCheckInOne,
  dbCheckInTwo,
  dbCheckInThree,
  insertCheckIns,
} = require('../fixtures/checkIn.fixture');

setupTestDB();

describe('Check-in routes', () => {
  describe('POST /api/checkIns', () => {
    let newCheckIn;

    beforeEach(() => {
      newCheckIn = {
        userId: userOne._id,
        date: faker.date.past().toISOString(),
      };
    });

    test('should return 201 and successfully create new check-in if data is ok', async () => {
      await insertUsers([userOne, admin]);

      const res = await request(app)
        .post('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCheckIn)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        userId: newCheckIn.userId.toHexString(),
        date: newCheckIn.date,
        inHistory: true,
      });

      const checkInId = res.body.id;
      const dbCheckIn = await CheckIn.findById(checkInId);
      expect(dbCheckIn).toBeDefined();
      expect(dbCheckIn).toMatchObject({
        id: checkInId,
        userId: newCheckIn.userId,
        date: new Date(newCheckIn.date),
        inHistory: true,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/api/checkIns').send(newCheckIn).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user tries to create a check-in', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/api/checkIns')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newCheckIn)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId doesnt exist', async () => {
      await insertUsers([admin]);

      await request(app)
        .post('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCheckIn)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/checkIns', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin]);
      await insertCheckIns([checkInOne, checkInTwo]);

      const res = await request(app)
        .get('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
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
      expect(res.body.results[0]).toEqual({
        id: checkInOne._id.toHexString(),
        userId: checkInOne.userId.toHexString(),
        date: checkInOne.date,
        inHistory: checkInOne.inHistory,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertCheckIns([checkInOne, checkInTwo]);

      await request(app).get('/api/checkIns').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all tickets', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([checkInOne, checkInTwo]);

      await request(app)
        .get('/api/checkIns')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on userId field', async () => {
      await insertUsers([admin]);
      await insertCheckIns([checkInOne, checkInTwo]);

      const res = await request(app)
        .get('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ userId: checkInOne.userId.toHexString() })
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
      expect(res.body.results[0].userId).toBe(checkInOne.userId.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin]);
      await insertCheckIns([checkInOne, checkInTwo]);

      const res = await request(app)
        .get('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(checkInOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin]);
      await insertCheckIns([checkInOne, checkInTwo]);

      const res = await request(app)
        .get('/api/checkIns')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(checkInTwo._id.toHexString());
    });
  });

  describe('DELETE /api/checkIns/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, admin]);
      await insertCheckIns([dbCheckInOne]);

      await request(app)
        .delete(`/api/checkIns/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbCheckIn = await CheckIn.findById(dbCheckInOne._id);
      expect(dbCheckIn).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertCheckIns([dbCheckInOne]);

      await request(app).delete(`/api/checkIns/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to permanently delete stored check-ins', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/api/checkIns/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/api/checkIns/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user doesnt exist', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/api/checkIns/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/checkIns/history/:userId', () => {
    test('should return 200 and the checkins if data is ok', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo]);

      const res = await request(app)
        .get(`/api/checkIns/history/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({
        id: dbCheckInOne._id.toHexString(),
        date: dbCheckInOne.date,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo]);

      await request(app).get(`/api/checkIns/history/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to get another user's check-in history", async () => {
      await insertUsers([userOne, userTwo]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo]);

      await request(app)
        .get(`/api/checkIns/history/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 200 and the check-ins if admin is trying to get a user's check-in history", async () => {
      await insertUsers([userOne, admin]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo, dbCheckInThree]);

      await request(app)
        .get(`/api/checkIns/history/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo]);

      await request(app)
        .get('/api/checkIns/history/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 404 error if user doesn't exist", async () => {
      await insertUsers([admin]);
      await insertCheckIns([dbCheckInTwo]);

      await request(app)
        .get(`/api/checkIns/history/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
  describe('GET /api/checkIns/clearHistory/:userId', () => {
    test("should return 204 and set inHistory to false for all the user's check-ins if data is ok", async () => {
      await insertUsers([userOne]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo, dbCheckInThree]);

      await request(app)
        .get(`/api/checkIns/clearHistory/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const updatedCheckInOne = await CheckIn.findById(dbCheckInOne._id);
      expect(updatedCheckInOne.inHistory).toEqual(false);

      const updatedCheckInThree = await CheckIn.findById(dbCheckInThree._id);
      expect(updatedCheckInThree.inHistory).toEqual(false);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo, dbCheckInThree]);

      await request(app).get(`/api/checkIns/clearHistory/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to clear another user's check-in history", async () => {
      await insertUsers([userOne, userTwo]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo, dbCheckInThree]);

      await request(app)
        .get(`/api/checkIns/clearHistory/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 403 error if admin is trying to clear a user's check-in history", async () => {
      await insertUsers([userOne, admin]);
      await insertCheckIns([dbCheckInOne, dbCheckInTwo, dbCheckInThree]);

      await request(app)
        .get(`/api/checkIns/clearHistory/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
