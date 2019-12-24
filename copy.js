
const login = (req, res, next) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM customers';
  con.query(sql, (err, users, _) => {
    if (err) throw err;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      curUser = Object.assign({}, user);
      token = jwt.sign({ sub: user.username }, config.secret);
      res.send({
        users: users.map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        }),
        token
      });
    } else {
      res.status(400).send({ message: 'Username or password is incorrect' });
    }
  });
}

const signup = (req, res, next) => {
  const { username, email, password } = req.body;
  let sql = `INSERT INTO customers (username, email, password) 
  VALUES ('${username}', '${email}', '${password}')`;
  console.log(sql);
  con.query(sql, (err) => {
    if (err) throw err;
    token = jwt.sign({ sub: username }, config.secret);
    sql = 'SELECT * FROM customers';
    con.query(sql, (err, users, _) => {
      if (err) throw err;
      curUser = { username, email, password };
      token = jwt.sign({ sub: username }, config.secret);
      res.send({
        users: users.map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        }),
        token
      });
    });
  });
}

const getMydata = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    jwt.verify(authorization.split(' ')[1], config.secret, (err) => {
      if (err) {
        console.log('jwt incorrect');
        throw err;
      } else {
        console.log('jwt correct');
        res.send({curUser});
      }
    });
  } else {
    console.log('no authorization');
  }
}

// routes
router.post('/login', login);
router.post('/signup', signup);
router.get('/login/getmydata', getMydata);

module.exports = router;






