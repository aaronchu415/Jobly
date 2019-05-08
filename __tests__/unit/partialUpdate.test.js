var sqlForPartialUpdate = require('../../helpers/partialUpdate')

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field", function () {

    let table = "users"
    let items = { name: 'Oliva' }
    let key = 'user_id'
    let id = 1

    const result = { query: 'UPDATE users SET name=$1 WHERE user_id=$2 RETURNING *', values: ['Oliva', 1] }

    // FIXME: write real tests!
    expect(sqlForPartialUpdate(table, items, key, id)).toEqual(result);

  });
});
