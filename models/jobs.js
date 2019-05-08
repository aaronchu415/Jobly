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

    if (min_salary) {
      values.push(+min_salary)
      wheres.push(`salary > $${values.length}`)
    }

    if (min_equity) {
      values.push(+min_equity)
      wheres.push(`equity > $${values.length}`)
    }

    if (search) {
      values.push(`%${search}%`)
      wheres.push(`title ILIKE $${values.length}`)
    }

    if (wheres.length > 0) {
      query = query + ' WHERE ' + wheres.join(' AND ')
    }

    query = query + ' ORDER BY date_posted DESC'

    const jobRes = await db.query(query, values);

    return jobRes.rows;
  }

  /** create job in database from data, return job data:
   *
   * {handle, name,num_employees,description,logo_url}
   *
   * => {handle, name,num_employees,description,logo_url}
   *
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
      [title, salary, equity, company_handle]
    );

    return result.rows[0];
  }

  /** Update data with matching ID to data, return updated book.
 
   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  static async update(id, data) {

    let table = "jobs"
    let key = 'id'

    let { query, values } = sqlForPartialUpdate(table, data, key, id)

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw { message: `There is no job with id '${id}`, status: 404}
    }

    return result.rows[0];
  }

  /** remove job with matching handle. Returns undefined. */

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
         WHERE id = $1 
         RETURNING id`,
      [id]);

    if (result.rows.length === 0) {
      throw { message: `There is no job with id '${id}`, status: 404 }
    }
  }
}


module.exports = Job;