const pg = require("pg");

pg.defaults.ssl = true;

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
};

const pool = new pg.Pool(config_developing);

module.exports = { pool };
