const odbc = require('odbc')

const importDimDate = async (req, res) => {
  const con = await odbc.connect(process.env.CONNECTION_STRING)
  const dimDate = await con.query(`
    SELECT * FROM TRD_DBACL_DIMENSI
  `)
  console.log(dimDate)
}