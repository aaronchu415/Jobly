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

describe("GET /companies", function () {

    test("Should return a the handle and name for all of the company objects.", async function () {
        const response = await request(app)
            .get("/companies");
        expect(response.statusCode).toBe(201);
        // expect(response.body.book).toHaveProperty("isbn")
        // expect(response.body.book.isbn).toEqual("0691161789");
    })
})

describe("DELETE /companies", function () {

    test("Should remove an existing company and return a message => {message: 'Company deleted'}", async function () {
        const response = await request(app)
            .delete(`/companies/${testCompanyHandle}`);

        //test status code and response   
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ message: 'Company deleted' })

        //query DB for handle. Should not exist in db
        let testHandleResult = await db.query(`
        SELECT * from companies WHERE handle=$1
        `, [testCompanyHandle]);
        expect(testHandleResult.rows).toHaveLength(0);
    })
})

// describe("POST /companies", function () {
//     // success
//     test("Create a valid new book", async function () {
//         const response = await request(app)
//             .post("/books")
//             .send({
//                 isbn: "0691161789",
//                 amazon_url: "htt://a.co/eobPtX2",
//                 author: "Tim Garcia",
//                 language: "english",
//                 pages: 264,
//                 publisher: "Rithm University Press",
//                 title: "Best of Uruguay",
//                 year: 2017

//             });
//         expect(response.statusCode).toBe(201);
//         expect(response.body.book).toHaveProperty("isbn")
//         expect(response.body.book.isbn).toEqual("0691161789");
//     })
//     // fail
//     test("Create a invalid new book", async function () {
//         const response = await request(app)
//             .post("/books")
//             .send({
//                 isbn: "test",
//                 amazon_url: "htt://a.co/eobPtX2",
//                 author: "Tim Garcia",
//                 language: "english",
//                 pages: 264,
//                 publisher: "Rithm University Press",
//                 title: "Best of Uruguay",
//                 year: 2017

//             });
//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toHaveProperty("message");
//     })

// })