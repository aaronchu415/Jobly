/** 
 * If you want to run jest test sequentially, in pacakage.json, configure:   "test": "jest --runInBand", under "scripts"
 * 
 * On command line run: npm test
 * 
*/

process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

var testCompanyHandle;
var adminToken;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");

  //create a company in the db
  let result = await db.query(`
    INSERT INTO companies
    VALUES ('amzn',
            'Amazon',
            1000,
            'Ecommerce company',
            'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1')
    RETURNING handle
    `);

  //create a user to get token
  let user = {
    username: "tim123",
    password: "password",
    first_name: "tim",
    last_name: "garcia",
    email: "tim@rithmschool.com",
    is_admin: true
  };

  let userResponse = await request(app)
    .post("/users")
    .send(user);

  adminToken = userResponse.body.token;

  testCompanyHandle = result.rows[0].handle;
});

afterEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");
});

afterAll(async function () {
  await db.end();
});

describe("GET /companies", function () {

  test("NO FILTER - Return handle and name for all of the company objects", async function () {
    const response = await request(app)
      .get("/companies")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("companies");
  });

  const companyResult = [{
    handle: 'amzn',
    name: 'Amazon',
    num_employees: 1000,
    description: 'Ecommerce company',
    logo_url:
      'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1'
  }];

  test("WITH FILTER - Return handle and name for all of the company objects", async function () {
    const response = await request(app)
      .get("/companies?search=amzn")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toEqual(companyResult);
  });

  test("WITH FILTER - Return no results", async function () {
    const response = await request(app)
      .get("/companies?search=abc")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toEqual([]);
  });
});

describe("DELETE /companies", function () {

  test("Should remove an existing company and return a message => {message: 'Company deleted'}", async function () {
    const response = await request(app)
      .delete(`/companies/${testCompanyHandle}`)
      .set({ Authorization: adminToken });

    //test status code and response   
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Company deleted' });

    //query DB for handle. Should not exist in db
    let testHandleResult = await db.query(`
        SELECT * from companies WHERE handle=$1
        `, [testCompanyHandle]);
    expect(testHandleResult.rows).toHaveLength(0);
  });
});

describe("POST /companies", function () {

  test("Create a new company (With valid data)", async function () {

    let data = {
      handle: "aapl",
      name: "Apple",
      num_employees: 2000,
      description: "Hardware Company",
      logo_url: "https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1"
    };

    const response = await request(app)
      .post("/companies")
      .set({ Authorization: adminToken })
      .send(data);
    expect(response.statusCode).toBe(201);
    expect(response.body.company).toHaveProperty("handle");
    expect(response.body.company).toEqual(data);

    //added to db
    let result = await db.query(`
        SELECT * from companies WHERE handle=$1
        `, [data.handle]);
    expect(result.rows).toHaveLength(1);

    //db should have two records 
    let resultAll = await db.query(`
        SELECT * from companies`);
    expect(resultAll.rows).toHaveLength(2);
  });

  test("Create a new company (Without valid data)", async function () {

    let data = {
      handle: "aapl",
      num_employees: 2000,
      description: "Hardware Company",
      logo_url: "https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1"
    };

    const response = await request(app)
      .post("/companies")
      .set({ Authorization: adminToken })
      .send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("status");

    //Should not add to db
    let result = await db.query(`
        SELECT * from companies WHERE handle=$1
        `, [data.handle]);
    expect(result.rows).toHaveLength(0);

    //db should have one records 
    let resultAll = await db.query(`
        SELECT * from companies`);
    expect(resultAll.rows).toHaveLength(1);
  });

  describe("GET /companies/:handle", function () {
    test("Get single company information", async function () {
      const companyResult = {
        handle: 'amzn',
        name: 'Amazon',
        num_employees: 1000,
        description: 'Ecommerce company',
        logo_url:
          'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1',
        jobs: []
      };

      const response = await request(app).get("/companies/amzn").set({ Authorization: adminToken });

      expect(response.statusCode).toBe(200);
      expect(response.body.company).toEqual(companyResult);
    });

    test("Non existing company - no return", async function () {
      const response = await request(app).get("/companies/abc").set({ Authorization: adminToken });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ message: `There is no company with a handle 'abc'`, status: 404 });
    });
  });

  describe("PATCH /companies/:handle", function () {
    test("Update single company record", async function () {
      const companyResult = {
        handle: 'amzn',
        name: 'Amazon',
        num_employees: 7896,
        description: 'Ecommerce company',
        logo_url:
          'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1'
      };
      const response = await request(app)
        .patch("/companies/amzn")
        .set({ Authorization: adminToken })
        .send({
          num_employees: 7896
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.company).toEqual(companyResult);

      //Should update db record
      let result = await db.query(`
            SELECT * from companies WHERE handle=$1
            `, [companyResult.handle]);
      expect(result.rows[0]).toEqual(companyResult);
    });

    test("Update single company record with invalid field", async function () {

      const response = await request(app)
        .patch("/companies/amzn")
        .set({ Authorization: adminToken })
        .send({
          name: null
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        "status": 400,
        "message": [
          "instance.name is not of a type(s) string"
        ]
      });

    });
  });

});