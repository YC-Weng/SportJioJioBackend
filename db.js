const pg = require("pg");
const fs = require("fs");

const config_testing = {
  user: "sjjstaff",
  database: "jjdb",
  password: "sportjiojio",
  port: 5432,
  host: "localhost",
};

const config_developing = {
  user: "doadmin",
  database: "jjdb",
  password: "AVNS_-GWAu0hX_V8M32qsPQj",
  port: 25060,
  host: "jiojio-do-user-15809025-0.c.db.ondigitalocean.com",
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("./sslcert/sportjiojio_site.crt"),
  },
};

const pool = new pg.Pool(config_developing);

module.exports = { pool };
