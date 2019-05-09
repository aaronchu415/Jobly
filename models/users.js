const db = require("../db");
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_ROUNDS } = require('../config');

class User {

  static async findOne(username, allData = false) {

    let res;

    if (allData) {
      res = await db.query(
        `SELECT *
              FROM users 
              WHERE username = $1`, [username]);
    } else {

      res = await db.query(
        `SELECT username,
              first_name,
              last_name,
              email,
              photo_url
              FROM users 
              WHERE username = $1`, [username]);
    }

    if (res.rows.length === 0) {
      throw { message: `There is no user with username '${username}'`, status: 404 };
    }

    let user = res.rows[0];

    return user;
  }

  static async findAll({ username, first_name, last_name, email }) {

    const res = await db.query(`SELECT username, first_name, last_name, email
    FROM users`);

    return res.rows;
  }

  static async create({ username, password, first_name, last_name, email, photo_url, is_admin }) {

    let hashPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);

    is_admin = is_admin || false;
    

    const result = await db.query(
      `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          email,
          photo_url,
          is_admin)
            VALUES ($1, $2, $3, $4, $5, $6,$7)
            RETURNING username,
            first_name,
            last_name,
            email,
            is_admin`,
      [username, hashPassword, first_name, last_name, email, photo_url, is_admin]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    //get hashpassword of user from db
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]);

    const user = result.rows[0];

    //if there is a user
    return user && await bcrypt.compare(password, user.password);


  }

  static async update(usernameSearch, data) {

    let table = "users";
    let key = 'username';

    data.photo_url = data.photo_url || ""

    if (data.password) {
      let hashPassword = await bcrypt.hash(data.password, BCRYPT_WORK_ROUNDS);
      data.password = hashPassword;
    }

    let { query, values } = sqlForPartialUpdate(table, data, key, usernameSearch);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw { message: `There is no username with username '${usernameSearch}`, status: 404 };
    }

    let { username, first_name, last_name, email, photo_url, is_admin } = result.rows[0];

    return { username, first_name, last_name, email, photo_url, is_admin };
  }

  static async remove(username) {
    const result = await db.query(
      `DELETE FROM users 
         WHERE username = $1 
         RETURNING username`,
      [username]);

    if (result.rows.length === 0) {
      throw { message: `There is no username with username '${username}`, status: 404 };
    }
  }
}


module.exports = User;