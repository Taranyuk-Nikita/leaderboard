const fs = require('fs')
const express = require('express')
const chalk = require('chalk')
const morgan = require('morgan')
const uuid = require('uuid')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { request } = require('http')
const { table } = require('console')

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

const accessTokenSecret = '9135d0f210963c2bc7503dd19d2418a4a371cfbda7b566b8fb8761b994fc46a5fc9a57c68f9be4693112d98484df4ecb4ed3b4ef855be00d12f1454141df475c5ed62f8dce542af3fc9abff0332788d4a4ec67e5a6ef561f7b236c1553b320d5c50c0c88fd06dcd88f78243809419a60c4612022fa15fc3561465fef05803ed2';
const refreshTokenSecret = 'fecc0eca3c3000bde0b91fd8be8fae2af68df4b40cf563cf92a6f63451dc81525615768ebfa7ab19085070a51714c9679a5b51d4ee14a599179704d41adf3333c12bfed7889991e6ecbb49e5137882b3cd9e88ad8288f1bee9cd01b75aa3b26482cfc376731df7f4f9200e1b4c1b5237f33618b5118bc72b224c6bbdc931271d';
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
const DB_file = '/storage/db-1605.json'

// Роут авторизации
app.post('/auth', (request, response) => {
  if (!request.body) return response.sendStatus(400)
  const { login, password } = request.body;
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    const user = data.users.find(u => { return u.login === login && u.password === password })
    if (user) {
      const accessToken = jwt.sign({ username: user.login, userid: user.id }, accessTokenSecret);
      const refreshToken = jwt.sign({ username: user.login, userid: user.id }, refreshTokenSecret);
      refreshTokens.push(refreshToken);
      let getURLpath = `/${user.role}/${user.id}`
      let getURLaccess = `/${user.role}/${user.id}`
      if (user.role === "administrator") {
        getURLpath = '/adminpanel'
        getURLaccess = '/adminpanel'
      }
      response.cookie("user_token", accessToken, {
        httpOnly: true,
        maxAge: 15000 * 1000,
        path: getURLaccess,
        domain: LOCALHOST
      })
      response.redirect(getURLpath)
    } else {
      response.send('Username or password incorrect');
    }
  }).catch(err => {
    console.log(err)
  })
});
// Роутинг администратора
app.get('/adminpanel', jsonParser, (request, response) => {
  fs.readFile(__dirname + DB_file, function (error, data) {
    if (error) throw error // если возникла ошибка
    data = JSON.parse(data);
    response.render('admin', { data })
  })
})
app.patch('/adminpanel/enable_contest', jsonParser, authenticateJWT, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.contests.find(contest => contest.id === request.body.setEnableStatus).status === "disable") {
      data.contests.find(contest => contest.id === request.body.setEnableStatus).status = "enable"
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  }).catch(err => {
    console.log(err)
  })
}) 
app.patch('/adminpanel/switch_voiting', jsonParser, authenticateJWT, (request, response) => {
  // if (!request.body) return response.sendStatus(404)
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.results_tables.find(table => table.tablename === "voting").status === "stop") {
      data.results_tables.find(table => table.tablename === "voting").status = "start"
      response.sendStatus(200)
    } else if (data.results_tables.find(table => table.tablename === "voting").status === "start") {
      data.results_tables.find(table => table.tablename === "voting").status = "stop"
      response.sendStatus(200)
    }
  fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
  }).catch(err => {
    console.log(err)
  })
})

