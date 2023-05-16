let debateModal = document.querySelector('.debate_modal ')
let sideAttack = document.querySelector('.attack')
let sideDefense = document.querySelector('.defense')
let debateCountdownBlock = document.querySelector('.coutdown_block')

let cards = document.querySelectorAll('.theam_card')

cards.forEach(card => {
    card.addEventListener('click', activeCard)
})

document.querySelector('#close_modal').addEventListener('click', () => {
    sideAttack.classList.toggle('_active')
    sideDefense.classList.toggle('_active')
    debateCountdownBlock.classList.toggle('_active')
    setTimeout(() => {
        debateModal.classList.toggle('_active')
        resetTimer()
    }, 500)
})

function activeCard() {
    sideAttack.querySelector('.side_statement').innerHTML =  this.querySelector('.statement_attack').innerHTML
    sideDefense.querySelector('.side_statement').innerHTML =  this.querySelector('.statement_defense').innerHTML
    setTimeout(() => {
        debateModal.classList.toggle('_active')
    }, 200);
    setTimeout(() => {
        sideAttack.classList.toggle('_active')
        sideDefense.classList.toggle('_active')
        debateCountdownBlock.classList.toggle('_active')
    }, 700)
    setTimeout(() => {
        this.classList.add('_block')
        this.removeEventListener('click',activeCard)
    }, 900);
}


// COUNTDOWN
const set_breake_debate = document.querySelector('#set_breake-debate')
const toggle_side = document.querySelector('#toggle_side')
const toggle_show = document.querySelector('#toggle_show')
const countdown_start_stop = document.querySelector('#countdown_start-stop')
const countdown_refresh = document.querySelector('#countdown-refresh')

set_breake_debate.addEventListener('click', () => {
    if (set_breake_debate.dataset.status === 'breake') {
        set_breake_debate.dataset.status = 'debate'
        set_breake_debate.innerHTML = "<i class='fa-solid fa-comments'></i>"
        TIME_LIMIT = 60
        resetTimer()
    } else if (set_breake_debate.dataset.status === 'debate') {
        set_breake_debate.dataset.status = 'breake'
        set_breake_debate.innerHTML = "<i class='fa-solid fa-clock'></i>"
        TIME_LIMIT = 30
        resetTimer()
    }
})
toggle_side.addEventListener('click', () => {
    if (toggle_side.dataset.status === 'attack') {
        toggle_side.dataset.status = 'defense'
        toggle_side.innerHTML = "<i class='fa-solid fa-chevron-right'></i>"
    } else if (toggle_side.dataset.status === 'defense') {
        toggle_side.dataset.status = 'attack'
        toggle_side.innerHTML = "<i class='fa-solid fa-chevron-left'></i>"
    }
    document.querySelector('.turn_attack').classList.toggle('_waiting')
    document.querySelector('.turn_defense').classList.toggle('_waiting')
})
toggle_show.addEventListener('click', () => {
    if (toggle_show.dataset.status === 'invisible') {
        toggle_show.dataset.status = 'visible'
        toggle_show.innerHTML = "<i class='fa-solid fa-eye'></i>"
    } else if (toggle_show.dataset.status === 'visible') {
        toggle_show.dataset.status = 'invisible'
        toggle_show.innerHTML = "<i class='fa-solid fa-eye-slash'></i>"
    }
    document.querySelector('.turn_attack').classList.toggle('_invisible')
    document.querySelector('.turn_defense').classList.toggle('_invisible')
})
countdown_start_stop.addEventListener("click", () => {
    if (countdown_start_stop.dataset.status === 'pause') {
        if (set_breake_debate.dataset.status === 'breake') {
            document.querySelector('#countdown_sound').play()
        }
        countdown_start_stop.dataset.status = 'start'
        countdown_start_stop.innerHTML = "<i class='fa-solid fa-pause'></i>"
        startTimer()
    } else if (countdown_start_stop.dataset.status === 'start') {
        countdown_start_stop.dataset.status = 'pause'
        countdown_start_stop.innerHTML = "<i class='fa-solid fa-play'></i>"
        stopTimer()
    }
});
countdown_refresh.addEventListener("click", resetTimer);

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

let TIME_LIMIT = 30;
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
