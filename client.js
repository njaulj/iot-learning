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

var client = net.createConnection({port: 4000}, () => {
    let head = new Buffer('de1e','hex')
    let gps = new Buffer('01','hex')
    
    let length = new Buffer('0b','hex')

    let lat = 32.083
    let lng = 118.32019
    let sat_num = 12
    let alt = 5.3

    let data_buffer = Buffer.alloc(11) //根据gps协议，总共有11个字节的数据段长度
    data_buffer.writeInt32LE(lat * 10000000,0)    
    data_buffer.writeInt32LE(lng * 10000000,4)
    data_buffer.writeUInt8(sat_num,8)
    data_buffer.writeInt16LE(alt * 10, 9)
    
    let crc = crc16(Buffer.concat([head, gps, length ,data_buffer]))

    let cmd = Buffer.concat([head,gps,length,data_buffer,crc])
    console.log(cmd)
    client.write(cmd)

})

client.on('data', (data) => {
    console.log('from server> ', data)
})  