const fs = require('fs')
const AreaJson = require('./area.json')

function test(data) {
    data.forEach(_ => {
        _.value = _.label
        if (_.children && _.children.length) {
            test(_.children)
        }
    })
}

const testData = AreaJson
test(testData)

// fs.mkdir('testFile', function(error) {
//     if (error) {
//         console.log(error)
//         return false
//     }
//     console.log('创建目录成功')
// })

fs.writeFile('test.json', JSON.stringify(testData), 'utf8', function(error) {
    if (error) {
        console.log(error)
        return false
    }
    console.log('写入成功')
})
