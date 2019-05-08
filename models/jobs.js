const db = require("../db");
const sqlForPartialUpdate = require('../helpers/partialUpdate')


/** Collection of related methods for a job. */

class Job {
  /** given an id, return job data with that handle:
   *
   * => {title,company_handle}
   *
   **/

  static async findOne(id) {
    const jobRes = await db.query(
      `SELECT title,
            company_handle
            FROM jobs 
            WHERE id = $1`, [id]);

    if (jobRes.rows.length === 0) {
      throw { message: `There is no job with an id of '${id}'`, status: 404 }
    }
    return jobRes.rows[0];
  }

  /** Return array of job data:
   *
   * => [ {handle, name,num_employees,description,logo_url}, ... , ... ]
   *
   * */

  static async findAll({ search, min_salary, min_equity }) {

    //Figure out how to make general

    let values = []
    let wheres = []

    let query = `SELECT title,
                        company_handle
                        FROM jobs`

    // if (min_salary) {
    //   values.push(+min_salary)
    //   wheres.push(`salary > $${values.length}`)
    // }

    // if (min_equity) {
    //   values.push(+min_equity)
    //   wheres.push(`equity > $${values.length}`)
    // }

    // if (search) {
    //   values.push(`%${search}%`)
    //   wheres.push(`title ILIKE $${values.length}`)
    // }

    // if (wheres.length > 0) {
    //   query = query + ' WHERE ' + wheres.join(' AND ')
    // }

    query = query + ' ORDER BY date_posted DESC'

    const jobRes = await db.query(query);

    return jobRes.rows;
  }

  /** create job in database from data, return job data:
   *
   * {handle, name,num_employees,description,logo_url}
   *
   * => {handle, name,num_employees,description,logo_url}
   *
   * */

  static async create({ handle, name, num_employees, description, logo_url }) {
    const result = await db.query(
      `INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING handle,
         name,
         num_employees,
         description,
         logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    return result.rows[0];
  }

  /** Update data with matching ID to data, return updated book.
 
   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  static async update(handle, data) {

    let table = "companies"
    let key = 'handle'

    let { query, values } = sqlForPartialUpdate(table, data, key, handle)

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw { message: `There is no job with a handle '${handle}`, status: 404 }
    }

    return result.rows[0];
  }

  /** remove job with matching handle. Returns undefined. */

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
      [handle]);

    if (result.rows.length === 0) {
      throw { message: `There is no job with a handle '${handle}`, status: 404 }
    }
  }
}


module.exports = Job;