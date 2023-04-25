const fs = require('fs')
const ifaces = require('os').networkInterfaces();
const express = require('express')
const chalk = require('chalk')
const morgan = require('morgan')
const uuid = require('uuid')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const app = express()
const jsonParser = express.json()

app.disable('x-powered-by');

app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(express.static('public'))
app.use(cookieParser('34e8251d4c7682d42d98f61495e5d4c'))
app.use(express.urlencoded({ extended: false }))
app.use(morgan(':method :url :status :res[content-lenght] - :response-time ms'))

// Проба в локальную сеть
const PORT = 3300
const LOCALHOST = '127.0.0.1'
// const LOCALHOST = Object.keys(ifaces).reduce((host, ifname) => {
//   let iface = ifaces[ifname].find(iface => !('IPv4' !== iface.family || iface.internal !== false));
//   return iface ? iface.address : host;
// }, '127.0.0.1');

const accessTokenSecret = '814fe03b0eb538f08d91a603cf90c7b8b7669a5db20713f722671b8298a2d5fb51d232fd3a6eb0a47dbe214a942fb267b8127e6e345445e17ca8466b8fed21d4d7e125824d91067c910475b7581eca552f8b5892eda566129750bb3864611b8e8e133fa8317c82a0e73705a9f1f03431a5ea329b4ee48e118365af76dda764ae';
const refreshTokenSecret = '255e7eacf54053e0cc2e3d1d1fc6a6e3751b581e6494f95596cfc00f7b97d7816a7ad548c3bc1edb791e841e5e8fb484b94080fe4a5305d75ee0807e8cab06430a8c92cc3b3b3c7b4830d3d31cd76ee9ecf19c11c9526a44b31866e7300a2f1e3cfd7637bd2e9d7a1fa1e8c70d796080a080a832f8007af158477d9115eb15f3';
const refreshTokens = [];
const authenticateJWT = (request, response, next) => {
  const auth = request.cookies.user_token
  if (auth) {
    jwt.verify(auth, accessTokenSecret, (err, user) => {
      if (err) {
        return response.sendStatus(403);
      }
      request.user = user;
      next();
    });
  } else {
    response.status(401).redirect('/');
  }
};


// База участников
const DB_file = '/storage/db-26.json'

// Роут авторизации
app.post('/auth', (request, response) => {
  if (!request.body) return response.sendStatus(400)
  const { username, password } = request.body;
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    const user = data.judges.find(u => { return u.login === username && u.pass === password })
    if (user) {
      const accessToken = jwt.sign({ username: user.login, userid: user.id }, accessTokenSecret);
      const refreshToken = jwt.sign({ username: user.login, userid: user.id }, refreshTokenSecret);
      refreshTokens.push(refreshToken);
      response.cookie("user_token", accessToken, {
        secure: true,
        httpOnly: true,
        maxAge: 5400 * 1000,
        path: `/judge/${user.id}`,
        domain: LOCALHOST
      })
      response.redirect(`/judge/${user.id}`)
    } else if (data.administrator[0].login === username && data.administrator[0].pass === password) {
      const accessToken = jwt.sign({ username: data.administrator[0].login, userid: data.administrator[0].token }, accessTokenSecret);
      const refreshToken = jwt.sign({ username: data.administrator[0].login, userid: data.administrator[0].token }, refreshTokenSecret);
      refreshTokens.push(refreshToken);
      response.cookie("user_token", accessToken, {
        secure: true,
        httpOnly: true,
        maxAge: 5400 * 1000,
        path: `/`,
        domain: LOCALHOST
      })
      response.redirect(`/adminpanel`)
    } else {
      response.send('Username or password incorrect');
    }
  }).catch(err => {
    console.log(err)
  })
});
// Роутинг администратора
app.get('/adminpanel', jsonParser, authenticateJWT, (request, response) => {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    // response.render('admin', { data })
    response.redirect('/leaderboard')
  })
})

