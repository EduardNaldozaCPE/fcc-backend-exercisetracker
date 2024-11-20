require('dotenv').config()
const { Exercise, User } = require('./Models.js')
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
  const finalLog = {};
  let argFrom = req.query.from;
  let argTo = req.query.to;
  let argLimit = req.query.limit;
  let from, to, limit;
  let id = req.params._id;

  if (argLimit) {
    try {
      limit = parseInt(argLimit);
    } catch (error) {
      console.error(error);
      return res.json({error});
    }
  }

  const dateFilter = { "$gte": new Date(0), "$lt": new Date() };

  if (argFrom) {
    if (argFrom.charAt(4) != "-" || argFrom.charAt(7) != "-")
      return res.json({"error":"invalid 'from' query"});
    from = new Date(argFrom);
    dateFilter["$gte"] = from;
  }

  if (argTo) {
    if (argTo.charAt(4) != "-" || argTo.charAt(7) != "-")
      return res.json({"error":"invalid 'to' query"});
    to = new Date(argTo);
    dateFilter["$lt"] = to;
  }
  
  // Add User Data to final object
  await User.findById(id).then(
    (userDoc)=>{
      finalLog._id = userDoc._id;
      finalLog.username = userDoc.username;
    }
  ).catch(
    (error)=>{
      console.error(error);
      res.json({error})
    }
  );

  // Add from and to queries to final object if it exists
  if (argFrom) finalLog.from = from.toDateString();
  if (argTo) finalLog.to = to.toDateString();

  // Add exercise lof to final object 
  let q = Exercise.find(
    {
      username: finalLog.username,
      date: dateFilter
    }
  ).select("description duration date")
  
  // Add limit to final object
  if (limit) {
    finalLog.limit = limit;
    q = q.limit(limit);
  }
  
  await q.then(
    (exerciseDocs)=>{
      finalLog.count = exerciseDocs.length;
      finalLog.log = [];
      // Format each date to dateString instead of yyyy-mm-dd
      for (let i = 0; i < exerciseDocs.length; i++) {
        let formattedDoc = {};
        formattedDoc.description = exerciseDocs[i].description;
        formattedDoc.duration = exerciseDocs[i].duration;
        formattedDoc.date = new Date(exerciseDocs[i].date).toDateString();
        finalLog.log.push(formattedDoc)
      }
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
  let formDuration = parseInt(req.body.duration);

  if (!formDesc) return res.json({error:"invalid description"});
  if (!formDuration) return res.json({error:"invalid duration"});

  // validate Date format
  let formDate;
  if (!req.body.date) {
    formDate = new Date();
  } else if (req.body.date.charAt(4) != "-" || req.body.date.charAt(7) != "-") {
    return res.json({error:"invalid date"});
  } else {
    formDate = new Date(req.body.date);
  }

  let newExercise = new Exercise({
    username: validatedUser.username,
    description: formDesc,
    duration: formDuration,
    date: formDate
  });

  newExercise.save().then(
    (newDoc)=>{
      let finalObj = {
        _id: req.params.id,
        username: validatedUser.username,
        description: formDesc,
        duration: formDuration,
        date: new Date(formDate).toDateString()
      }
      res.json(finalObj)
    }
  ).catch(
    (error)=>res.json({error})
  );
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
