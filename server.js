import net from 'net'


function crc16 (buffer) {
    var wCRC_Table = [
        0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
        0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400
        ]
    
    var crcWord = 0xFFFF
    var result = Buffer.alloc(2)
    var start = 0
    var length = buffer.length

    function Drv_Crc_Acc(data) {
        var temp

        temp = wCRC_Table[(data ^ crcWord) & 15] ^ (crcWord >> 4)
        crcWord = wCRC_Table[((data >> 4) ^ temp) & 15] ^ (temp >> 4)
    }


    while (start < length) {
        Drv_Crc_Acc(buffer[start]);
        start++
        if (start == length) {
            result.writeUInt16LE(crcWord)
            return result
        }
    }
}

function parser(buffer) {
    let head = buffer.slice(0,2)
    let gps = buffer.slice(2,3)
    let length = buffer.slice(3,4)
    let data_buffer = buffer.slice(4,15)
    let crc = buffer.slice(15)
    let crc_vali = crc16(buffer.slice(0,15))
    if (crc.compare(crc_vali) == 0) {
        console.log('crc校验成功')
        let lat = data_buffer.readInt32LE(0) / 10000000
        let lng = data_buffer.readInt32LE(4) / 10000000
        let sat_no = data_buffer.readUInt8(8)
        let alt = data_buffer.readInt16LE(9) / 10

        console.log(`gps location is lat:${lat},lng:${lng},height:${alt}m,current sat Num: ${sat_no}`)
    }
} 

var server = net.createServer((conn) => {
    conn.on('data', (data) => {
        parser(data)
    })
})


server.on('error', (err) => {
    console.log(err)
    return process.exit(0)
})

server.listen(4000, (e) => {
    console.log(e, `running`)
})