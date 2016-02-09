var canvas = document.getElementById('canvas');
canvas.width = 500;
canvas.height = 500;
var context = canvas.getContext('2d');
var x = 0,
y = 0,
width = 20,
height = 20,
canvasWidth = canvas.width / width,
canvasHeight = canvas.height / height,
appleBoundaryX = canvasWidth - 1,
appleBoundaryY = canvasHeight - 1,
key = 39,
drawLength,
start = 0,
snakeLen = 4,
apple,
score,
snakeBody = [],
snakeDirection,
snakeDirectionNew,
waiter = 0,
gameLoop,
audioContext,
soundsArray = [
	{
		name: "apple",
		url: "sounds/79241__roofdog__apple-bite-signature.wav"
	},
],
appleCrunchBuffer = null,
backgroundBuffer = null,
gameIsOver = false,
nameInputFocus = false,
nameInputValue,
counter = 0,
slowMultiplier = 1,
highscores = [],
keyboardMap = ["","","","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","SEMICOLON","EQUALS","COMMA","MINUS","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
window.addEventListener('load', function(){
	gameOver();
});

window.addEventListener('click', function(evt){
	var mousePos = getMousePos(canvas, evt);
	if (gameIsOver === true && mousePos.x >= (canvas.width / 2) - 100 && mousePos.x <= (canvas.width / 2) + 100 && mousePos.y <= 190 && mousePos.y >= 140){
		nameInputFocus = true;
		gameOver();
	} else {
		nameInputFocus = false;
		gameOver();
	}
});

function onError(e){
	console.log(e);
}

function initSnake(){
	highscores = [];
	var getHighscores = new XMLHttpRequest();
	getHighscores.open('GET', 'getscores.php?getscores=true');
	getHighscores.onload = function(){
		var response = JSON.parse(getHighscores.responseText);
		for(var i=0; i<response.length; i++){
			var score = {
				score: response[i].score,
				name: response[i].name
			}
			highscores.push(score);
		}
	}
	getHighscores.send();
	score = 0;
	snakeDirection = 3;
	createSnake();
	createApple();
	snakeDirectionNew = snakeDirection;
	gameLoop = requestAnimationFrame(drawWorld);
}

function createSnake(){
	snakeBody.length = 0;
	var startLength = 2;
	for(var i = startLength-1; i>=0; i--){
		snakeBody.push({x: i, y: 0});
	}
}

function drawWorld(){
	if (counter % slowMultiplier === 0) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "#bdc3c7";
		context.fillRect(0, 0, canvas.width, canvas.height);
		var nx = snakeBody[0].x;
		var ny = snakeBody[0].y;
		var xFloor = Math.floor(nx);
		var yFloor = Math.floor(ny);

		if (xFloor % 4 === 0 && yFloor % 4 === 0){
			snakeDirection = snakeDirectionNew;
		}

		if (xFloor === -1) {
			nx = canvasWidth * 4 - 1;
		} else if (xFloor === canvasWidth * 4) {
			nx = 0;
		} else if (yFloor === -1) {
			ny = canvasHeight * 4 - 1;
		} else if (yFloor >= canvasHeight * 4) {
			ny = 0;
		} else {
			switch (snakeDirection){
				case 1:
				nx--;
				break;
				case 2:
				ny--;
				break;
				case 3:
				nx++;
				break;
				case 4:
				ny++;
				break;
				default:
				break;
			}
		}

		for (var i=1; i<snakeBody.length; i++){
			if (xFloor === snakeBody[i].x && yFloor === snakeBody[i].y){
				gameOver();
				return;
			}
		}

		var tail = {
			x: 0,
			y: 0
		};
		drawApple();
		if (nx / 4 === apple.x && ny / 4 === apple.y){
			tail.x = nx;
			tail.y = ny;
			createApple();
			waiter++;
			score++;
		} else if (waiter !== 0 && waiter < 7){
			tail.x = nx;
			tail.y = ny;
			waiter++;
		} else if (waiter >= 7 || waiter === 0){
			tail = snakeBody.pop();
			tail.x = nx;
			tail.y = ny;
			waiter = 0;
		}

		snakeBody.unshift(tail);

		for(var i=0; i<snakeBody.length; i++){
			drawBodyCell(snakeBody[i].x, snakeBody[i].y);
		}

		var scoreText = "Score: " + score;
		context.font = '10pt Open Sans';
		context.textAlign = 'left';
		context.fillStyle = "black";
		context.fillText(scoreText, 10, 20);
		counter++;
		requestAnimationFrame(drawWorld);
	} else {
		counter++;
		requestAnimationFrame(drawWorld);
	}
}

