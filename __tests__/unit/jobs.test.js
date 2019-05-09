process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

var testJobID;
var adminToken;

beforeEach(async function () {
  //make sure jobs and company table is clear
  await db.query("DELETE FROM jobs");
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");

  //add 1 company
  await db.query(`
    INSERT INTO companies
    VALUES ('amzn',
            'Amazon',
            1000,
            'Ecommerce company',
            'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1')
    RETURNING handle
    `);

  //add 1 job
  let resultJob = await db.query(`
    INSERT INTO jobs (title,salary,equity,company_handle)
    VALUES ('Junior Software Enginner',
            120000.5,
            0.5,
            'amzn')
    RETURNING id
    `);

  testJobID = resultJob.rows[0].id;

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
});

afterEach(async function () {
  await db.query("DELETE FROM jobs");
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");
});

afterAll(async function () {
  await db.end();
});

describe("GET /jobs", function () {

  const jobResult = { title: 'Junior Software Enginner', company_handle: 'amzn' };

  test("NO FILTER - Return title and company_handle for all of the jobs objects", async function () {

    const response = await request(app)
      .get("/jobs")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("jobs");
    expect(response.body.jobs).toEqual([jobResult]);
  });

  test("WITH FILTER - Return title & company for all of the jobs", async function () {
    const response = await request(app)
      .get("/jobs?search=software")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
  });

  test("WITH FILTER - Return no results", async function () {
    const response = await request(app)
      .get("/jobs?search=abc")
      .set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toEqual([]);
  });
});

describe("DELETE /jobs", function () {

  test("Should remove an existing job and return a message => { message: 'Job deleted' ", async function () {
    const response = await request(app)
      .delete(`/jobs/${testJobID}`)
      .set({ Authorization: adminToken });

    //test status code and response   
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Job deleted' });

    //query DB for handle. Should not exist in db
    let testResult = await db.query(`
        SELECT * from jobs WHERE id=$1
        `, [testJobID]);
    expect(testResult.rows).toHaveLength(0);
  });
});

describe("POST /jobs", function () {

  test("Create a new job (With valid data)", async function () {

    let data = {
      title: "Sales Associate",
      salary: 200000,
      equity: 0.2,
      company_handle: "amzn"
    };

    const response = await request(app)
      .post("/jobs")
      .set({ Authorization: adminToken })
      .send(data);

    expect(response.statusCode).toBe(201);
    expect(response.body.job.title).toEqual("Sales Associate");
    expect(response.body.job.company_handle).toEqual("amzn");

    //db should have two records 
    let resultAll = await db.query(`
        SELECT * from jobs`);
    expect(resultAll.rows).toHaveLength(2);
  });

  test("Create a new job (Without valid data)", async function () {

    let data = {
      title: "Software Engineer",
      equity: 0.3,
      company_handle: "amzn"
    };

    const response = await request(app)
      .post("/jobs")
      .set({ Authorization: adminToken })
      .send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("status");

    //db should have one records 
    let resultAll = await db.query(`
        SELECT * from jobs`);
    expect(resultAll.rows).toHaveLength(1);
  });
});

describe("GET /jobs/:id", function () {
  test("Get single job information", async function () {

    const response = await request(app).get(`/jobs/${testJobID}`).set({ Authorization: adminToken });
    expect(response.statusCode).toBe(200);
  });

  test("Non existing job - nothing returned", async function () {
    const response = await request(app).get("/jobs/876").set({ Authorization: adminToken });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: `There is no job with an id of '876'`, status: 404 });
  });
});

describe("PATCH /jobs/:id", function () {
  test("Update single job record", async function () {

    const response = await request(app)
      .patch(`/jobs/${testJobID}`)
      .set({ Authorization: adminToken })
      .send({
        title: "Web Developer"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toEqual("Web Developer");

    //Should update db record
    let result = await db.query(`
        SELECT * from jobs WHERE id=$1
        `, [testJobID]);
    expect(result.rows[0].title).toEqual("Web Developer");
  });

  test("Update single job record with insufficient fields", async function () {

    const response = await request(app)
      .patch(`/jobs/${testJobID}`)
      .set({ Authorization: adminToken })
      .send({
        title: null
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message:
        ['instance.title is not of a type(s) string']
    });

  });
});