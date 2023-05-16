// Вызов и управление вопросом
let modal_res = document.querySelector(".modal_results")
let btn_res = document.querySelector("#btn-result")
let btn_send_res = document.querySelector("#btn-send_result")
let questions = document.querySelectorAll(".task_item")
let modal = document.querySelector(".modal_question")
questions.forEach((question) => {
	question.addEventListener("click", show_modal)
	question.addEventListener("click", () => {
		question.removeEventListener("click", show_modal)
		document.querySelector(`#${question.id}`).classList.add('_blocked')
	})
})

btn_res.addEventListener('click', show_results)
btn_send_res.addEventListener('click', send_results)

// Управлеие модальным окном
document.querySelector("#start_countdown").addEventListener("click", start_countdown)
document.querySelector("#show_answer").addEventListener("click", show_answer)
document.querySelector("#close_modal").addEventListener("click", clear_modal)

// Таймер
let countdown_duration = 5000 + 75
function start_countdown() {
	document.querySelector('.timer').classList.toggle('_active')
	setTimeout(() => document.querySelector('.timer').classList.toggle('_active'), countdown_duration)
}

// результаты игры
let members = document.querySelectorAll('.members')
let membersPoints = {}
let correct_answer
let uncorrect_answers
members.forEach(member => {
	membersPoints[`${member.dataset.memberName}`] = 0
	member.addEventListener('click', addPoints)
})

document.querySelector('#close_modal_res').addEventListener('click', () => {
	modal_res.style.display = "none"
	modal_res.querySelector('.modal_item').innerHTML = ``
})

// Появление текста вопроса
let source,
	dest,
	len,
	now = 0,
	delay = 10,
	letters = 1,
	reverse,
	content_duration

function show_results() {
	let player_points = ``
	modal_res.style.display = "flex"
	for (let member in membersPoints) {
		player_points += `
		<tr>
			<td align="left">${member}</td>
			<td align="right">${membersPoints[member]}</td>
		</tr>
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
	modal_res.querySelector('.modal_item').innerHTML = result_table
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
function show_modal() {
	question_card = document.querySelector(`#${this.id}`)
	question_points = question_card.querySelector('.task_number')
	reverse = question_card.hasAttribute('data-reverse') ? true : false
	question_text = question_card.firstElementChild
	question_variants = question_card.querySelector('.question_variants')
	question_answer = question_card.lastElementChild
	question_img = question_card.querySelector('.question_img')
	question_audio = question_card.querySelector('.question_audio')
	question_video = question_card.querySelector('.question_video')
	answer_img = question_card.querySelector('.answer_img')
	answer_audio = question_card.querySelector('.answer_audio')
	answer_video = question_card.querySelector('.answer_video')
	show_question = document.querySelector(".show_question")
	len = question_text.innerHTML.length
	modal.style.display = "flex"
	if (!reverse)
		setTimeout("show()", 500)
	else
		show_reverse()
}
function show_reverse() {
	if (question_img != null) showImg()
	if (question_audio != null) showAudio()
	if (question_video != null) showVideo()
}
function show() {
	show_question.innerHTML += question_text.innerHTML.substr(now, letters)
	now += letters
	if (now < len) setTimeout("show()", delay)
	if (now == len) show_question.innerHTML += `<p>${question_variants.innerHTML}</p>`
	if (now == len && question_img != null) setTimeout("showImg()", 3000)
	if (now == len && question_audio != null) setTimeout("showAudio()", 3000)
	if (now == len && question_video != null) setTimeout("showVideo()", 3000)
}
function showText() {
	show_question.innerHTML += question_text.innerHTML.substr(now, letters)
	now += letters
	if (now < len) setTimeout("showText()", delay)
	if (nom == len) show_question.innerHTML += `${question_variants}`
}
function showVideo() {
	show_question.innerHTML = `<video class="show_video"><source src="${question_video.src}" type="video/mp4"></source></video>`
	if (question_video != null) document.querySelector(`.show_video`).addEventListener("loadedmetadata", () => {
		document.querySelector(`.show_video`).play()
		if (reverse) {
			content_duration = document.querySelector(`.show_video`).duration
			setTimeout(() => {
				show_question.innerHTML = ''
				showText()
			}, content_duration * 1000 + 1000)
		}
	})
}
function showAudio() {
	show_question.innerHTML = `<img class="show_img" src="../content/gif/compact-disc.gif" style="width:256px;height:256px;"></img>`
	if (question_audio != null) {
		question_audio.play()
		if (reverse) {
			setTimeout(() => {
				show_question.innerHTML = ''
				showText()
			}, question_audio.duration * 1000 + 1000)
		}
	}
}
function showImg() {
	show_question.innerHTML = `<img class="show_img" src="${question_img.src}"></img>`
	if (reverse) {
		setTimeout(() => {
			show_question.innerHTML = ''
			showText()
		}, 5000)
	}
}
function show_answer() {
	if (question_audio != null) question_audio.pause()
	if (question_video != null) question_video.pause()
	if (answer_video != null) {
		show_question.innerHTML = `<video class="show_video" src="${answer_video.src}"></video>`
		let video = document.querySelector(`.show_video`)
		video.addEventListener("loadedmetadata", () => {
			video.play()
			setTimeout(() => {
				show_question.innerHTML = question_card.lastElementChild.innerHTML
				if (answer_audio != null) answer_audio.play()
			}, video.duration * 1000 + 250)
		})
	} else {
		if (answer_img != null) {
			show_question.innerHTML = `<img class="show_img" src="${answer_img.src}"></img>`
			setTimeout(() => show_question.innerHTML = question_card.lastElementChild.innerHTML, 3000)
		} else {
			show_question.innerHTML = question_card.lastElementChild.innerHTML
			if (answer_audio != null) answer_audio.play()
		}
	}
}
function clear_modal() {
	now = 0
	modal.style.display = "none"
	show_question.innerHTML = ''
	if (question_audio != null) question_audio.pause()
	if (question_video != null) question_video.pause()
	if (answer_audio != null) answer_audio.pause()
	if (answer_video != null) answer_video.pause()
	clearPoints()
}
function addPoints() {
	correct_answer = Array.from(members).find(member => member.id === this.id)
	membersPoints[correct_answer.dataset.memberName] += Number(question_points.innerHTML)
	correct_answer.classList.add("_correct")
	uncorrect_answers = Array.from(members).filter(member => member.id != this.id)
	uncorrect_answers.forEach(member => member.classList.add("_uncorrect"))
	members.forEach(member => member.setAttribute("disabled", "disabled"))
}
function clearPoints() {
	members.forEach(member => {
		member.classList.remove("_correct")
		member.classList.remove("_uncorrect")
		member.removeAttribute("disabled")
	})
}
function byFieldToUp(field) {
	return (a, b) => a[field] > b[field] ? 1 : -1;
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