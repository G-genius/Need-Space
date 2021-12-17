class Space
{
	constructor(image, y)
	{
		this.x = 0;
		this.y = y;
		this.loaded = false;

		this.image = new Image();
		
		var obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });
		this.image.src = image;
	}

	Update(space) 
	{
		this.y += speed; //Изображение будет двигаться вниз с каждым кадром

		if(this.y > window.innerHeight) //если изображение покинуло экран, оно изменит свое положение
		{
			this.y = space.y - canvas.width + speed; //Новое положение зависит от второго звездалета
		}
	}
}

class plain //Класс звездалета
{
	constructor(image, x, y, isPlayer)
	{
		this.x = x;
		this.y = y;
		this.loaded = false;
		this.dead = false;
		this.isPlayer = isPlayer;

		this.image = new Image();

		var obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });

		this.image.src = image;
	}

	Update() //Повторение фона
	{
		if(!this.isPlayer)
		{
			this.y += speed;
		}

		if(this.y > canvas.height + 50)
		{
			this.dead = true;
		}
	}

	Collide(plain) //Условия столкновения звездалета с метеоритом
	{
		var hit = false;

		if(this.y < plain.y + plain.image.height * scale && this.y + this.image.height * scale > plain.y) //Если есть столкновение по y
		{
			if(this.x + this.image.width * scale > plain.x && this.x < plain.x + plain.image.width * scale) //Если есть столкновение по x
			{
				hit = true;
			}
		}

		return hit;
	}

	Move(v, d)  
	{
		if(v == "x") //Двигаться по x
		{
			d *= 2;

			this.x += d; //Менять позицию

			//Откат изменений, если космический корабль покинул экран
			if(this.x + this.image.width * scale > canvas.width)
			{
				this.x -= d; 
			}
	
			if(this.x < 0)
			{
				this.x = 0;
			}
		}
		else //Движемся дальше
		{
			this.y += d;

			if(this.y + this.image.height * scale > canvas.height)
			{
				this.y -= d;
			}

			if(this.y < 0)
			{
				this.y = 0;
			}
		}
		
	}
}

const UPDATE_TIME = 1000 / 60; //Обновление игры каждые 60 сек

var ctx = canvas.getContext("2d"); //Получение контекста для работы с canvas

var scale = 0.08; //Размер обьекта

Resize(); //Изменение размера canvas при запуске

window.addEventListener("keydown", function (e) { KeyDown(e); }); //Клавиатура
document.addEventListener("mousemove", function (e) { mouseMoveHandler(e); }); //Мышь
var objects = []; //Игровые объекты

var spaces = 
[
	new Space("../images/space3.jpg", 0),
	new Space("../images/space3.jpg", canvas.width)
	
]; //Задние фоны

var player = new plain("../images/plain3.png", canvas.width / 2, canvas.height / 1.1, true); //Игрок

var speed = 20;

var inter;

Start();


function Start() //Функция запуска игры
{
	if(!player.dead)
	{
		timer = setInterval(Update, UPDATE_TIME); //Обновление игры 60 раз в секунду
		inter = setInterval(score2, 1000);
		document.getElementById("PauseMenu").style.opacity=0;
	}
	
}

function Stop() //Функция паузы
{
	clearInterval(timer);
	clearInterval(inter); //Стоп игра
	timer = null;
	
	document.getElementById("PauseMenu").style.opacity=1;
}
function GameOver()//Функция окончания игры
{
	clearInterval(timer);
	clearInterval(inter); //Стоп игра
	timer = null;
	
	document.getElementById("PauseMenu").style.opacity=1;
	document.getElementById("PauseMenu").innerText = "Конец игры"
	document.getElementById("PauseMenu").style.left = '15%'
}

function Update() 
{
	spaces[0].Update(spaces[1]);
	spaces[1].Update(spaces[0]);

	if(RandomInteger(0, 1020) > 970) //Генерация метеоритов
	{
		objects.push(new plain("../images/meteorit.png", RandomInteger(40, canvas.width - 30), RandomInteger(100, 200) * -1, false));
	}

	player.Update();

	var isDead = false; 

	for(var i = 0; i < objects.length; i++) //цикл определяющий умер ли игрок
	{
		objects[i].Update();

		if(objects[i].dead)
		{
			isDead = true;
		}
	}


	var hit = false;

	for(var i = 0; i < objects.length; i++) //цикл определяющий столкновение игрока с метеоритом
	{
		hit = player.Collide(objects[i]);

		if(hit)
		{
			clearInterval(inter);
			
			GameOver();
			player.dead = true;
			break;
		}
	}

	Draw();
}


function Draw() //Работа с графикой
{

	for(var i = 0; i < spaces.length; i++)
	{
		ctx.drawImage
		(
			spaces[i].image, //Изображение
			0, //Первый X на изображении
			0, //Первый Y на изображении
			spaces[i].image.width,  //Конец X на изображении
			spaces[i].image.height, //Конец Y на изображении
			spaces[i].x,  //X on canvas
			spaces[i].y,  //Y on canvas
			canvas.width, //Ширина canvas
			canvas.width  //Высота canvas
		);
	}

	DrawPlain(player);

	for(var i = 0; i < objects.length; i++)
	{
		DrawPlain(objects[i]);
	}
}

function DrawPlain(plain) //Функция добавления звездалета
{
	ctx.drawImage
	(
		plain.image, 
		0, 
		0, 
		plain.image.width, 
		plain.image.height, 
		plain.x, 
		plain.y, 
		plain.image.width * scale, 
		plain.image.height * scale 
	);
}

function KeyDown(e) //функция управления звездалетом
{
	switch(e.keyCode)
	{
		case 37: //Лево
			player.Move("x", -speed);
			break;

		case 39: //Право
			player.Move("x", speed);
			break;

		case 38: //Вверх
			player.Move("y", -speed);
			break;

		case 40: //Вниз
			player.Move("y", speed);
			break;
		
		case 32: //стрелять
			player.Fire

		case 27: //Esc (пауза)
			if(timer == null)
			{
				Start();
			}
			else
			{
				Stop();
			}
			break;
	}
}
/*function mouseMoveHandler(e) {
	var relativeX = e.clientX - canvasoffsetLeft;
	if (relativeX > 0 && relativeX < canvas.width) {
		paddleX = relativeX - paddleWidth / 2;
		if (relativeY > 0 && relativeY < canvas.height) {
		paddleY = relativeY - paddleHeight / 2;
}
}*/
function Resize() //функция изменяющая размер игры под размер монитора
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function RandomInteger(min, max)  //функция отвечающая за расстояние метеоритов друг от друга
{
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}

const score_hub = document.getElementById("score_hub");  //вывод счета на экран с нач. знач. 0
let score1 = 0;

function score2(){ //функция прибавки очков счета
	score1 ++;
	score_hub.innerText = "Ваш счет: " + score1;
}