// Роутинг члена жюри
app.get('/judge/:id', authenticateJWT, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    judge = {
      id: data.users.find(judge => judge.id === request.params.id).id,
      fio: data.users.find(judge => judge.id === request.params.id).username
    }
    contests = data.contests
    contests.forEach(contest => contest.scores = contest.scores[request.params.id])
    contests = contests.filter(contest => { return contest.scores != undefined })
    response.render('judge', { judge, contests })
  }).catch(err => {
    console.log(err)
  })
})
app.patch('/judge/:id', jsonParser, authenticateJWT, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  judgeId = request.params.id
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.contests.find(contest => contest.id === request.body.contestId).scores[judgeId] === "edit") {
      newTableInner = data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner
      let property
      for (let i = 0; i < Object.keys(request.body.results).length; i++) {
        property = Object.keys(request.body.results)[i]
        newTableInner[property][judgeId] += Number(Object.values(request.body.results)[i])
      }
      data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner = newTableInner
      data.contests.find(contest => contest.id === request.body.contestId).scores[judgeId] = "marked"
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  }).catch(err => {
    console.log(err)
  })
})
app.get('/contest/:contestId/:judegId', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    contest = data.contests.find(contest => contest.id === request.params.contestId)
    if (contest.status === "enable") {
      contest.scores = contest.scores[request.params.judegId]
      results_tables = data.results_tables
      results_tables.pop()
      members = data.users.filter(u => { return u.role === 'member' })
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
      if (contest.rules === "top18" && contest.scores === "edit") {
        getTop(18)
      } else if (contest.rules === "top10" && contest.scores === "edit") {
        getTop(10)
      }
      result_table = results_tables.find(table => { return table.tablename === `results_${contest.id}` })
      for (const [key, value] of Object.entries(result_table.tableinner)) {
        result_table.tableinner[`${key}`] = result_table.tableinner[`${key}`][request.params.judegId]
      }
      return { members, contest, result_table }
    } else if (contest.status === "disable") {
      message = "This contest has not yet begun"
      response.json({ message })
    }
  }).then(resData => {
    const { members, contest, result_table } = resData
    response.json({ members, contest, result_table })
  }).catch(err => {
    console.log(err)
  })
})
// Роутинг результатов
app.get('/spectator/:id', authenticateJWT, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data);
    const { contests, users } = data
    votingResults = data.results_tables.find(table => table.tablename === "voting")
    results_tables = data.results_tables.filter(table => table.tablename != 'voting')
    let teams = []

    members = users.filter(u => { return u.role === 'member' })

    members.forEach(member => {
      teams[`${member.userteam}`] = {
        team: Number(`${member.userteam}`)
      }
    })
    members.forEach(member => {
      memeberPoints = {}
      results_tables.forEach(table => {
        memeberPoints[`${table.tablename.slice(8)}`] = table.tableinner[`${member.id}`]
      })
      member['points'] = memeberPoints
      let memberSum = 0
      if (typeof teams[`${member.userteam}`]['sum'] == 'undefined') teams[`${member.userteam}`]['sum'] = 0
      if (typeof teams[`${member.userteam}`]['points'] == 'undefined') teams[`${member.userteam}`]['points'] = {}
      for (let key in member.points) {
        member[`contest_${key}`] = propSum(member.points[`${key}`])
        if (typeof teams[`${member.userteam}`]['points'][key] == 'undefined') teams[`${member.userteam}`]['points'][key] = 0
        for (let anotherKey in member.points[key]) {
          memberSum += member.points[key][anotherKey]
          teams[`${member.userteam}`]['sum'] += member.points[key][anotherKey]
          teams[`${member.userteam}`]['points'][key] += member.points[key][anotherKey]
        }
      }
      member['sum'] = memberSum
    })
    let sortedMembers = []
    contests.forEach(contest => {
      sortedMembers[`sort_${contest.id}`] = [...members].sort(byFieldToDown(`contest_${contest.id}`))
    })
    let sortMembers = [...members].sort(byFieldToDown('sum'))
    teams.sort(byFieldToDown('sum'))
    console.log(sortedMembers);
    response.render('viewer', { sortedMembers, sortMembers, teams, votingResults, results_tables, contests })
  }).catch(err => {
    console.log(err)
  })
})
// Роутин гейм-мастера
app.get('/gamemaster/:id', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    let gmId = request.params.id
    response.render(`gamemaster`, { gmId })
  }).catch(err => {
    console.log(err)
  })
})
app.get('/gamemaster/:id/:contestId', authenticateJWT, (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    contest = data.contests.find(contest => contest.id === request.params.contestId)
    if (contest.status === "enable") {
      contest.scores = contest.scores[request.params.id]
      results_tables = data.results_tables
      results_tables.pop()
      members = data.users.filter(u => { return u.role === 'member' })
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
      if (contest.rules === "top5" && contest.scores === "edit") {
        getTop(5)
      } else if (contest.scores === "marked") {
        response.redirect(`/gamemaster/${request.params.id}`)
      }
      result_table = results_tables.find(table => { return table.tablename === `results_${contest.id}` })
      for (const [key, value] of Object.entries(result_table.tableinner)) {
        result_table.tableinner[`${key}`] = result_table.tableinner[`${key}`][request.params.id]
      }
      return { members, contest, result_table }
    } else if (contest.status === "disable") {
      message = "This contest has not yet begun"
      response.json({ message })
    }
  }).then(resData => {
    const { members, contest, result_table } = resData
    switch (contest.id) {
      case '3471fd37-4f89-4832-9ab3-31d7e255be73':
        response.render('game_debate')
        break;
      case '8a8f4fbc-d09d-4a33-a794-92a384e0335b':
        response.render('game_my-game', { members, contest, result_table })
        break;
      default:
        response.redirect(`/gamemaster/${request.params.id}`)
        break;
    }

  }).catch(err => {
    console.log(err)
  })
})
app.patch('/gamemaster/:id/:contestId', jsonParser, authenticateJWT, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  gaId = request.params.id
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (data.contests.find(contest => contest.id === request.body.contestId).scores[gaId] === "edit") {
      newTableInner = data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner
      let property
      for (let i = 0; i < Object.keys(request.body.results).length; i++) {
        property = Object.keys(request.body.results)[i]
        newTableInner[property][gaId] += Number(Object.values(request.body.results)[i])
      }
      data.results_tables.find(table => table.tablename === `results_${request.body.contestId}`).tableinner = newTableInner
      data.contests.find(contest => contest.id === request.body.contestId).scores[gaId] = "marked"
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  }).catch(err => {
    console.log(err)
  })
})
// Роутинг голосования
app.get('/voting', (request, response) => {
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    let membersID = []
    data.users.filter(u => { return u.role === 'member' }).forEach(member => {
      membersID.push(member.id)
    })
    if (!(data.clients_ip.find(client => client === request.ip)) && !request.cookies.vote) {
      votingResults = data.results_tables.find(table => table.tablename === "voting")
      if (votingResults.status === "start") {

        response.render('vote', { votingResults, membersID })
      } else if (votingResults.status === "stop") {
        message = "ГОЛОСОВАНИЕ ОКОНЧЕНО"
        response.render('vote_end', { message })
      }
    } else {
      message = "ВАШ ГОЛОС УЧТЁН"
      response.render('vote_end', { message })
    }
  }).catch(err => {
    console.log(err)
  })
})
app.post('/voting', jsonParser, (request, response) => {
  if (!request.body) return response.sendStatus(404)
  if (request.body.member == '') response.redirect('/voting')
  fs.promises.readFile(__dirname + DB_file).then(data => {
    data = JSON.parse(data)
    if (!(data.clients_ip.find(client => client === request.ip)) && !request.cookies.vote) {
      data.clients_ip.push(request.ip)
      response.cookie('vote', `${uuid.v4()}`, {
        maxAge: 72000 * 24,
        httpOnly: true,
      })
      if (data.results_tables.find(table => table.tablename === "voting").tableinner[request.body.vote] !== 'undefined') {
        ++data.results_tables.find(table => table.tablename === "voting").tableinner[request.body.vote]
      } else {
        randVote = Math.floor(Math.random() * (Math.floor(18) - Math.ceil(1) + 1)) + Math.ceil(1)
        ++data.results_tables.find(table => table.tablename === "voting").tableinner[`${randVote}`]
      }
      fs.promises.writeFile(__dirname + DB_file, JSON.stringify(data))
      response.redirect('/voting')
    } else {
      response.redirect('/voting')
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

function getTop(quantity) {
  sortMembers = [...members]
  sortMembers.sort(byFieldToDown('sum'))
  for (let i = sortMembers.length; i > quantity; i--) {
    lowest = sortMembers.pop()
    members = members.filter(member => { return member.id !== lowest.id })
  }
}

function propSum(object) {
  let sum = 0
  for (let prop of Object.values(object)) {
    sum += prop;
  }
  return sum; // 650
}