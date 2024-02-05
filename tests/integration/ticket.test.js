const request = require('supertest');
const faker = require('faker');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { addYears, format, subWeeks } = require('date-fns');
const app = require('../../server/app');
const setupTestDB = require('../utils/setupTestDB');
const { ticketService, emailService } = require('../../server/services');
const { Ticket, User, CheckIn } = require('../../server/models');
const { ticketTypes } = require('../../server/config/ticketTypes');
const { ticketOne, ticketTwo, userTicketOne, userTicketTwo, insertTickets } = require('../fixtures/ticket.fixture');
const { userOne, userTwo, admin, checkedInUser, notCheckedInUser, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Ticket routes', () => {
  describe('POST /api/tickets', () => {
    let newTicket;

    beforeEach(() => {
      newTicket = {
        userId: userOne._id,
        type: faker.random.arrayElement(ticketTypes),
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.past().toISOString(),
        img: faker.image.dataUri(),
      };
    });

    test('should return 201 and successfully create new ticket with given start and end date', async () => {
      await insertUsers([userOne, admin]);

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTicket)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        userId: newTicket.userId.toHexString(),
        type: newTicket.type,
        startDate: newTicket.startDate,
        endDate: newTicket.endDate,
        img: newTicket.img,
      });

      const ticketId = res.body.id;
      const dbTicket = await Ticket.findById(ticketId);
      expect(dbTicket).toBeDefined();
      expect(dbTicket).toMatchObject({
        id: ticketId,
        userId: newTicket.userId,
        type: newTicket.type,
        startDate: new Date(newTicket.startDate),
        endDate: new Date(newTicket.endDate),
        img: newTicket.img,
      });
    });

    test('should return 201 and successfully create new ticket with given startDate and set endDate to startDate + 1 year', async () => {
      await insertUsers([userOne, admin]);

      const newTicketStart = {
        userId: userOne._id,
        type: faker.random.arrayElement(ticketTypes),
        startDate: faker.date.past().toISOString(),
        img: faker.image.dataUri(),
      };

      const expectedEndDate = addYears(new Date(newTicketStart.startDate), 1).toISOString();

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTicketStart)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        userId: newTicketStart.userId.toHexString(),
        type: newTicketStart.type,
        startDate: newTicketStart.startDate,
        endDate: expectedEndDate,
        img: newTicketStart.img,
      });

      const ticketId = res.body.id;
      const dbTicket = await Ticket.findById(ticketId);
      expect(dbTicket).toBeDefined();
      expect(dbTicket).toMatchObject({
        id: ticketId,
        userId: newTicketStart.userId,
        type: newTicketStart.type,
        startDate: new Date(newTicketStart.startDate),
        endDate: new Date(expectedEndDate),
        img: newTicketStart.img,
      });
    });

    test('should return 201 and successfully create new ticket when no dates given and automatically set start and end date', async () => {
      await insertUsers([userOne, admin]);

      const newTicketNoDates = {
        userId: userOne._id,
        type: faker.random.arrayElement(ticketTypes),
        img: faker.image.dataUri(),
      };

      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2020-12-20T00:00:00.000Z'));

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTicketNoDates)
        .expect(httpStatus.CREATED);

      expect(res.body.startDate).toBeDefined();
      const expectedEndDate = addYears(new Date(res.body.startDate), 1).toISOString();

      expect(res.body).toEqual({
        id: expect.anything(),
        userId: newTicketNoDates.userId.toHexString(),
        type: newTicketNoDates.type,
        startDate: '2020-12-20T00:00:00.000Z',
        endDate: expectedEndDate,
        img: newTicket.img,
      });

      const ticketId = res.body.id;
      const dbTicket = await Ticket.findById(ticketId);
      expect(dbTicket).toBeDefined();
      expect(dbTicket).toMatchObject({
        id: ticketId,
        userId: newTicketNoDates.userId,
        type: newTicketNoDates.type,
        startDate: new Date('2020-12-20T00:00:00.000Z'),
        endDate: new Date(expectedEndDate),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/api/tickets').send(newTicket).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user tries to create a ticket', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTicket)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId doesnt exist', async () => {
      await insertUsers([admin]);

      await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTicket)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/tickets', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      const res = await request(app)
        .get('/api/tickets')
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
        id: ticketOne._id.toHexString(),
        userId: ticketOne.userId.toHexString(),
        type: ticketOne.type,
        startDate: ticketOne.startDate,
        endDate: ticketOne.endDate,
        img: ticketOne.img,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertTickets([ticketOne, ticketTwo]);

      await request(app).get('/api/tickets').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all tickets', async () => {
      await insertUsers([userOne]);
      await insertTickets([ticketOne, ticketTwo]);

      await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on userId field', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ userId: ticketOne.userId.toHexString() })
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
      expect(res.body.results[0].userId).toBe(ticketOne.userId.toHexString());
    });

    test('should correctly apply filter on type field', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      let expected = 1;
      if (ticketOne.type === ticketTwo.type) {
        expected = 2;
      }

      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ type: ticketOne.type })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: expected,
      });
      expect(res.body.results).toHaveLength(expected);
      expect(res.body.results[0].type).toBe(ticketOne.type);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      const res = await request(app)
        .get('/api/tickets')
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
      expect(res.body.results[0].id).toBe(ticketOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      const res = await request(app)
        .get('/api/tickets')
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
      expect(res.body.results[0].id).toBe(ticketTwo._id.toHexString());
    });
  });

  describe('GET /api/tickets/:ticketId', () => {
    test('should return 200 and the ticket object if data is ok', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne, ticketTwo]);

      const res = await request(app)
        .get(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: ticketOne._id.toHexString(),
        userId: ticketOne.userId.toHexString(),
        type: ticketOne.type,
        startDate: ticketOne.startDate,
        endDate: ticketOne.endDate,
        img: ticketOne.img,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTickets([ticketOne]);

      await request(app).get(`/api/tickets/${ticketOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get a ticket', async () => {
      await insertUsers([userOne]);
      await insertTickets([ticketOne]);

      await request(app)
        .get(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if ticketId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/api/tickets/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if ticket is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne]);

      await request(app)
        .delete(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTicket = await Ticket.findById(ticketOne._id);
      expect(dbTicket).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTickets([ticketOne]);

      await request(app).delete(`/api/tickets/${ticketOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete a pass', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if ticketId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/api/tickets/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if ticket is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/tickets/:ticketId', () => {
    test('should return 200 and successfully update ticket if data is ok', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne]);

      const updateBody = {
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.future().toISOString(),
        img: faker.image.dataUri(),
      };

      const res = await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: ticketOne._id.toHexString(),
        userId: ticketOne.userId.toHexString(),
        type: ticketOne.type,
        startDate: updateBody.startDate,
        endDate: updateBody.endDate,
        img: updateBody.img,
      });

      const dbTicket = await Ticket.findById(ticketOne._id);
      expect(dbTicket).toBeDefined();
      expect(dbTicket).toMatchObject({
        id: ticketOne._id.toHexString(),
        userId: ticketOne.userId,
        type: ticketOne.type,
        startDate: new Date(updateBody.startDate),
        endDate: new Date(updateBody.endDate),
        img: updateBody.img,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTickets([ticketOne]);
      const updateBody = { startDate: faker.date.past().toISOString() };

      await request(app).patch(`/api/tickets/${ticketOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating a pass', async () => {
      await insertUsers([userOne]);
      await insertTickets([ticketOne]);
      const updateBody = { startDate: faker.date.past().toISOString() };

      await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if admin is updating another ticket that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { endDate: faker.date.future().toISOString() };

      await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if ticketId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { endDate: faker.date.future() };

      await request(app)
        .patch(`/api/tickets/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if date is invalid', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne]);
      const updateBody = { endDate: 'invalid' };

      await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if trying to update userId', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne]);
      const updateBody = { userId: admin._id.toHexString() };

      await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if trying to update type', async () => {
      await insertUsers([admin]);
      await insertTickets([ticketOne]);

      let updateBody;

      if (ticketOne.type === 'year') {
        updateBody = { type: 'one-time' };
      } else {
        updateBody = { type: 'year' };
      }

      await request(app)
        .patch(`/api/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/tickets/get/:userId', () => {
    test('should return 200 and the tickets if data is ok', async () => {
      await insertUsers([userOne, admin]);
      await insertTickets([userTicketOne, userTicketTwo]);

      const res = await request(app)
        .get(`/api/tickets/get/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body[0]).toEqual({
        id: userTicketOne._id.toHexString(),
        userId: userTicketOne.userId.toHexString(),
        type: userTicketOne.type,
        startDate: userTicketOne.startDate,
        endDate: userTicketOne.endDate,
        img: userTicketOne.img,
      });
    });

    test('should return 200 and the tickets if user tries to get their own tickets', async () => {
      await insertUsers([userOne]);
      await insertTickets([userTicketOne, userTicketTwo]);

      const res = await request(app)
        .get(`/api/tickets/get/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expect.any(Array));
      expect(res.body[0]).toEqual({
        id: userTicketOne._id.toHexString(),
        userId: userTicketOne.userId.toHexString(),
        type: userTicketOne.type,
        startDate: userTicketOne.startDate,
        endDate: userTicketOne.endDate,
        img: userTicketOne.img,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertTickets([userTicketOne]);

      await request(app).get(`/api/tickets/get/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get tickets of another user', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTickets([userTicketOne, userTicketTwo]);

      await request(app)
        .get(`/api/tickets/get/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/api/tickets/get/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/api/tickets/get/${userOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/tickets/verify/:ticketId', () => {
    test('should add check-in, update user check in status and return 200 and a success message if data is ok (year ticket)', async () => {
      const yearTicket = {
        _id: mongoose.Types.ObjectId(),
        userId: notCheckedInUser._id,
        type: 'year',
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.future().toISOString(),
        img: faker.image.dataUri(),
      };

      await insertUsers([admin, notCheckedInUser]);
      await insertTickets([yearTicket]);

      const mockDate = new Date('2020-12-20T00:00:00.000Z');
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate);

      const res = await request(app)
        .get(`/api/tickets/verify/${yearTicket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('Inchecken gelukt');

      // check if user status is updated
      const dbUser = await User.findById(notCheckedInUser._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.isCheckedIn).toEqual(true);

      // check if check-in is added
      const dbCheckIn = await CheckIn.findOne({ userId: notCheckedInUser._id });
      expect(dbCheckIn).toBeDefined();
      expect(dbCheckIn).toMatchObject({
        id: expect.anything(),
        userId: notCheckedInUser._id,
        date: mockDate,
        inHistory: true,
      });
    });

    test('should add check-in, update user check in status and make ticket invalid and return 200 and a success message (one-time ticket)', async () => {
      const oneTimeTicket = {
        _id: mongoose.Types.ObjectId(),
        userId: notCheckedInUser._id,
        type: 'one-time',
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.future().toISOString(),
        img: faker.image.dataUri(),
      };

      await insertUsers([admin, notCheckedInUser]);
      await insertTickets([oneTimeTicket]);

      const mockDate = new Date('2020-12-20T00:00:00.000Z');
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate);

      const res = await request(app)
        .get(`/api/tickets/verify/${oneTimeTicket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('Inchecken gelukt');

      // check if user status is updated
      const dbUser = await User.findById(notCheckedInUser._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.isCheckedIn).toEqual(true);

      // check if ticket end date is updated
      const dbTicket = await Ticket.findById(oneTimeTicket._id);
      expect(dbTicket).toBeDefined();
      expect(dbTicket.endDate).toEqual(mockDate);

      // check if check-in is added
      const dbCheckIn = await CheckIn.findOne({ userId: notCheckedInUser._id });
      expect(dbCheckIn).toBeDefined();
      expect(dbCheckIn).toMatchObject({
        id: expect.anything(),
        userId: notCheckedInUser._id,
        date: mockDate,
        inHistory: true,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTickets([ticketOne]);

      await request(app).get(`/api/tickets/verify/${ticketOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to verify a ticket', async () => {
      await insertUsers([userOne]);
      await insertTickets([userTicketOne]);

      await request(app)
        .get(`/api/tickets/verify/${userTicketOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if ticketId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/api/tickets/verify/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return a failure message if ticketId is not found', async () => {
      await insertUsers([admin]);

      const randomId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/tickets/verify/${randomId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('Mislukt - Ongeldige QR code');
    });

    test('should return a failure message if year ticket is expired', async () => {
      const expiredTicket = {
        _id: mongoose.Types.ObjectId(),
        userId: notCheckedInUser._id,
        type: 'year',
        startDate: faker.date.past(),
        endDate: faker.date.past(),
        img: faker.image.dataUri(),
      };

      const formattedDate = format(expiredTicket.endDate, "dd/MM/yyyy 'om' HH:mm 'uur'");

      await insertUsers([admin, notCheckedInUser]);
      await insertTickets([expiredTicket]);

      const res = await request(app)
        .get(`/api/tickets/verify/${expiredTicket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(`Mislukt - Ticket is verlopen op ${formattedDate}`);
    });

    test('should return a failure message if one-time ticket has been used before', async () => {
      const usedTicket = {
        _id: mongoose.Types.ObjectId(),
        userId: notCheckedInUser._id,
        type: 'one-time',
        startDate: faker.date.past(),
        endDate: faker.date.past(),
        img: faker.image.dataUri(),
      };

      const formattedDate = format(usedTicket.endDate, "dd/MM/yyyy 'om' HH:mm 'uur'");

      await insertUsers([admin, notCheckedInUser]);
      await insertTickets([usedTicket]);

      const res = await request(app)
        .get(`/api/tickets/verify/${usedTicket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual(`Mislukt - Ticket is al gebruikt op ${formattedDate}`);
    });

    test('should return a failure message if user cannot be found', async () => {
      const randomUserId = mongoose.Types.ObjectId();
      const ticket = {
        _id: mongoose.Types.ObjectId(),
        userId: randomUserId,
        type: 'year',
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        img: faker.image.dataUri(),
      };

      await insertUsers([admin]);
      await insertTickets([ticket]);

      const res = await request(app)
        .get(`/api/tickets/verify/${ticket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('Mislukt - Gebruiker niet gevonden');
    });

    test('should return a failure message if user is already checked in', async () => {
      const checkedInTicket = {
        _id: mongoose.Types.ObjectId(),
        userId: checkedInUser._id,
        type: 'year',
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.future().toISOString(),
        img: faker.image.dataUri(),
      };

      await insertUsers([admin, checkedInUser]);
      await insertTickets([checkedInTicket]);

      const res = await request(app)
        .get(`/api/tickets/verify/${checkedInTicket._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.text).toEqual('Mislukt - Gebruiker is al ingecheckt');
    });
  });
});

describe('Ticket expiration notifications', () => {
  test('should find tickets that expire in 2 weeks and send a email notification to the corresponding users', async () => {
    const expirationDate = new Date('2020-12-20T00:00:00.000Z');

    const nearlyExpiredOne = {
      _id: mongoose.Types.ObjectId(),
      userId: userOne._id,
      type: 'year',
      startDate: faker.date.past(),
      endDate: expirationDate,
      img: faker.image.dataUri(),
    };

    const nearlyExpiredTwo = {
      _id: mongoose.Types.ObjectId(),
      userId: userTwo._id,
      type: 'one-time',
      startDate: faker.date.past(),
      endDate: expirationDate,
      img: faker.image.dataUri(),
    };

    const notNearlyExpired = {
      _id: mongoose.Types.ObjectId(),
      userId: notCheckedInUser._id,
      type: 'year',
      startDate: faker.date.past().toISOString(),
      endDate: faker.date.future().toISOString(),
      img: faker.image.dataUri(),
    };

    await insertUsers([userOne, userTwo, notCheckedInUser]);
    await insertTickets([nearlyExpiredOne, nearlyExpiredTwo, notNearlyExpired]);

    const mockCurrentDate = subWeeks(expirationDate, 2);

    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(mockCurrentDate));
    jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    const reminderTicketExpirationEmailSpy = jest.spyOn(emailService, 'reminderTicketExpirationEmail');

    await ticketService.twoWeekExpirationNotification();

    expect(reminderTicketExpirationEmailSpy).toHaveBeenCalledTimes(2);
    expect(reminderTicketExpirationEmailSpy).not.toHaveBeenCalledWith(notNearlyExpired);

    const callTicketOne = reminderTicketExpirationEmailSpy.mock.calls[0][0];
    expect(callTicketOne).toBeDefined();
    const callTicketTwo = reminderTicketExpirationEmailSpy.mock.calls[1][0];
    expect(callTicketTwo).toBeDefined();

    expect(callTicketOne.endDate).toEqual(expirationDate);
    expect(callTicketTwo.endDate).toEqual(expirationDate);
    expect(callTicketOne).not.toEqual(callTicketTwo);
  });

  test('should not send any emails if no tickets expire in two weeks', async () => {
    const expirationDate = new Date('2020-12-20T00:00:00.000Z');

    const notNearlyExpired = {
      _id: mongoose.Types.ObjectId(),
      userId: notCheckedInUser._id,
      type: 'year',
      startDate: faker.date.past().toISOString(),
      endDate: faker.date.future().toISOString(),
      img: faker.image.dataUri(),
    };

    await insertUsers([notCheckedInUser]);
    await insertTickets([notNearlyExpired]);

    const mockCurrentDate = subWeeks(expirationDate, 2);

    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(mockCurrentDate));
    jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    const reminderTicketExpirationEmailSpy = jest.spyOn(emailService, 'reminderTicketExpirationEmail');

    await ticketService.twoWeekExpirationNotification();

    expect(reminderTicketExpirationEmailSpy).not.toHaveBeenCalled();
  });
});
