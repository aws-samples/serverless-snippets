/* 
Node.js code here.
*/
// ES6+ example
import { Signer } from "@aws-sdk/rds-signer";
import mysql from 'mysql2/promise';

async function createAuthToken() {
  // Define connection authentication parameters
  const dbinfo = {

    hostname: process.env.ProxyHostName,
    port: process.env.Port,
    username: process.env.DBUserName,
    region: process.env.AWS_REGION,
  
  }

  // Create RDS Signer object
  const signer = new Signer(dbinfo);
  
  // Request authorization token from RDS, specifying the username
  const token = await signer.getAuthToken(
    {
      username: process.env.DBUserName,
    }
  );
  return token;
}

async function dbOps() {

  try {
      // Obtain auth token
      const token = await createAuthToken();
      // Define connection configuration
      let connectionConfig = {
        host: process.env.ProxyHostName,
        user: process.env.DBUserName,
        //password: token,
        database: process.env.DBName,
        ssl: 'Amazon RDS',
        authPlugins: {
          mysql_clear_password: () => () => Buffer.from(token)
        },
      }
      // Create the connection to the DB
      const conn = await mysql.createConnection(connectionConfig);
      // Obtain the result of the query
      const [res,] = await conn.execute('select ?+? as sum', [2, 2]);
      return res
      
  } catch (error) {
      console.error(error)
      return error
  }
}

export const handler = async(event) => {
      // Execute database flow
      const result = await dbOps();
      // Return result
      return {
        statusCode: 200,
        body: JSON.stringify("The sum is: "+result[0].sum) 
      }
};
