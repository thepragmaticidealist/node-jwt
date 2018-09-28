const mongoClient = require('mongodb').MongoClient;
const connUri = process.env.MONGO_DEV_CONN_URL;

module.exports = {
  connect: () => {
    mongoClient.connect(connUri, { useNewUrlParser : true, authSource: 'admin' }, (err, client) => {
      if (!err) {
        console.log('CLIENT ????', client)
      } else {
        console.log(`Error connecting to mongo db ${err}`);
        return;
      }
    });
  }
}