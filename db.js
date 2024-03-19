const pg = require("pg");
const fs = require("fs");

const config_testing = {
  user: process.env.LDB_user,
  database: process.env.LDB_database,
  password: process.env.LDB_password,
  port: process.env.LDB_port,
  host: process.env.LDB_host,
};

const config_developing = {
  user: process.env.RMDB_user,
  database: process.env.RMDB_database,
  password: process.env.RMDB_password,
  port: process.env.RMDB_port,
  host: process.env.RMDB_host,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("./sslcert/sportjiojio_site.crt"),
  },
};

const pool = new pg.Pool(config_developing);

module.exports = { pool };
