let answer_points = 5

document.querySelector('#select_round_1').addEventListener('click', () => {
    document.querySelector('.rounds_wrapper').style.transform = 'translateX(-0vw)'
    document.querySelector('.roundinfo_wrapper').innerHTML = '第1环节'
    answer_points = 5
})
document.querySelector('#select_round_2').addEventListener('click', () => {
    document.querySelector('.rounds_wrapper').style.transform = 'translateX(-100vw)'
    document.querySelector('.roundinfo_wrapper').innerHTML = '第2环节'
    answer_points = 5
})
document.querySelector('#select_round_3').addEventListener('click', () => {
    document.querySelector('.rounds_wrapper').style.transform = 'translateX(-200vw)'
    document.querySelector('.roundinfo_wrapper').innerHTML = '第3环节'
    answer_points = 10
})
let modal_res = document.querySelector(".result_modal")
document.querySelector('#pack_result').addEventListener('click', () => {
    show_results()
    document.querySelector('.result_modal').classList.toggle('_block')
})

document.querySelector('.modal_wrapper').addEventListener('click', () => {
    document.querySelector('.result_modal').classList.toggle('_block')
})
document.querySelector('#send_res').addEventListener('click', send_results)
// Раунд 1
let round1 = document.querySelector('.round1')
let r1_question_wrapper = round1.querySelector('.r1_question_wrapper')
let r1_storage = round1.querySelector('.questions_storage')
let next_question = 1

document.querySelectorAll('.round_blank').forEach(blank => {
    blank.addEventListener('click', () => {
        blank.style.top = "100%"
    })
})

r1_question_wrapper.addEventListener('click', getNextQuest)

