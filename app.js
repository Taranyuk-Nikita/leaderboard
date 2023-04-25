const fs = require('fs')
const express = require('express')
const uuid = require('uuid')
const cookieParser = require('cookie-parser')

const app = express()
const router = express.Router()
const jsonParser = express.json()
const urlencodedParser = express.urlencoded({ extended: false });

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser('secret key'))
app.set('trust proxy', true)


// База участников
const DB_file = '/storage/db-26.json'
// Токен админа
fs.promises.readFile(__dirname + DB_file).then(data => {
  data = JSON.parse(data)
  const adminToken = data.administrator[0].token
}).catch(err => {
  console.log(err)
})
// Роут авторизации
app.get('/auth', urlencodedParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    jungesLogins = []
    data.judges.forEach(elem => {
      jungesLogins.push(elem.login)
    })
    response.render('auth', jungesLogins)
  }).catch(err => {
    console.log(err)
  })
})
app.post('/auth', urlencodedParser, (request, response) => {
  if (!request.body) return response.sendStatus(400)
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.judges.find(judge => judge.login === request.body.userName)) {
      if (data.judges.find(judge => judge.login === request.body.userName).pass == request.body.userPassword) {
        response.cookie('auth', `${data.judges.find(judge => judge.login === request.body.userName).id}`, {
          maxAge: 5400 * 1000,
          secure: true,
        })
        response.redirect(`/judge/${data.judges.find(judge => judge.login === request.body.userName).id}`)
      } else {
        response.clearCookie('auth')
        response.send(`Неверный пароль!`)
      }
    } else if (data.administrator[0].login === request.body.userName) {
      if ((data.administrator[0].pass === request.body.userPassword)) {
        response.cookie('auth', `${adminToken}`, {
          maxAge: 5400 * 1000,
          secure: true,
        })
        response.redirect(`/adminpanel/${adminToken}`)
      } else {
        response.clearCookie('auth')
        response.send(`Неверный пароль!`)
      }
    } else {
      response.clearCookie('auth')
      response.send(`Пользователя не существует!`)
    }
  }).catch(err => {
    console.log(err)
  })
})

// Роутинг администратора
app.use('/adminpanel/:token', (request, response) => {
  if (request.cookies.auth == request.params.token) {
    fs.readFile(__dirname + DB_file, function (error, data) {
      if (error) throw error // если возникла ошибка
      data = JSON.parse(data);
      response.render('admin', { data })
    })
  } else {
    response.redirect('/')
  }
})

app.post('/additem', jsonParser, (request, response) => {
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
app.patch('/edititem/:id', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.members.find(member => member.id === request.params.id).fio = request.body.fio
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.delete('/removeitem/:id', jsonParser, (request, response) => {
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
app.get('/judge/:id', jsonParser, (request, response) => {
  if (request.cookies.auth == request.params.id) {
    fs.promises.readFile(__dirname + DB_file).then(data => {
      data = JSON.parse(data)
      judge = {
        id: data.judges.find(judge => judge.id === request.params.id).id,
        fio: data.judges.find(judge => judge.id === request.params.id).fio
      }
        response.render('judge', { judge })
    }).catch(err => {
      console.log(err)
    })
  } else {
    response.clearCookie('auth')
    response.redirect('/judgeauth')
  }
})
app.patch('/judge/:id', jsonParser, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.contests.find(contest => contest.id === request.body.contestId).status[request.params.id] === "edit") {
      newTableInner = data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner
      let property
      for (let i = 0; i < Object.keys(request.body.results).length; i++) {
        property = Object.keys(request.body.results)[i]
        newTableInner[property] += Number(Object.values(request.body.results)[i])
      } 
      data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner = newTableInner
      data.contests.find(contest => contest.id === request.body.contestId).status[request.params.id] = "marked"
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
app.get('/leaderboard/main', jsonParser, (request, response) => {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    members = data.members
    response.render('spectator', { members })
  })
})
app.get('/leaderboard/voting', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    votingResults = data.results_tables.find(table => table.tablename === "voting")
    response.render('voting', { votingResults })
  }).catch(err => {
    console.log(err)
  })
})

// Роутинг голосования
app.get('/voting', jsonParser, (request, response) => {
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
app.post('/voting', urlencodedParser, (request, response) => {
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
app.use('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.listen(3300, () => {
  console.log('Server started: http://127.0.0.1:3300')
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
