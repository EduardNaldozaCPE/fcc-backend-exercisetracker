require('dotenv').config()
const { Exercise, User, Log } = require('./Models.js')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded());
app.use(express.static('public'))
mongoose.connect(process.env.DB_URL, {dbName: "exercisetracker"});

// GETs
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  let userDocs;
  try {
    userDocs = await User.find({});
    res.json(userDocs);

  } catch (error) { return res.json({error}) };
});

app.get('/api/users/:_id/logs', async (req , res) => {
  let id = req.params._id;
  const finalLog = {
  };
  
  await User.findById(id).then(
    (userDoc)=>{
      console.log(userDoc);
      finalLog._id = userDoc._id;
      finalLog.username = userDoc.username;
    }
  ).catch(
    (error)=>{
      console.error(error);
      res.json({error})
    }
  );

  await Exercise.find({username: finalLog.username}, "description duration date").then(
    (exerciseDocs)=>{
      finalLog.count = exerciseDocs.length;
      finalLog.log = exerciseDocs;
    }
  ).catch(
      (error)=>{
        console.error(error);
        res.json({error})
      }
  );
  
  res.json(finalLog);
});

// Validation Middleware
function validateId(req, res, next) {
  User.findById(req.params.id).then(
    (userDoc)=>{
      req[req.params.id] = userDoc;
      next();
    }
  ).catch(
    (error)=>res.json({error})
  );
}

// POSTs
app.post('/api/users', (req,res)=>{
  let newUser = new User({username: req.body.username});
  newUser.save().then(
    (newDoc)=>res.json(newDoc)
  ).catch(
    (error)=>res.json({error})
  );
});

app.post('/api/users/:id/exercises', validateId, (req, res)=>{
  let validatedUser = req[req.params.id];
  let formDesc = req.body.description;
  let formDuration = req.body.duration;

  if (!formDesc) return res.json({error:"invalid description"});

  // validate Date format
  let formDate;
  if (!req.body.date) {
    formDate = new Date().toISOString().slice(0,10);
  } else if (req.body.date.charAt(4) != "-" || req.body.date.charAt(7) != "-") {
    console.log(req.body.date);
    return res.json({error:"invalid date"});
  } else {
    formDate = req.body.date;
  }
  let date = new Date(formDate).toDateString();

  let newExercise = new Exercise({
    username: validatedUser.username,
    description: formDesc,
    duration: formDuration,
    date: date
  });

  newExercise.save().then(
    (newDoc)=>res.json(newDoc)
  ).catch(
    (error)=>res.json({error})
  );
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
