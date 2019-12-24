const express = require('express');
const router = express.Router();
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const bcrypt_salt_rounds = 10;
const bcrypt = require('bcryptjs');


//connecting to the database
const sequelize = new Sequelize('sql9309967', 'sql9309967', 'DxstZzFCyC', {
  host: 'sql9.freemysqlhosting.net',
  dialect: 'mysql'
});


//defining a model
const User = sequelize.define('User', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING
}, {
  tableName: 'users',
  timestamps: false
}
);

//synchronizing the schema

sequelize
   .sync({force : false})
   .then(()=>{ 
     User.create({ username : 'myself',  email : 'mymail', password : 'myword'});
              })
   .then((result)=> console.log(result))
   .catch((err)=> console.log('Problem occured:', err));

/*
const Model = Sequelize.Model;


class User extends Model { }
User.init({
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'user',
  timestamps: false
});

*/


const login = (req, res, next) => {
 /* const { username, password } = req.body;
  User.findAll({
    where: {
      username: username
    }
  }).then( result => JSON.parse(JSON.stringify(result)))
  .then(ans => bcrypt.compare(password, ans[0].password))
  .then(ans => console.log(ans));
  */
 
  User.findAll({
    where: {
      username: req.body.username
    }
  }).then( result => bcrypt.compare(req.body.password,JSON.parse(JSON.stringify(result))[0].password ))
  .then(result => {
    if(result) {
      User.findAll({
        where : { username : req.body.username }
      }).then(result => JSON.parse(JSON.stringify(result)))
      .then(jsonuser => jwt.sign({ jsonuser }, config.secret))
      .then(result => res.send({ token:result }))
      .catch(err => res.send('error:', err));
    }
  });
}

const signup = (req, res, next) => {
  const { email, username, password } = req.body;
  bcrypt.hash(password,bcrypt_salt_rounds)
  .then(hashed => User.create({ username, email, password:hashed }).then(user => {
    curUser = Object.assign({}, user);
    const jsonuser = JSON.parse(JSON.stringify(user));
    token = jwt.sign({ jsonuser }, config.secret);
    User.findAll().then((result) => JSON.parse(JSON.stringify(result, null, 4)))
      .then((users) => res.send({
        token: token,
        users: users.map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        })
      })
      )
      .catch(err => { throw err; });
  }
  ));
  
  
}

const getMydata = (req, res, next) => {
  const header = req.headers['authorization'];
  if (typeof header !== undefined) {
    const bearer = header.split(' ');
    const token = bearer[1];
    jwt.verify(token, config.secret, (err, result) => {
      if (err) {
        console.log('jwt incorrect');
        res.status(403).send('Incorrect.');
      } else {
        res.json({ result });
      }
    });
  } else {
    console.log('no authorization');
  }
}

const showUser = (req, res) => {
  User.findAll()
  .then(result => JSON.parse(JSON.stringify(result)))
  .then(result => {
      return result.map(u=> u.username);
  })
  .then(result => res.send(result));
}


const update = (req, res) => {
  const { myname, email, username, password } = req.body;
  bcrypt.hash(password,bcrypt_salt_rounds)
  .then(result=> {
    const hashed = result;
    User.update({
      username : username ,
      email : email ,
      password : result
    },
      {
        where : { username : myname }
      })
      .then(result => {
        User.findAll({ where : {username : username, email:email, password:hashed}})
        .then(result=>JSON.parse(JSON.stringify(result)))
        .then(jsonuser=>jwt.sign({jsonuser}, config.secret))
        .then(result=>res.send({
          token : result
        }))
        .catch(err=>res.send('Error:', err));
      })
  });
  
   
}

router.post('/login', login);
router.post('/signup', signup);
router.get('/mypage', getMydata);
router.get('/' ,showUser);
router.post('/mypage/update', update);
router.get('file:///F:/Upwork/calling%20code/index.html', (req, res)=>{
  console.log(req);
})

module.exports = router;