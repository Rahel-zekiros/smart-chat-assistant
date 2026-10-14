import connection from "../../Config/db.js";

export const createUser = (firstName, lastName, email, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (first_name, last_name, email, password)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(
      sql,
      [firstName, lastName, email, hashedPassword],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      },
    );
  });
};

export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, first_name, last_name, email, password, plan FROM users WHERE email = ?";

    connection.query(sql, [email], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0] || null);
    });
  });
};
