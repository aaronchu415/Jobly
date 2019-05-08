process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

var testCompanyHandle

beforeEach(async function () {
    let result = await db.query(`
    INSERT INTO companies
    VALUES ('amzn',
            'Amazon',
            1000,
            'Ecommerce company',
            'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1')
    RETURNING handle
    `);
    testCompanyHandle = result.rows[0].handle;
});

afterEach(async function () {
    await db.query("DELETE FROM companies");
});

afterAll(async function () {
    await db.end();
});

// describe("GET /companies", function () {

//     test("Should return a the handle and name for all of the company objects.", async function () {
//         const response = await request(app)
//             .get("/companies");
//         expect(response.statusCode).toBe(201);
//         // expect(response.body.book).toHaveProperty("isbn")
//         // expect(response.body.book.isbn).toEqual("0691161789");
//     })
// })

// describe("DELETE /companies", function () {

//     test("Should remove an existing company and return a message => {message: 'Company deleted'}", async function () {
//         const response = await request(app)
//             .delete(`/companies/${testCompanyHandle}`);

//         //test status code and response   
//         expect(response.statusCode).toBe(201);
//         expect(response.body).toEqual({ message: 'Company deleted' })

//         //query DB for handle. Should not exist in db
//         let testHandleResult = await db.query(`
//         SELECT * from companies WHERE handle=$1
//         `, [testCompanyHandle]);
//         expect(testHandleResult.rows).toHaveLength(0);
//     })
// })

describe("POST /companies", function () {

    test("Create a new company (With valid data)", async function () {

        let data = {
            handle: "aapl",
            name: "Apple",
            num_employees: 2000,
            description: "Hardware Company",
            logo_url: "https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1"
        }

        const response = await request(app)
            .post("/companies")
            .send(data);
        expect(response.statusCode).toBe(201);
        expect(response.body.company).toHaveProperty("handle")
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
    })

    test("Create a new company (Without valid data)", async function () {

        let data = {
            handle: "aapl",
            num_employees: 2000,
            description: "Hardware Company",
            logo_url: "https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1"
        }

        const response = await request(app)
            .post("/companies")
            .send(data);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message")
        expect(response.body).toHaveProperty("status")

        //Should not add to db
        let result = await db.query(`
        SELECT * from companies WHERE handle=$1
        `, [data.handle]);
        expect(result.rows).toHaveLength(0);

        //db should have one records 
        let resultAll = await db.query(`
        SELECT * from companies`);
        expect(resultAll.rows).toHaveLength(1);
    })

})


// })