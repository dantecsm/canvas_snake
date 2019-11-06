// 全局变量
const BEEP = new Audio('./resource/gain.wav')
const PASS = new Audio('./resource/victory.wav')
const FAIL = new Audio('./resource/failure.wav')

const BACKG_COLOR = "#FFF"
const SNAKE_COLOR = "#000"
const APPLE_COLOR = "#F00"

const DIRECTION = {
  'Default': {
    dx: 0,
    dy: 0
  },
  'ArrowUp': {
    dx: 0,
    dy: -1
  },
  'ArrowRight': {
    dx: 1,
    dy: 0
  },
  'ArrowDown': {
    dx: 0,
    dy: 1
  },
  'ArrowLeft': {
    dx: -1,
    dy: 0
  }
}

const KEY_COMP = {
  'w': 'ArrowUp',
  'd': 'ArrowRight',
  's': 'ArrowDown',
  'a': 'ArrowLeft'
}

window.IS_MOBILE = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)

let Canvas = {
  new: function() {
    this.canvas = document.querySelector('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvasWidth = this.canvas.width || 1000
    this.canvasHeight = this.canvas.height || 600
  }
}

let game = null

let Game = function(speed = 1, goal = 10, stages = 5) {
  this.speed = speed
  this.goal = goal
  this.stages = stages
  this.size = window.IS_MOBILE? 10 : 20
}


// 定模型
Game.prototype.init = function() {
  // 初始化画板
  Canvas.new.call(this)

  // 初始化小蛇
  this.body = [{
    x: Math.floor(this.canvas.width / 2 / this.size - 1) * this.size,
    y: Math.floor(this.canvas.height / 2 / this.size - 1) * this.size
  }]
  this.direction = DIRECTION.Default
  this.head = this.body[0]
  this.tail = this.body[this.body.length - 1]

  // 初始化苹果
  this.apple = this._generateApple()

  this.crash = false
  this.over = false
  this.timer = null

  this.loop()
  this.listen()
}

Game.prototype.loop = function() {
  this.timer = setInterval(() => {
    this.update()
    this.draw()
  }, 1000 / (this.speed * 10))
}


// 算模型
Game.prototype.update = function() {
  // 三段式：常规 + 过关 + 失败

  // 处理游戏正常流程
  if (!this.over) {
    let {
      x, y
    } = this.body[0]

    let {
      dx, dy
    } = this.direction

    this.head = {
      x: x + dx * this.size,
      y: y + dy * this.size
    }

    this.body.unshift(this.head)
    this.tail = this.body.pop()

    // 处理蛇头与苹果临接的情况
    if (JSON.stringify(this.head) === JSON.stringify(this.apple)) {
      this.body.push(this.tail)
      // 生成新苹果
      this.apple = this._generateApple()
      // 统计数据变化
      window.addPicks && window.addPicks()
      BEEP.play()
    }

    // 处理蛇头与蛇身碰撞的情况
    this.crash = this.body.some(p => p !== this.head && JSON.stringify(this.head) === JSON.stringify(p))
      // 允许回头
    if (this.crash) {
      this.crash = !this._isTraceback()
    }

    // 处理蛇头与墙壁碰撞的情况
    this.crash = this.crash || (this.head.x < 0 || this.head.x > this.canvasWidth - this.size || this.head.y < 0 || this.head.y > this.canvasHeight - this.size)
  }

  // 处理小关通过事件
  if (this.body.length > this.goal) {
    this.over = true
    if (this.speed >= this.stages) {
      // 处理完全通关事件
      this.clearAllStages()
    } else {
      this.clearStage()
    }
  }

  // 处理玩家失败事件
  else if (this.crash) {
    this.over = true
    this.retry()
  }
}

// 改模型
Game.prototype.listen = function() {
  // 监听键盘事件
  document.addEventListener('keydown', e => {
    let keyId = KEY_COMP[e.key] || e.key
    this.direction = DIRECTION[keyId] || this.direction
  })

  // 监听手势事件
  window.addEventListener('gesture', e => {
    let keyId = e.detail.key
    this.direction = DIRECTION[keyId] || this.direction
  })
}

// 画模型
Game.prototype.draw = function() {
  // 清空画布
  this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

  // 填充背景
  this.context.fillStyle = BACKG_COLOR
  this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

  // 画苹果
  this.context.fillStyle = APPLE_COLOR
  this.context.fillRect(this.apple.x, this.apple.y, this.size, this.size)

  // 画小蛇
  this.context.fillStyle = SNAKE_COLOR
  this.body.forEach(p => this.context.fillRect(p.x, p.y, this.size, this.size))
}

Game.prototype.clearStage = function() {
  alert('You Win')
  clearInterval(this.timer)

  this.speed += 1
  PASS.play()
  this.newGame(this.speed, this.goal, this.stages)
}

Game.prototype.retry = function() {
  alert('You Lose')
  clearInterval(this.timer)

  if(confirm('try again?')) {
    this.newGame(this.speed, this.goal, this.stages)
  } else {
    FAIL.play()
    leaveGame()
  }
}

Game.prototype.clearAllStages = function() {
  alert(`
    CONGRAAAAAAAAAAAAAATULATION ! 
    YOU HAVE CLEARED ALL STAGES !
    `)
  clearInterval(this.timer)

  PASS.play()
  leaveGame()
}

Game.prototype.newGame = function(speed, goal, stages) {
  alert(`current speed level: ${speed}`)

  // 在最终关之前提醒玩家
  if (speed === stages) {
    alert('FINAL STAGE!')
  }

  game = new Game(speed, goal, stages)
  game.init()
}

Game.prototype._generateApple = function() {
  let xRange = this.canvasWidth / this.size - 1
  let yRange = this.canvasHeight / this.size - 1
  while (true) {
    var nx = parseInt(Math.random() * xRange) * this.size
    var ny = parseInt(Math.random() * yRange) * this.size
    var np = {
      x: nx,
      y: ny
    }
    if (this.body.some(p => JSON.stringify(np) !== JSON.stringify(p))) {
      return np
    }
  }
}

Game.prototype._isTraceback = function() {
  if (this.body.length === 2) {
    return true
  } else {
    for (let i = 1; i < this.body.length; i++) {
      if (JSON.stringify(this.body[i]) === JSON.stringify(this.body[0])) {
        let px = (this.body[i - 1].x - this.body[i].x) / this.size
        let py = (this.body[i - 1].y - this.body[i].y) / this.size
        if (px + this.direction.dx === 0 && py + this.direction.dy === 0) {
          return true
        } else {
          return false
        }
      }
    }
  }
}
