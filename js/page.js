// 切换页面
let btns = document.querySelectorAll('#page1 button')

Array.from(btns).filter(b => b.id !== 'best_record')
.map(b => {b.addEventListener('click', loadGame)})

document.querySelector('#best_record').addEventListener('click', loadRecord)

menu_btn.addEventListener('click', () => {
  window.location.href = window.location
})

function loadGame() {
  page1.setAttribute('class', 'page hide')
  page1.addEventListener("animationend", () => transition(page1, page2))

  window.resetStats && window.resetStats()
  window.setCanvasSize && window.setCanvasSize()
}

function leaveGame() {
  page2.setAttribute('class', 'page hide')
  page2.addEventListener("animationend", () => transition(page2, page3))

  window.renderStats && window.renderStats()
  window.cacheRecord && window.cacheRecord()
}

function loadRecord() {
  let records = window.recordStorage && recordStorage.fetch()

  if(records.length === 0) {
    alert('你还没有游戏记录')
  } else {
    page1.setAttribute('class', 'page hide')
    page1.addEventListener('animationend', () => {transition(page1, page3)})

    window.showBestRecord && window.showBestRecord()
  }
}

function transition(from, to) {
  from.style.display = 'none'
  to.style.display = 'flex'
  to.setAttribute('class', 'page show')
}

// 绑定按钮事件
new_game.addEventListener('click', () => {
  game = new Game(1, 10, 5)
  game.init()
})

apple_rush.addEventListener('click', () => {
  game = new Game(3, Infinity, 1)
  game.init()
})

speed_rush.addEventListener('click', () => {
  game = new Game(1, 10, Infinity)
  game.init()
})

custom_mode.addEventListener('click', () => {
  let speed = +prompt('请输入速度')
  let goal = +prompt('请输入生成苹果数')
  let stages = +prompt('请输入关卡数')
  game = new Game(speed, goal, stages)
  game.init()
})

// 绑定菜单音效
const HOVER = new Audio('./resource/hover.ogg')
const CLICK = new Audio('./resource/click.ogg')

Array.from(btns).map(b => bindAudio(b))
bindAudio(menu_btn)

function bindAudio(el) {
  el.addEventListener('mouseover', () => {
    HOVER.pause()
    HOVER.currentTime = 0
    HOVER.play()
  })
  el.addEventListener('click', () => CLICK.play())
}
