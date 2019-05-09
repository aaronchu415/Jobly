process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

var testJobID;
var testUserLogin = {};
var testUserLogin2 = {};

beforeEach(async function () {
  await db.query("DELETE FROM users");

  //create an admin 
  let user = {
    username: "tim123",
    password: "password",
    first_name: "tim",
    last_name: "garcia",
    email: "tim@rithmschool.com",
    is_admin: true
  };

  //create a non admin 
  let user2 = {
    username: "mat123",
    password: "password",
    first_name: "mat",
    last_name: "lane",
    email: "mat@rithmschool.com",
    is_admin: false
  };

  await request(app)
    .post("/users")
    .send(user);

  await request(app)
    .post("/users")
    .send(user2);

  testUserLogin.username = 'tim123';
  testUserLogin.password = 'password';

  testUserLogin2.username = 'mat123';
  testUserLogin2.password = 'password';

});

afterEach(async function () {
  // await db.query("DELETE FROM jobs");
  // await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");
});

afterAll(async function () {
  await db.end();
});

describe("Login as admin /users/login", function () {

  test("Sucessful admin login and token response", async function () {

    const response = await request(app)
      .post("/users/login")
      .send(testUserLogin);


    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');

    const token = response.body.token;
    const payload = jwt.verify(token, SECRET_KEY);

    expect(payload.is_admin).toEqual(true);
    expect(payload.username).toEqual(testUserLogin.username);
  });

  test("Sucessful regular user login and token response", async function () {

    const response = await request(app)
      .post("/users/login")
      .send(testUserLogin2);


    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');

    const token = response.body.token;
    const payload = jwt.verify(token, SECRET_KEY);

    expect(payload.is_admin).toEqual(false);
    expect(payload.username).toEqual(testUserLogin2.username);
  });

});