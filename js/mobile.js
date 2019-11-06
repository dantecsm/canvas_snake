// 自适应 canvas 尺寸

window.setCanvasSize = function() {
    let canvas=document.querySelector('canvas')
    let viewWidth=window.innerWidth||document.documentElement.clientWidth
    let viewHeight=window.innerHeight||document.documentElement.clientHeight
    let tWidth = Math.floor(viewWidth / 100) * 100
    let tHeight = Math.floor(viewHeight / 100) * 100
    let canvasWidth = tWidth > 1000? 1000: tWidth
    let canvasHeight = tHeight > 600? 600: tHeight

    canvas.width = canvasWidth
    canvas.height = canvasHeight
}

// 触摸操作
let timerId = 0
let lastPoint = null
let controllerEnabled = false

document.addEventListener('touchstart', enableController)
document.addEventListener('touchend', disableController)
document.addEventListener('touchmove', lazyControllSnake)

function enableController(e) {
    controllerEnabled = true
    let {clientX, clientY} = e.touches[0]
    lastPoint = {x: clientX, y: clientY}
}

function disableController(e) {
    controllerEnabled = false
    lastPoint = null
}

function lazyControllSnake(e) {
    if(timerId) clearTimeout(timerId)
    timerId = setTimeout(() => controllSnake(e), 5)
}

function controllSnake(e) {
    if(controllerEnabled === false) return

    let {clientX, clientY} = e.touches[0]
    let curPoint = {x: clientX, y: clientY}

    // 根据坐标变化计算方向
    let direction = getDirection(lastPoint, curPoint)
    lastPoint = JSON.parse(JSON.stringify(curPoint))

    window.dispatchEvent(new CustomEvent('gesture', { detail: { key: direction} }))
}

function getDirection(from, to) {
    let dx = to.x - from.x
    let dy = to.y - from.y

    // 根据方向变化幅度判断是否移动,如何移动
    if(Math.abs(dx) + Math.abs(dy) < 4) {
        return null
    }

    if(Math.abs(dx) > Math.abs(dy)) {
        // 横向移动
        return dx > 0 ? 'ArrowRight' : 'ArrowLeft'
    } else {
        // 纵向移动
        return dy > 0 ? 'ArrowDown' : 'ArrowUp'
    }
}
