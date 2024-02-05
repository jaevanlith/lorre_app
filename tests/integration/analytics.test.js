const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../server/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const {
  analyticsCheckInOne,
  analyticsCheckInTwo,
  analyticsCheckInThree,
  insertCheckIns,
} = require('../fixtures/checkIn.fixture');

setupTestDB();

describe('Analytics routes', () => {
  describe('GET /api/analytics/queryTimeInterval', () => {
    test('should return 200 and successfully return the check-ins and user data if data is ok', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get(`/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInTwo.date}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          email: userOne.email,
          firstName: userOne.firstName,
          lastName: userOne.lastName,
          gender: userOne.gender,
          city: userOne.city,
          university: userOne.university,
          isCheckedIn: userOne.isCheckedIn,
          role: userOne.role,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(`/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInTwo.date}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user tries to access the check-in data', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(`/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInTwo.date}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if startDate is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(`/api/analytics/queryTimeInterval?endDate=${analyticsCheckInTwo.date}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if endDate is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(`/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 200 and the check-ins with selected data fields', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get(
          `/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInThree.date}&city=1&gender=1&dateOfBirth=1&university=1`
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          gender: userOne.gender,
          city: userOne.city,
          university: userOne.university,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 200 and correctly exclude fields set to 0', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get(
          `/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInThree.date}&city=1&gender=1&dateOfBirth=0&university=0`
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          gender: userOne.gender,
          city: userOne.city,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 200 and correctly exclude unselected fields (not present)', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get(
          `/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInThree.date}&dateOfBirth=1&university=1`
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          university: userOne.university,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 400 error if date is invalid', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(`/api/analytics/queryTimeInterval?startDate=invalidDate&endDate=invalidDate`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if selected fields are invalid', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get(
          `/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInThree.date}&city=invalid&gender=1&dateOfBirth=1&university=1`
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 200 and only check-ins on the same day if startDate and endDate are the same day', async () => {
      await insertUsers([userOne, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get(
          `/api/analytics/queryTimeInterval?startDate=${analyticsCheckInOne.date}&endDate=${analyticsCheckInOne.date}&city=1&gender=1&dateOfBirth=1&university=1`
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          gender: userOne.gender,
          city: userOne.city,
          university: userOne.university,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });
  });

  describe('GET /api/analytics/queryAllTime', () => {
    test('should return 200 and successfully return all check-ins and user data if data is ok', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get('/api/analytics/queryAllTime')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          email: userOne.email,
          firstName: userOne.firstName,
          lastName: userOne.lastName,
          gender: userOne.gender,
          city: userOne.city,
          university: userOne.university,
          isCheckedIn: userOne.isCheckedIn,
          role: userOne.role,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app).get('/api/analytics/queryAllTime').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user tries to access the check-in data', async () => {
      await insertUsers([userOne]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get('/api/analytics/queryAllTime')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the check-ins with selected data fields', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get('/api/analytics/queryAllTime?city=1&gender=1&dateOfBirth=1&university=1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          gender: userOne.gender,
          city: userOne.city,
          university: userOne.university,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 200 and correctly exclude fields set to 0', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get('/api/analytics/queryAllTime?city=1&gender=1&dateOfBirth=0&university=0')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          gender: userOne.gender,
          city: userOne.city,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 200 and correctly exclude unselected fields (not present)', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      const res = await request(app)
        .get('/api/analytics/queryAllTime?dateOfBirth=1&university=1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toEqual({
        date: analyticsCheckInOne.date,
        userId: {
          id: userOne._id.toHexString(),
          dateOfBirth: userOne.dateOfBirth,
          university: userOne.university,
        },
        id: analyticsCheckInOne._id.toHexString(),
      });
    });

    test('should return 400 error if selected fields are invalid', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertCheckIns([analyticsCheckInOne, analyticsCheckInTwo, analyticsCheckInThree]);

      await request(app)
        .get('/api/analytics/queryAllTime?city=invalid&gender=1&dateOfBirth=1&university=1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
