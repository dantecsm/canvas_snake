// 游戏统计数据
let startTime = 0
let picks = 0

window.resetStats = function() {
  startTime = +(new Date)
  picks = 0
}

window.addPicks = function() {
  picks += 1
}

getElaspedTime = function() {
  return (new Date - startTime)
}

getPicks = function() {
  return picks
}

window.renderStats = function(record) {
  let {statElaspedTime, statPicks, statSpeed, statRank} = (record === undefined)? getStat() : record

  document.getElementById('statElaspedTime').innerText = statElaspedTime
  document.getElementById('statPicks').innerText = statPicks
  document.getElementById('statSpeed').innerText = statSpeed
  document.getElementById('statRank').innerText = statRank
}

window.cacheRecord = function() {
  let record = getStat()
  let records = recordStorage.fetch()
  records.push(record)
  recordStorage.save(records)
}

window.showBestRecord = function() {
  let records = recordStorage.fetch()
  let bestRecord = records.reduce((best, record) => +record.statSpeed > +best.statSpeed? record: best)
  renderStats(bestRecord)
}

function getStat() {
  return {
    statElaspedTime: fromTime(getElaspedTime()),
    statPicks: getPicks(),
    statSpeed: getSpeed(),
    statRank: getRank()
  }
}

function fromTime(num) {
  let date = new Date(num)
  let min = date.getMinutes()
  let sec = date.getSeconds()
  if(sec < 10) sec = '0' + sec
  return `${min}:${sec}`
}

function getSpeed() {
  return (getPicks() / getElaspedTime() * 60000).toFixed(1)
}

function getRank() {
  let speed = getSpeed()

  if(speed >= 25) {
    return 'SS'
  }
  if(speed >= 20) {
    return 'S'
  }
  if(speed >= 15) {
    return 'A'
  }
  if(speed >= 10) {
    return 'B'
  }
  if(speed >= 5) {
    return 'C'
  }
  return 'D'
}

// 存储历史记录
let STORAGE_KEY = 'best_record'
window.recordStorage = {
  fetch: function() {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    records.forEach((record, index) => {
      record.id = index
    })
    recordStorage.uid = recordStorage.length
    return records
  },
  save: function(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }
}