app.post('/additem', (request, response) => {
  if (request.cookies.auth == "a1d54557-fe54-4c1c-8085-c49f93b259b9") {
    fs.promises.readFile(__dirname + DB_file).then(data => {
      data = JSON.parse(data)
      newItem = createItem(request.body)
      if (request.body.item_type == "judge") data.judges.push(createItem(request.body))
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.status(200)
    }).catch(err => {
      console.log(err)
    })
  } else {
    response.redirect('/')
  }
})
app.patch('/edititem/:id', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.members.find(member => member.id === request.params.id).fio = request.body.fio
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.delete('/removeitem/:id', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.judges = data.judges.filter(item => item.id != request.params.id)
    data.members = data.members.filter(item => item.id != request.params.id)
    data.contests = data.contests.filter(item => item.id != request.params.id)
    response.status(200)
    return fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
  }).catch(err => {
    console.log(err)
  })
})


// Роутинг члена жюри
app.get('/judge/:id', authenticateJWT, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    judge = {
      id: data.judges.find(judge => judge.id === request.params.id).id,
      fio: data.judges.find(judge => judge.id === request.params.id).fio
    }
    members = data.members
    contests = data.contests
    contests.forEach(contest => contest.status = contest.status[request.params.id])
    response.render('newjudge', { judge, members, contests })
  }).catch(err => {
    console.log(err)
  })
})
app.patch('/judge/:id', jsonParser, authenticateJWT, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  judgeId = request.params.id
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.contests.find(contest => contest.id === request.body.contestId).status[judgeId] === "edit") {
      newTableInner = data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner
      let property
      for (let i = 0; i < Object.keys(request.body.results).length; i++) {
        property = Object.keys(request.body.results)[i]
        newTableInner[property][judgeId] += Number(Object.values(request.body.results)[i])
      }
      data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner = newTableInner
      data.contests.find(contest => contest.id === request.body.contestId).status[judgeId] = "marked"
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  }).catch(err => {
    console.log(err)
  })
})

// Роутинг результатов
app.get('/leaderboard', authenticateJWT, (request, response) => {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    contests = data.contests
    members = data.members
    votingResults = data.results_tables.find(table => table.tablename === "voting")
    results_tables = data.results_tables.filter(table => table.tablename != 'voting')
    members.forEach(member => {
      memeberPoints = {}
      results_tables.forEach(table => {
        memeberPoints[`${table.tablename.slice(8)}`] = table.tableinner[`${member.id}`]
      })
      member['points'] = memeberPoints
      member['sum'] = 0
      for (let key in member.points) {
        for (let anotherKey in member.points[key]) {
          member['sum'] += member.points[key][anotherKey]
        }
      }
    })
    sortMembers = members.sort(byFieldToUp('number')).sort(byFieldToDown('sum'))
    response.render('viewer', { members, sortMembers, votingResults, results_tables, contests })
  })
})

// Роутинг голосования
app.get('/voting', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (!(data.clients_ip.find(client => client === request.ip)) && !request.cookies.vote) {
      votingResults = data.results_tables.find(table => table.tablename === "voting")
      response.render('vote', { votingResults })
    } else {
      messeage = "Вы уже проголосовали."
      response.render('vote_end', { messeage })
    }
  }).catch(err => {
    console.log(err)
  })
})
app.post('/voting', (request, response) => {
  if (!request.body) return response.sendStatus(404)
  if (request.body.member == '') response.redirect('/voting')
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (!(data.clients_ip.find(client => client === request.ip)) && !request.cookies.vote) {
      data.clients_ip.push(request.ip)
      response.cookie('vote', `${uuid.v4()}`, {
        maxAge: 72000 * 24,
        secure: true,
      })
      ++data.results_tables.find(table => table.tablename === "voting").tableinner[request.body.member]
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      messeage = "Ваш голос учтён."
      response.render('vote_end', { messeage })
    } else {
      messeage = "Вы уже проголосовали."
      response.render('vote_end', { messeage })
    }
  }).catch(err => {
    console.log(err)
  })
})


// Главный роут
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.listen(PORT, LOCALHOST, (error) => {
  error ? console.log(error) : console.log(chalk.green.bold(`\nApp was strated: ${LOCALHOST}:${PORT}\n`))
})

function createItem(item) {
  let newItem = {}
  switch (item.item_type) {
    case "judge":
      newItem = {
        id: uuid.v4(),
        type: item.judge_type,
        fio: item.judge_fio,
        login: item.judge_login,
        pass: item.judge_pass
      }
      break;

    default:
      break;
  }
  return newItem
}

// функции сортировки
function byFieldToUp(field) {
  return (a, b) => a[field] > b[field] ? 1 : -1;
}
function byFieldToDown(field) {
  return (a, b) => a[field] > b[field] ? -1 : 1;
}