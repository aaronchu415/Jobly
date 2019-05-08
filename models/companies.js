const db = require("../db");
const sqlForPartialUpdate = require('../helpers/partialUpdate')


/** Collection of related methods for a company. */

class Company {
  /** given an handle, return company data with that handle:
   *
   * => {handle, name,num_employees,description,logo_url}
   *
   **/

  static async findOne(handle) {
    const companyRes = await db.query(
      `SELECT handle,
            name,
            num_employees,
            description,
            logo_url
            FROM companies 
            WHERE handle = $1`, [handle]);

    if (companyRes.rows.length === 0) {
      throw { message: `There is no company with a handle '${handle}'`, status: 404 }
    }
    return companyRes.rows[0];
  }

  /** Return array of company data:
   *
   * => [ {handle, name,num_employees,description,logo_url}, ... , ... ]
   *
   * */

  static async findAll({ search, min_employees, max_employees}) {

    //figure out what to do when one is undefined
    if (min_employees > max_employees) {
      throw { message: `Min_employees cannot be greater than max_employees `, status:400 }
    }
    //Figure out how to make general

    let values = []
    let wheres = []

    let query = `SELECT handle,
                        name,
                        num_employees,
                        description,
                        logo_url
                        FROM companies`

    if (min_employees) {
      values.push(+min_employees)
      wheres.push(`num_employees >= $${values.length}`)
    }    
    
    if (max_employees) {
      values.push(+max_employees)
      wheres.push(`num_employees <= $${values.length}`)
    }  

    if (search) {
      values.push(`%${search}%`)
      wheres.push(`(name ILIKE $${values.length} OR handle ILIKE $${values.length})`)
    }

    if (wheres.length > 0) {
      query = query + ' WHERE ' + wheres.join(' AND ')
    }

    const companyRes = await db.query(query, values);

    return companyRes.rows;
  }

  /** create company in database from data, return company data:
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
      throw { message: `There is no company with a handle '${handle}`, status: 404 }
    }

    return result.rows[0];
  }

  /** remove company with matching handle. Returns undefined. */

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
      [handle]);

    if (result.rows.length === 0) {
      throw { message: `There is no company with a handle '${handle}`, status: 404 }
    }
  }
}


module.exports = Company;