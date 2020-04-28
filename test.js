const mongoose = require('mongoose');
const express = require('express');


const MONGODB_URI = 'mongodb+srv://Chyngyz:Chyngyz@cluster0-fcshv.mongodb.net/test?retryWrites=true&w=majority';


const index = express();

const start = async () => {
  const PORT = process.env.PORT || 3000;
  try {
    await mongoose.connect(MONGODB_URI,{
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      dbName: 'turnover'
    });
    index.listen(PORT,() => console.log(`We started on ${PORT} port`))
  }catch(e) {
    console.log(e);
  }
};

start();