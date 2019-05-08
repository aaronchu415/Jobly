process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

var testJobID

beforeEach(async function () {
    //make sure jobs and company table is clear
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");

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
});

afterEach(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
});

afterAll(async function () {
    await db.end();
});

describe("GET /jobs", function () {

    const jobResult = { title: 'Junior Software Enginner', company_handle: 'amzn' }

    test("NO FILTER - Return title and company_handle for all of the jobs objects", async function () {

        const response = await request(app)
            .get("/jobs");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("jobs")
        expect(response.body.jobs).toEqual([jobResult])
    })

    // const companyResult = [{
    //     handle: 'amzn',
    //     name: 'Amazon',
    //     num_employees: 1000,
    //     description: 'Ecommerce company',
    //     logo_url:
    //         'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1'
    // }]

    //     // test("WITH FILTER - Return handle and name for all of the company objects", async function () {
    //     //     const response = await request(app)
    //     //         .get("/companies?search=amzn");
    //     //     expect(response.statusCode).toBe(200);
    //     //     expect(response.body.companies).toEqual(companyResult)
    //     // })

    //     // test("WITH FILTER - Return no results", async function () {
    //     //     const response = await request(app)
    //     //         .get("/companies?search=abc");
    //     //     expect(response.statusCode).toBe(200);
    //     //     expect(response.body.companies).toEqual([])
    //     // })
})

// describe("DELETE /jobs", function () {

//     test("Should remove an existing job and return a message => { message: 'Job deleted' ", async function () {
//         const response = await request(app)
//             .delete(`/jobs/${testJobID}`);

//         //test status code and response   
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toEqual({ message: 'Job deleted' })

//         //query DB for handle. Should not exist in db
//         let testResult = await db.query(`
//         SELECT * from jobs WHERE id=$1
//         `, [testJobID]);
//         expect(testResult.rows).toHaveLength(0);
//     })
// })

// describe("POST /jobs", function () {

//     test("Create a new job (With valid data)", async function () {

//         let data = {
//             title: "Sales Associate",
//             salary: 200000,
//             equity: 0.2,
//             company_handle: "amzn"
//         }

//         const response = await request(app)
//             .post("/jobs")
//             .send(data);

//         expect(response.statusCode).toBe(201);
//         expect(response.body.job.title).toEqual("Sales Associate")
//         expect(response.body.job.company_handle).toEqual("amzn");

//         //db should have two records 
//         let resultAll = await db.query(`
//         SELECT * from jobs`);
//         expect(resultAll.rows).toHaveLength(2);
//     })

    // test("Create a new company (Without valid data)", async function () {

    //     let data = {
    //         handle: "aapl",
    //         num_employees: 2000,
    //         description: "Hardware Company",
    //         logo_url: "https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1"
    //     }

    //     const response = await request(app)
    //         .post("/companies")
    //         .send(data);
    //     expect(response.statusCode).toBe(400);
    //     expect(response.body).toHaveProperty("message")
    //     expect(response.body).toHaveProperty("status")

    //     //Should not add to db
    //     let result = await db.query(`
    //     SELECT * from companies WHERE handle=$1
    //     `, [data.handle]);
    //     expect(result.rows).toHaveLength(0);

    //     //db should have one records 
    //     let resultAll = await db.query(`
    //     SELECT * from companies`);
    //     expect(resultAll.rows).toHaveLength(1);
    // })

    // describe("GET /companies/:handle", function () {
    //     test("Get single company information", async function () {
    //         const companyResult = {
    //             handle: 'amzn',
    //             name: 'Amazon',
    //             num_employees: 1000,
    //             description: 'Ecommerce company',
    //             logo_url:
    //                 'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1'
    //         }

    //         const response = await request(app).get("/companies/amzn")

    //         expect(response.statusCode).toBe(200);
    //         expect(response.body.company).toEqual(companyResult);
    //     });

    //     test("Non existing company - no return", async function () {
    //         const response = await request(app).get("/companies/abc")

    //         expect(response.statusCode).toBe(404);
    //         expect(response.body).toEqual({ message: `There is no company with a handle 'abc'`, status: 404 })
    //     })
    // });

    // describe("PATCH /companies/:handle", function () {
    //     test("Update single company record", async function () {
    //         const companyResult = {
    //             handle: 'amzn',
    //             name: 'Amazon',
    //             num_employees: 7896,
    //             description: 'Ecommerce company',
    //             logo_url:
    //                 'https://pmcvariety.files.wordpress.com/2018/01/amazon-logo.jpg?w=1000&h=562&crop=1'
    //         }
    //         const response = await request(app)
    //             .patch("/companies/amzn")
    //             .send({
    //                 num_employees: 7896
    //             });

    //         expect(response.statusCode).toBe(200)
    //         expect(response.body.company).toEqual(companyResult);

    //         //Should update db record
    //         let result = await db.query(`
    //         SELECT * from companies WHERE handle=$1
    //         `, [companyResult.handle]);
    //         expect(result.rows[0]).toEqual(companyResult);
    //     })

    //     test("Update single company record with invalid field", async function () {

    //         const response = await request(app)
    //             .patch("/companies/amzn")
    //             .send({
    //                 name: null
    //             });

    //         expect(response.statusCode).toBe(400)
    //         expect(response.body).toEqual({
    //             "status": 400,
    //             "message": [
    //                 "instance.name is not of a type(s) string"
    //             ]
    //         });

    //     });
    // })

// })


// })