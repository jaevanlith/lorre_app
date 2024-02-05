# Lorre check-in web app

A check-in web app for a student discobar at Delft (Lorre). The app uses various libraries and packages listed below with some explanation and examples.

## Server

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Custom Mongoose Plugins](#custom-mongoose-plugins)
- [Linting](#linting)
- [Navigation](#navigation)
- [Forms](#forms)
- [Analytics Charts](#analytics-charts)
- [QR](#qr)
- [Image Cropper](#image-cropper)
- [City Select](#city-select)

## Features

- **ES9**: latest ECMAScript features
- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Testing**: unit and integration tests using [Jest](https://jestjs.io)
- **Error handling**: centralized error handling mechanism
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **CI**: continuous integration with [GitLab CI](https://docs.gitlab.com/ee/ci/)
- **Docker support**
- **Code coverage**: using [coveralls](https://coveralls.io)
- **Code quality**: with [Codacy](https://www.codacy.com)
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)

## Getting Started

### Installation

Clone the repo:

```bash
git clone https://gitlab.ewi.tudelft.nl/cse2000-software-project/2020-2021-q2/1c/lorre-check-in-app.git
cd lorre-check-in-app
```

Install the dependencies:

```bash
yarn build
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

### Commands

Running locally:

```bash
yarn run server
```

Running client:

```bash
yarn run client
```

Running server + client locally:

```bash
yarn dev
```

Testing:

```bash
# run all tests
yarn test:server

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage

# run all client test
cd client
yarn test
```

Docker:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod

# run all tests in a docker container
yarn docker:test
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

## Project Structure

```
client\
 |--build\         	# Build related things
 |--node_modules\  	# Installed modules
 |--public\        	# Root HTML template
 |--src\
  |--Admin\        	# Admin screens
   |--Components\  	# Admin screens components
   |--stylesheets\  # Admin css files
  |--Home\         	# Home screens
   |--Components\  	# Home screens components
   |--stylesheets\  # Home css files
  |--resources\     # resources used on all screens
    |--font\        # web font
  |--routes\       	# Custom routes (check login status)
  |--services\     	# Logic available to components
  |--User\         	# User screens
    |--Components\ 	# User screens components
    |--stylesheets\ # User css files
  |--utils\        	# API
  |--history.js    	# Browser history
  |--index.css     	# Entry point styling
  |--index.js		    # Entry point
  |--reportWebVitals.js	# Performance
  |--setupTests.js	# Test configuration
server\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
 |--tests\
  |--fixtures\      # Custom mock classes
  |--integration\   # Integration tests
  |--unit\          # Unit tests
  |--utils\         # Utility classes and functions
```

## API Documentation

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /api/auth/register` - register\
`POST /api/auth/login` - login\
`POST /api/auth/logout` - logout\
`POST /api/auth/refresh-tokens` - refresh auth tokens\
`POST /api/auth/forgot-password` - send reset password email\
`POST /api/auth/reset-password` - reset password

**User routes**:\
`POST /api/users` - create a user\
`GET /api/users` - get all users\
`GET /api/users/:userId` - get user\
`PATCH /api/users/:userId` - update user\
`DELETE /api/users/:userId` - delete user\
`PATCH /api/users/updateRole/:userId` - update user's role\
`PATCH /api/users/updateCheckIn/:userId` - update checkIn status\
`GET /api/users/currentCheckIns/total` - get total checkins\
`GET /api/users/currentCheckIns/plus` - increase total checkins\
`GET /api/users/currentCheckIns/minus` - decrease total checkins\
`POST /api/users/checkOutAll` - decrease total checkins to 0\
`POST /api/users/changeStatus` - change open status of Lorre

**CheckIn routes**:\
`POST /api/checkIns` - add check-in\
`GET /api/checkIns` - get check-ins\
`DELETE /api/checkIns/:userId` - delete all check-ins for user by admin\
`GET /api/history/:userId` - get history of check-ins for user\
`GET /api/clearHistory/:userId` - clears history of check-ins for user by user

**Ticket routes**:\
`POST /api/tickets` - create ticket\
`GET /api/tickets` - get tickets\
`GET /api/tickets/:ticketId` - get ticket\
`PATCH /api/tickets/:ticketId` - update ticket\
`DELETE /api/tickets/:ticketId` - delete ticket\
`GET /api/tickets/get/:userId` - get tickets for user

**Analytics routes**:\
`GET /api/analytics/queryTimeInterval` - get queried data within time interval\
`GET /api/analytics/queryAllTime` - get queried data

### Calling API

If data is needed immediately when the page is loaded, the API call is done in the componentDidMount() method. Otherwise, the API call should be placed in a method which is called on a user action.

A custom axios instance is created in client/utils/API.js. To use it, import it in a component, call a method with a specified route on it and include the needed data. Either a response or an error is returned, which should be handled by then() or catch() respectively. The following example retrieves the data of a user with id '1234':

```javascript
import api from '/apiPath';

api
 .get('/users/1234')
 .then((response) => // Do something with response)
 .catch((error) => // Do something with error);
```

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
const catchAsync = require('../utils/catchAsync');

const controller = catchAsync(async (req, res) => {
  // this error will be forwarded to the error handling middleware
  throw new Error('Something wrong happened');
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
};
```

## Validation

Request data is validated using [Joi](https://hapi.dev/family/joi/). Check the [documentation](https://hapi.dev/family/joi/api/) for more details on how to write Joi validation schemas.

The validation schemas are defined in the `server/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

```javascript
const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);
```

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', auth(), userController.createUser);
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /api/auth/register`) or login (`POST /api/auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

An access token is valid for 30 minutes. You can modify this expiration time by changing the `JWT_ACCESS_EXPIRATION_MINUTES` environment variable in the .env file.

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /api/auth/refresh-tokens`) and sending along a valid refresh token in the request body. This call returns a new access token and a new refresh token.

A refresh token is valid for 30 days. You can modify this expiration time by changing the `JWT_REFRESH_EXPIRATION_DAYS` environment variable in the .env file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', auth(true, 'manageUsers'), userController.createUser);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

Set to `true` if only correct rights determine whether the request is authorized; `false` if matching userid and rights are both valid authorization.

The permissions are role-based. You can view the permissions/rights of each role in the `server/config/roles.js` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `server/utils/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
const logger = require('<path to server>/utils/logger');

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Custom Mongoose Plugins

The app also contains 2 custom mongoose plugins that you can attach to any mongoose model schema. You can find the plugins in `server/models/plugins`.

```javascript
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    /* schema definition here */
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
```

### toJSON

The toJSON plugin applies the following changes in the toJSON transform call:

- removes \_\_v, createdAt, updatedAt, and any schema path that has private: true
- replaces \_id with id

### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```javascript
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```javascript
const options = {
  sortBy: 'name:desc', // sort order
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```

## Linting

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

In this app, ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Navigation

Navagating is done using the React Router library. All screens have a root React component and are divided into three categories: home, user and admin.

### Home screens | Public
- Login
- Register
- Reset Password
- New Password

### User screens | Private for user
- Overview
- Account Details
- Edit Password

### Admin screens | Private for admin
- Tools
- Check-in
- Catalog
- Analytics
- User Details
- New User Form
- New Pass Form

To check the login status we use custom routes, derived from the Route component from the React Router library. Every category has their own custom route.

### Custom routes
- Home Route
  - Not logged in? Grant access
  - Logged in?
    - Admin? Redirect to /Admin/Tools
    - User? Redirect to /User/Overview
- User Route
  - Not logged in? Redirect to /Login
  - Logged in?
    - Admin? Redirect to /Admin/Tools
    - User? Grant access
- Admin Route
  - Not logged in? Redirect to /Login
  - Logged in?
    - Admin? Grant access
    - User? Redirect to /User/Overview

## Forms

The front-end relies partly on the use of forms. We use them in almost every class. They help us aquire information about the user and interact with the client

### Form attribute
We make use of the html ```<form>``` tag.

### handleChange method
We use this in the classes with a form element. An example:
```javascript
handleChange = (e) => { //1
  let user = [...this.state.user]; //2
  let id = e.currentTarget.id; //3
  const index = id - 1; //4
  let item = { ...user[index] }; //5
  item.value = e.currentTarget.value; //6
  user[index] = item; //7
  this.setState({ user }); //8
}
```

In this case the user is changed. User is an array in the state.
E is the Change event, e.target.id gives the id of the input field in which the change happenend, e.target.value gets the value of the input field.
In line 2, a shallow copy of an attrivute of the state is made.
In line 3, the id of the input field is retrieved.
In line 4, the index of the element to be changed in the state.user]
In line 5, a shallow copy is made of the current element at the index of line 4.
In line 6, the old value is set to the new value retrieved from the change event.
In line 7, the element of the user is set to the new element with the changed value.
In line 8, the state.user is set to the new user with the changed value.

### handleSubmit method
Every form has to be submitted. The forms usually have a button of type submit. When this is clicked the form will be submitted.
Then the handleSubmit method will be called.
The first line is most likely:
e.preventDefault();
In this case e is the submit event.
We call preventDefault on this event because otherwise the page will be reloaded. That is not wanted.
After this line we will handle the data given by the event.

## Analytics charts

To retrieve analytics an admin has to fill out a form where they specify a wanted category and a time interval. On submission, a query is created and the API is called. The server returns an array of check-ins, including the time of the check-in and the properties of the user that checked-in. That array is then mapped to a dataset that can be displayed using Chart js. Chart js offers a variety of chart types. Below an example of how to create a pie chart is provided.

```javascript
data: {
      labels: ['Man', 'Vrouw', 'Anders'], // Specify the x-axis
      datasets: [                         // Include the datasets that should be displayed
        {
          label: 'Geslacht',
          data: [0, 0, 0],                // This array provides the values per label
          backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'], // This array provides the colors per label
        },
      ],
    }
```
Then pass the data into a Chart js pie chart component.
```javascript
<Pie data={data} />
```

## QR

To generate QR codes we have made use of qrcode.react, where you simply provide a value from which the QR code is generated. To scan the QR codes we used react-qr-reader. It lets you specify a delay (time between scanning), a function to call on a scanning error and a function to call on a succesful scan. The succesful scan function receives a parameter, which is the value of the QR code.

## Image cropper

It is required to upload an image when buying or adding a pass. To prevent weird image dimensions and deformation, we make use of a react-image-crop. We have created a separate component Cropper to handle uploading of the image and resizing. One can just import this component and assign an onComplete method, which will receive the parameter: cropped image as BASE-64 string.

## City Select
When registering you can opt for adding the city or town in which you are currently living. To provide the user with choices we used the country-state-city library. We then selected the Netherlands for country, looped over it's states and added each of each state to an array. That array is used to provide the user with a select containing some of the netherlands cities and towns.

## [License](LICENSE.md)

[MIT](LICENSE)
