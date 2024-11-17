const mysql = require('mysql2/promise');

let client = null;

exports.getClient = async () => {
  if (!client) {
    client = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'admin',
      password: process.env.MYSQL_PASSWORD || 'admin123',
      database: process.env.MYSQL_DATABASE || 'nextjs_dashboard'
    });

    // Add sql template literal support
    client.sql = async (strings, ...values) => {
      if (!strings) {
        throw new Error('sql is required');
      }
      const [query, params] = sqlTemplate(strings, ...values);
      const [rows, fields] = await client.execute(query, params);
      return { rows, fields };
    };
  }

  return client;
};

function sqlTemplate(strings, ...values) {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new Error(
      'incorrect_tagged_template_call',
      "It looks like you tried to call `sql` as a function. Make sure to use it as a tagged template.\n\tExample: sql`SELECT * FROM users`, not sql('SELECT * FROM users')",
    );
  }

  let result = strings[0] ?? '';
  const params = [];

  for (let i = 1; i < strings.length; i++) {
    result += '?' + (strings[i] ?? '');
    params.push(values[i - 1]);
  }

  return [result, params];
}

function isTemplateStringsArray(strings) {
  return (
    Array.isArray(strings) && 'raw' in strings && Array.isArray(strings.raw)
  );
}

// (async () => {
//    // Test
//    try {
//       const clientInstance = await exports.getClient(); 
//       const res = await clientInstance.sql`SHOW TIME ZONE;`
//       console.log(res.rows[0].TimeZone) // 'Etc/UTC'
//    } catch (err) {
//       console.error(err);
//    } finally {
//       await client.end()
//    }
// })();