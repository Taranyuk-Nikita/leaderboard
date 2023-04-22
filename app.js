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
          maxAge: 72000 * 24,
          secure: true,
        })
        response.redirect(`/judge/${data.judges.find(judge => judge.login === request.body.userName).id}`)
      } else {
        response.clearCookie('auth')
        response.send(`Неверный пароль!`)
      }
    } else if (data.administrator[0].login === request.body.userName) {
      if ((data.administrator[0].pass === request.body.userPassword)) {
        response.cookie('auth', `${data.administrator[0].token}`, {
          maxAge: 72000 * 24,
          secure: true,
        })
        response.redirect(`/adminpanel/${data.administrator[0].token}`)
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
      response.render('admin', {data})
    })
  } else {
    response.redirect('/')
  }
})
app.post('/addmember', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    newmember = {
      id: uuid.v4(),
      number: Object.keys(data.members).length + 1,
      fio: request.body.fio,
    }
    for (let i = 0; i < data.judges.length; i++)
      newmember.points[`${data.judges[i].fio}`] = 0
    data.members.push(newmember)
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.status(200)
  }).catch(err => {
    console.log(err)
  })
})
app.post('/editmember/:id', jsonParser, (request, response) => {
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
app.post('/removemember/:id', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.members = data.members.filter(member => member.id !== request.params.id)
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.post('/removeallmembers', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.members.length = 0
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.post('/addjudge', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (!(data.judges.find(judge => judge.fio === request.body.judge_fio))) {
      if (!(data.judges.find(judge => judge.login === request.body.judge_login))) {
        newjudge = {
          id: uuid.v4(),
          number: Object.keys(data.judges).length + 1,
          fio: request.body.judge_fio,
          login: request.body.judge_login,
          pass: request.body.judge_pasword
        }
        data.judges.push(newjudge)
        data.members.forEach(element => {
          element.points[`${request.body.judge_fio}`] = ``
        })
        fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      }
    }
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.post('/editjudge/:id', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.judges.find(judge => judge.id === request.params.id).fio = request.body.fio
    data.judges.find(judge => judge.id === request.params.id).login = request.body.login
    data.judges.find(judge => judge.id === request.params.id).pass = request.body.pass
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})
app.post('/removealljudges', jsonParser, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.judges.length = 0
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
    response.json()
  }).catch(err => {
    console.log(err)
  })
})

// Роутинг члена жюри
app.get('/judge/:id', jsonParser, (request, response) => {
  if (request.cookies.auth == request.params.id) {
    fs.promises.readFile(__dirname + DB_file).then(data => {
      data = JSON.parse(data)
      judge = data.judges.find(judge => judge.id === request.params.id)
      let memberslist = []
      data.members.forEach(elem => {
        let member = {}
        member['id'] = elem.id,
        member['number'] = elem.number,
        member['name'] = elem.fio
        memberslist.push(member)
      })
      let contests = data.contests
      setTimeout(() => {
        response.render('judge', { memberslist, judge, contests })
      }, 1000)
    }).catch(err => {
      console.log(err)
    })
  } else {
    response.clearCookie('auth')
    response.redirect('/judgeauth')
  }
})
app.post('/rate/:id', jsonParser, (request, response) => {
  if (!request.body) return response.sendStatus(400)
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    data.members.find(member => member.id === request.body.id).points[request.body.judge] = Number(request.body.mark)
    points = Object.values(data.members.find(member => member.id === request.body.id).points)
    sum = 0
    points.forEach(point => sum += point)
    data.members.find(member => member.id === request.body.id).sum = sum
    fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
  }).catch(err => {
    console.log(err)
  })
  response.sendStatus(200)
})

// Роутинг зрителя
app.get('/leaderboard', jsonParser, (request, response) => {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    members = data.members
    response.render('spectator', { members })
  })
})

app.post('/showmembers', jsonParser, function (request, response) {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    response.json(data)
  })
})

// Роутинг голосования
app.use('/voting', jsonParser, (request, response) => {
  console.log(request.ip)
  response.sendStatus(200)
})


// Главный роут
app.use('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.listen(3300, () => {
  console.log('Server started: http://127.0.0.1:3300')
})