function isInsideSnake(x, y) {
	var inside = false;
	for (var i=0; i<snakeBody.length; i++) {
		if (x === snakeBody[i].x / 4 && y === snakeBody[i].y / 4) {
			inside = true;
		}
	}
	console.log(inside);
	return inside;
}

function createApple(){
	var appleX = Math.floor(Math.random() * (appleBoundaryX - 0 + 1) + 0),
	appleY = appleY = Math.floor(Math.random() * (appleBoundaryY - 0 + 1) + 0);

	while (isInsideSnake(appleX, appleY)) {
		appleX = Math.floor(Math.random() * (appleBoundaryX - 0 + 1) + 0);
		appleY = Math.floor(Math.random() * (appleBoundaryY - 0 + 1) + 0);
	}

	apple = {
		x: appleX,
		y: appleY
	}
}

function drawBodyCell(cx, cy){
	context.fillStyle = '#34495e';
	context.fillRect(cx*5, cy*5, width, height);
}

function drawApple(){
	context.fillStyle = '#c0392b';
	context.fillRect(apple.x*width, apple.y*height, width, height);
}

function controlSnake(keyEvent){
	keyEvent.preventDefault && keyEvent.preventDefault();
	key = keyEvent.keyCode;
	if (key === 37 && snakeDirection !== 3){
		snakeDirectionNew = 1;
	} else if (key === 38 && snakeDirection !== 4){
		snakeDirectionNew = 2;
	} else if (key === 39 && snakeDirection !== 1){
		snakeDirectionNew = 3;
	} else if (key === 40 && snakeDirection !== 2){
		snakeDirectionNew = 4;
	} else if (key === 13 && gameIsOver === true){
		var xhr = new XMLHttpRequest();
		var name = "Anonymous";
		if (typeof(nameInputValue) !== "undefined"){
			name = nameInputValue;
		}
		xhr.open('GET', 'getscores.php?addscores=true&score=' + score + '&name=' + name);
		xhr.onload = function(){
			initSnake();
			gameIsOver = false;
		}
		xhr.send();
	} else if (nameInputFocus === true){
		if ((key >= 48 && key <= 57) || (key >= 65 && key <= 90)){
			if (typeof(nameInputValue) === "undefined"){
				nameInputValue = keyboardMap[key];
			} else {
				nameInputValue += keyboardMap[key];
			}
			gameOver();
		} else if (key === 8 && typeof(nameInputValue) !== "undefined"){
			nameInputValue = nameInputValue.slice(0, -1);
			gameOver();
		}
	}
}

function gameOver(){
	var input;
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#bdc3c7';
	context.fillRect(0, 0, canvas.width, canvas.height);
	gameIsOver = true;
	context.font = '30pt Open Sans';
	context.textAlign = 'center';
	context.fillStyle = 'black';
	context.fillText('Daymn, game over!', canvas.width / 2, 80);
	context.font = '15pt Open Sans';
	context.fillText('Score: ' + score, canvas.width / 2, 120);
	if (nameInputFocus === true){
		context.strokeStyle = '#FF0000';
		context.strokeRect((canvas.width / 2) - 100, 140, 200, 50);
		if (typeof(nameInputValue) !== "undefined"){
			context.fillText(nameInputValue, canvas.width / 2, 172);
		} else {
			context.fillText('', canvas.width / 2, 172);
		}
	} else {
		context.strokeStyle = 'black';
		context.strokeRect((canvas.width / 2) - 100, 140, 200, 50);
		if (typeof(nameInputValue) !== "undefined"){
			context.fillText(nameInputValue, canvas.width / 2, 172);
		} else {
			context.fillText('Enter name', canvas.width / 2, 172);
		}
	}
	context.fillText('Press Enter to Submit Score & Restart', canvas.width / 2, 230);
	context.fillText('Highscores:', canvas.width / 2, 270);
	context.font = '10pt Open Sans';
	for (var i=1; i<11; i++){
		var j = i - 1;
		if (typeof(highscores[j]) !== 'undefined'){
			context.fillText(i + '. ' + highscores[j].name + ' - ' + highscores[j].score + '', canvas.width / 2, 280 + (i * 15));
		} else {
			context.fillText(i + '. - - -', canvas.width / 2, 280 + (i * 15));
		}
	}
}

function getMousePos(canvas, event){
	var rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
		y: (event.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height
	}
}

// keyCodes
// 37 = left
// 38 = up
// 39 = right
// 40 = down

// snakeDirection:
// 1 = left
// 2 = up
// 3 = right
// 4 = down