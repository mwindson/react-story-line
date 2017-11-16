(function process() {
  const fs = require('fs')
  fs.readFile('./witcher.json', (err, data) => {
    const times = JSON.parse(data).times
    const events = JSON.parse(data).events
    const result = []
    for (let i = 0; i < times.length; i++) {
      result.push({ time: times[i], events: events[i], count: events[i].length, year: times[i].replace('年', '') })
    }
    fs.writeFile('./witcher_new.json', JSON.stringify(result), (err) => {
      if (err) throw err;
      console.log('The file has been saved!')
    })
  })
})()