function getNextQuest() {
    this.querySelector('span[data-rightanswer="true"]').style.background = "#8ccf8c"
    this.querySelector('span[data-rightanswer="true"]').style.color = "#0e350e"
    this.querySelector('span[data-rightanswer="true"]').style.transform = "scale(1.1)"
    setTimeout(() => {
        this.querySelector('span[data-rightanswer="true"]').style.background = "#00000000"
        this.querySelector('span[data-rightanswer="true"]').style.color = "rgb(93, 24, 35)"
        this.querySelector('span[data-rightanswer="true"]').style.transform = "scale(1)"
        this.style.opacity = 0
        setTimeout(() => {
            next_question++
            if (next_question == 6) {
                r1_question_wrapper.removeEventListener('click', getNextQuest)
                this.querySelector('.r1_question_text').innerHTML = "第1环节结束"
                this.querySelector('#answer1').innerHTML = ""
                this.querySelector('#answer2').innerHTML = ""
                this.querySelector('#answer3').innerHTML = ""
            } else {
                this.querySelector('span[data-rightanswer="true"]').removeAttribute('data-rightanswer')
                this.querySelector('.r1_question_text').innerHTML = document.querySelector(`.question_${next_question}`).querySelector('.question_text').innerHTML
                this.querySelector('#answer1').innerHTML = r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_1').innerHTML
                this.querySelector('#answer2').innerHTML = r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_2').innerHTML
                this.querySelector('#answer3').innerHTML = r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_3').innerHTML
                if (r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_1').hasAttribute('data-right')) { this.querySelector('#answer1').setAttribute('data-rightanswer', 'true') }
                if (r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_2').hasAttribute('data-right')) { this.querySelector('#answer2').setAttribute('data-rightanswer', 'true') }
                if (r1_storage.querySelector(`.question_${next_question}`).querySelector('.answer_3').hasAttribute('data-right')) { this.querySelector('#answer3').setAttribute('data-rightanswer', 'true') }
            }
            this.style.opacity = 1
        }, 1000)
    }, 5000)
}

// Раунд 2
let member = 2
let question_num = 1
let round2 = document.querySelector('.round2')
let r2_question_wrapper = round2.querySelector('.r2_question_wrapper')
let r2_storage = round2.querySelector('.questions_storage')
r2_question_wrapper.addEventListener('click', getNextQuest2)

function getNextQuest2() {
    this.querySelector('.r2_question_variants').classList.toggle('_block')
    setTimeout(() => {
        this.querySelector('.r2_question_variants').classList.toggle('_block')
        this.style.opacity = 0
        setTimeout(() => {
            question_num++
            if (question_num % 3 == 1 && member < 8) {
                document.querySelectorAll('.round_blank')[1].querySelector('.blank_title').innerHTML = `${member}号选手`
                document.querySelectorAll('.round_blank')[1].style.top = "0%"
                member++
            }
            setTimeout(() => {
                if (question_num == 22) {
                    r2_question_wrapper.removeEventListener('click', getNextQuest2)
                    this.querySelector('.r2_question_text').innerHTML = "第2环节结束"
                    this.querySelector('#answer1').innerHTML = ""
                } else {
                    this.querySelector('.r2_question_text').innerHTML = r2_storage.querySelector(`.question_${question_num}`).querySelector('.question_text').innerHTML
                    this.querySelector('#answer1').innerHTML = r2_storage.querySelector(`.question_${question_num}`).querySelector('.answer').innerHTML
                }
                this.style.opacity = 1
            }, 500);
        }, 1200)
    }, 3000)
}
// Раунд 3
let round3 = document.querySelector('.round3')
let r3_question_wrapper = round3.querySelector('.r3_question_wrapper')
let cards = round3.querySelectorAll('.theam_card')
let r3_storage = round3.querySelector('.questions_storage')
let theam = ''
let r3_question = 0

cards.forEach(card => {
    card.addEventListener('click', activeCard)
})

function activeCard() {
    theam = this.dataset.theam
    r3_question = 1
    r3_question_wrapper.querySelector('.r3_question_text').innerHTML = document.querySelector(`.question_${theam}_${r3_question}`).querySelector('.question_text').innerHTML
    r3_question_wrapper.querySelector('#answer1').innerHTML = document.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_1').innerHTML
    r3_question_wrapper.querySelector('#answer2').innerHTML = document.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_2').innerHTML
    r3_question_wrapper.querySelector('#answer3').innerHTML = document.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_3').innerHTML
    if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_1').hasAttribute('data-right')) { r3_question_wrapper.querySelector('#answer1').setAttribute('data-rightanswer', 'true') }
    if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_2').hasAttribute('data-right')) { r3_question_wrapper.querySelector('#answer2').setAttribute('data-rightanswer', 'true') }
    if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_3').hasAttribute('data-right')) { r3_question_wrapper.querySelector('#answer3').setAttribute('data-rightanswer', 'true') }
    setTimeout(() => {
        this.classList.add('_block')
        this.removeEventListener('click', activeCard)
    }, 500);
    setTimeout(() => {
        round3.querySelector('.cards_wrapper').classList.toggle('_hide')
        round3.querySelector('.r3_question_wrapper').classList.toggle('_hide')
    }, 1000)
}

r3_question_wrapper.addEventListener('click', getNextQuest3)

function getNextQuest3() {
    // if ()
    this.querySelector('span[data-rightanswer="true"]').style.background = "#8ccf8c"
    this.querySelector('span[data-rightanswer="true"]').style.color = "#0e350e"
    this.querySelector('span[data-rightanswer="true"]').style.transform = "scale(1.1)"
    setTimeout(() => {
        this.querySelector('span[data-rightanswer="true"]').style.background = "#00000000"
        this.querySelector('span[data-rightanswer="true"]').style.color = "rgb(93, 24, 35)"
        this.querySelector('span[data-rightanswer="true"]').style.transform = "scale(1)"
        this.style.opacity = 0
        setTimeout(() => {
            r3_question++
            if (r3_question == 5) {
                round3.querySelector('.cards_wrapper').classList.toggle('_hide')
                round3.querySelector('.r3_question_wrapper').classList.toggle('_hide')
                this.querySelector('span[data-rightanswer="true"]').removeAttribute('data-rightanswer')
                this.querySelector('.r3_question_text').innerHTML = ''
                this.querySelector('#answer1').innerHTML = ''
                this.querySelector('#answer2').innerHTML = ''
                this.querySelector('#answer3').innerHTML = ''
            } else {
                this.querySelector('span[data-rightanswer="true"]').removeAttribute('data-rightanswer')
                this.querySelector('.r3_question_text').innerHTML = document.querySelector(`.question_${theam}_${r3_question}`).querySelector('.question_text').innerHTML
                this.querySelector('#answer1').innerHTML = r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_1').innerHTML
                this.querySelector('#answer2').innerHTML = r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_2').innerHTML
                this.querySelector('#answer3').innerHTML = r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_3').innerHTML
                if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_1').hasAttribute('data-right')) { this.querySelector('#answer1').setAttribute('data-rightanswer', 'true') }
                if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_2').hasAttribute('data-right')) { this.querySelector('#answer2').setAttribute('data-rightanswer', 'true') }
                if (r3_storage.querySelector(`.question_${theam}_${r3_question}`).querySelector('.answer_3').hasAttribute('data-right')) { this.querySelector('#answer3').setAttribute('data-rightanswer', 'true') }
            }
            this.style.opacity = 1
        }, 1400)
    }, 3000)
}



// COUNTDOWN
const countdown_start_stop = document.querySelector('#countdown_start-stop')
const countdown_refresh = document.querySelector('#countdown-refresh')
const set_time_limit = document.querySelector('#set_time-limit')
// const pack_result = document.querySelector('#pack_result')

countdown_start_stop.addEventListener("click", () => {
    if (set_time_limit.dataset.status === '00s') {

    } else if (countdown_start_stop.dataset.status === 'pause') {
        countdown_start_stop.dataset.status = 'start'
        countdown_start_stop.innerHTML = "<i class='fa-solid fa-pause'></i>"
        startTimer()
    } else if (countdown_start_stop.dataset.status === 'start') {
        countdown_start_stop.dataset.status = 'pause'
        countdown_start_stop.innerHTML = "<i class='fa-solid fa-play'></i>"
        stopTimer()
    }
});

countdown_refresh.addEventListener("click", () => {
    resetTimer()
});

set_time_limit.addEventListener('click', () => {
    if (set_time_limit.dataset.status === '00s') {
        set_time_limit.dataset.status = '20s'
        set_time_limit.innerHTML = "20s"
        TIME_LIMIT = 20
    } else if (set_time_limit.dataset.status === '20s') {
        set_time_limit.dataset.status = '30s'
        set_time_limit.innerHTML = "30s"
        TIME_LIMIT = 30
    } else if (set_time_limit.dataset.status === '30s') {
        set_time_limit.dataset.status = '00s'
        set_time_limit.innerHTML = "00s"
        TIME_LIMIT = 0
    }
    resetTimer()
})



const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 3;

const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

let TIME_LIMIT = 0;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
</div>
`;

// document.getElementById("setTimeLimit").addEventListener("click", () => {
//     TIME_LIMIT = document.getElementById("timeLimit").value;
//     timeLeft = TIME_LIMIT;
//     document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
// });
// document.getElementById("start_timer").addEventListener("click", startTimer);
// document.getElementById("stop_timer").addEventListener("click", stopTimer);
// document.getElementById("reset_timer").addEventListener("click", resetTimer);

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        if (timeLeft === 0) { onTimesUp() }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    timeLeft = TIME_LIMIT;
    timePassed = 0;
    setCircleDasharray();
    document
        .getElementById("base-timer-path-remaining")
        .classList.remove('orange');
    document
        .getElementById("base-timer-path-remaining")
        .classList.remove('red');
    document
        .getElementById("base-timer-path-remaining")
        .classList.add('green');
    document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
}

function onTimesUp() {
    countdown_start_stop.dataset.status = 'pause'
    countdown_start_stop.innerHTML = "<i class='fa-solid fa-play'></i>"
    clearInterval(timerInterval);
    document.getElementById("base-timer-label").innerHTML = "00:00";
}

function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}
// результаты игры
let members = document.querySelectorAll('.members')
let membersPoints = {}
members.forEach(member => {
	membersPoints[`${member.dataset.memberName}`] = 0
	member.addEventListener('click', addPoints)
})
function addPoints() {
	correct_answer = Array.from(members).find(member => member.id === this.id)
	membersPoints[correct_answer.dataset.memberName] += Number(answer_points)
}

// РЕЗУЛЬТАТЫ


function show_results() {
	let player_points = ``
	for (let member in membersPoints) {
        console.log(document.querySelector(`button[data-member-name="${member}"]`));
		player_points += `
        <div class="member_res">
            <span class="member" id="4545">${document.querySelector(`button[data-member-name="${member}"]`).dataset.memberNum}. ${member}</span>
            <span class="points" id="4545">${membersPoints[member]}</span>
        </div>
		`
	}
	let result_table = `
	<table>
		<tr>
			<th colspan="2">РЕЗУЛЬТАТЫ ИГРЫ</th>
		</tr>
		<tr>
			${player_points}
		</tr>
	</table>
	`
	modal_res.querySelector('.modal_body').innerHTML = player_points
}
function send_results() {
	let marks = {
		contestId: "8a8f4fbc-d09d-4a33-a794-92a384e0335b",
		results: {}
	}
	for (const [key, value] of Object.entries(membersPoints)) {
		member_id = document.querySelector(`button[data-member-name="${key}"]`).id
		marks.results[member_id] = value
	}
	//console.log(marks);
	sendRequest('PATCH', `/gamemaster/5f7c0799-52f5-4f6e-9359-dbfce2f9a10f/${marks.contestId}`, marks)
}


// Функция отправки запроса
let xhr = new XMLHttpRequest()
function sendRequest(method, requestURL, body = null) {
	return new Promise((resolve, reject) => {
		xhr.open(method, requestURL)
		xhr.responseType = "json"
		xhr.setRequestHeader('Content-Type', 'application/json')
		xhr.onload = () => {
			if (xhr.status >= 400) reject(xhr.response);
			else resolve(xhr.response);
		}
		xhr.onerror = () => {
			reject(xhr.response);
		}
		if (body != null) body = JSON.stringify(body)
		xhr.send(body)
	})
}