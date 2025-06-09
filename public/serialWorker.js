var devices,
    port,
    check = false

const microPython_keywords = 'Type "help()" for more information.'
//custom Tranform stream
class LineBreakTransformer {
    constructor() {
        // A container for holding stream data until a new line.
        this.chunks = ''
        this.pcv0 = false
        this.data = []
        //this flag check current read request is file fetch in createAction or not
        this.fetchFileFlag = false
        // this.aiFormatFileFlag = false
        this.aiFetchAudioFlag = false
        this.format1310 = false
    }

    transform(chunk, controller) {
        console.log('string', String.fromCharCode(...chunk))

        let combo = []
        // console.log('string: ', String.fromCharCode(...chunk))
        // Append new chunks to existing chunks.
        this.chunks = this.chunks + chunk + ','
        // console.log('chunks', this.chunks, this.pcv0)
        // For each line breaks in chunks, send the parsed lines out.
        if (String.fromCharCode(...chunk).includes(microPython_keywords)) {
            controller.enqueue(this.chunks)
            this.chunks = ''
        }
        let lines

        if (this.fetchFileFlag) {
            // let regexEqu = /13,10,70,82,([^]*?),10,69,78,68/
            let regexEqu = /13,10,70,(82|65),([^]*?),10,69,78,68/
            let match = this.chunks.match(regexEqu)
            if (match) {
                //extract the data from this.chanks if any grabage present there
                // const regexExtractData =
                //     /13,10,70,82(?:,\d+)*?,10,69,78,68,13,10/
                // const matchExtractData = this.chunks.match(regexExtractData)
                // if (matchExtractData) {
                //     controller.enqueue(matchExtractData[0])
                //     this.chunks = ''
                // }
                controller.enqueue(match[0])
                this.chunks = ''
                this.fetchFileFlag = false
            }
            const servoReadRegex = /13,10,83,82(?:,\d+){32}?,69,82,13,10,/
            const servoRead = this.chunks.match(servoReadRegex)
            if (servoRead) {
                controller.enqueue(servoRead[0])
                this.chunks = ''
                this.fetchFileFlag = false
            }
        } else if (this.aiFetchAudioFlag) {
            // let regexEqu = /13,10,255,244,([^]*?),255,13,10/
            let regexEqu = /13,10,65,76,([^]*?),245,255,13,10/
            let match = this.chunks.match(regexEqu)
            if (match) {
                controller.enqueue(match[1])
                this.chunks = ''
                this.fetchFileFlag = false
            }
        }
        //  else if (this.aiFormatFileFlag) {
        //     // this.aiFormatFileFlag = false
        //     // const AIFidCheckRegex = /65,73,70,\d+/
        //     // const isAIFPRESENT = this.chunks.match(AIFidCheckRegex)

        //     const aiRegexEquation = /13,10,(.*?),13,10/
        //     const aiStringMatch = this.chunks.match(aiRegexEquation)
        //     if (aiStringMatch && aiStringMatch[1]) {
        //         this.aiFormatFileFlag = false
        //         this.chunks = ''
        //         controller.enqueue(aiStringMatch[1])
        //     }
        //     // else if (this.chunks.length > 500) {
        //     //     this.aiFormatFileFlag = false
        //     //     // console.log(chunk)
        //     //     this.chunks = ''
        //     //     controller.enqueue(this.chunks)
        //     // }
        // }
        else if (this.format1310) {
            let regexEqu = /13,10,([^]*?),13,10/
            let match = this.chunks.match(regexEqu)

            if (match && match[1]) {
                controller.enqueue(match[1])
                this.chunks = ''
                // this.format1310 = false
            }
        } else {
            const AIFidCheckRegex = /65,73,70,\d+/
            const isAIFPRESENT = this.chunks.match(AIFidCheckRegex)
            if (this.chunks.length > 500) {
                // console.log(chunk)
                this.chunks = ''
                controller.enqueue(this.chunks)
            } else if (
                (this.chunks.includes('13,10,79,75,13,10,') ||
                    this.chunks.includes('79,75')) &&
                !this.chunks.includes('13,10,71,82,79,75,13,10') &&
                !this.chunks.includes('13,10,68,70,79,75,13,10')
            ) {
                //"GROK" and "DFOK" came it not enter here
                this.chunks = ''
                controller.enqueue('13,10,79,75,13,10')
            } else if (this.chunks.includes('13,10,82,68,79,78,69,13,10,')) {
                this.chunks = ''
                controller.enqueue('13,10,82,68,79,78,69,13,10')
            } else if (this.chunks.includes('10,13,82,69,')) {
                //check RE
                this.chunks = ''
                controller.enqueue('13,10,82,69,13,10')
            } else if (this.chunks.includes('13,10,71,82,83,86,13,10,')) {
                //check GRSV
                this.chunks = ''
                controller.enqueue('13,10,71,82,83,86,13,10')
            } else if (this.chunks.includes('13,10,71,82,79,75,13,10,')) {
                //check GROK
                this.chunks = ''
                controller.enqueue('13,10,71,82,79,75,13,10')
            } else if (this.chunks.includes('68,70,79,75')) {
                //check DFOK
                this.chunks = ''
                controller.enqueue('13,10,68,70,79,75,13,10')
            } else if (
                this.chunks.includes('13,10,80,76,65,89,68,79,78,69,13,10')
            ) {
                //check PLAYDONE
                this.chunks = ''
                controller.enqueue('13,10,80,76,65,89,68,79,78,69,13,10')
            } else if (this.chunks.includes('80,67,77,80,95,49,46,48')) {
                // check PCMP_1.0
                this.chunks = ''
                controller.enqueue('80,67,77,80,95,49,46,48')
            } else if (this.chunks.includes('90,71,77,80,95,50,46,48,')) {
                //  check ZGMP_2.0
                this.chunks = ''
                controller.enqueue('90,71,77,80,95,50,46,48,')
            } else if (this.chunks.includes('67,87,77,80,95,49,46,48,')) {
                //  check CWMP_1.0
                this.chunks = ''
                controller.enqueue('67,87,77,80,95,49,46,48,')
            } else if (this.chunks.includes('90,71,77,80,95,49,46,48,0,')) {
                //  check ZGMP_1.0
                this.chunks = ''
                controller.enqueue('90,71,77,80,95,49,46,48,0,')
            }

            if (String.fromCharCode(...chunk).includes('PCv0')) {
                this.pcv0 = true
                lines = this.chunks.split(/10/)
                this.chunks = lines.pop()
                lines.forEach((line) => controller.enqueue(line))
            } else if (this.pcv0) {
                //music screen

                const data = arrayConvert(chunk)

                // if (data.length == 26 && data[0]==80 && data[1]==65) {
                //     controller.enqueue(data)
                // }
                combo = [...combo, ...data]
                // lines = this.chunks.split(/69,82,10,80,65/)
                // this.chunks=lines.pop()
                if (
                    combo[0] === 80 &&
                    combo[1] === 65 &&
                    combo[combo.length - 2] === 82 &&
                    combo[combo.length - 1] === 10
                ) {
                    if (this.data.length !== 0) this.data.pop()
                    this.data.push(combo.join(','))
                    console.log('pcv0.1 data', this.data)
                    this.data.forEach((line) => controller.enqueue(line))

                    // this.chunks = lines.pop()

                    // lines.forEach((line) => controller.enqueue(line))
                } else if (combo.length == 5) {
                    if (this.data.length !== 0) this.data.pop()
                    this.data.push(combo.join(','))

                    this.data.forEach((line) => controller.enqueue(line))
                }
            } else {
                this.pcv0 = false
                lines = this.chunks.split(/13,10,13,10/)
                this.chunks = lines.pop()
                lines.forEach((line) => controller.enqueue(line))
            }
        }
    }

    flush(controller) {
        // When the stream is closed, flush any remaining chunks out.
        controller.enqueue(this.chunks)
    }
}

//create a new instant of the LineBreakTransformer  class and store it transformStreamInstants variabel
// var transformStreamInstants = new LineBreakTransformer()
var transform = new LineBreakTransformer()

const arrayConvert = (buffer) => {
    const view = new Uint8Array(buffer)
    const array = Array.from(view)
    return array
}
const stringToCharCodeArray = (input) =>
    [...input].map((char) => char.charCodeAt(0))
const unicodeToChar = (data) => String.fromCharCode(...data)
async function writeData(port, data, dataInstring) {
    try {
        const writer = port.writable.getWriter()
        await writer.write(new Uint8Array(data))
        console.log('DATA SENT by webworker', data.join(', '))
        //writer.releaseLock()
        await writer.close()
    } catch (e) {
        console.log('!!DATA NOT SENT by webworker', e)
        // transform.aiFormatFileFlag = false
        transform.aiFetchAudioFlag = false
    }
}

async function read(port) {
    const READER = port.readable
        .pipeThrough(new TransformStream(transform))
        .getReader()
    try {
        while (true) {
            console.log('waiting for data from web worker... ')
            const { value } = await READER.read()
            console.log('value', value)
            let arrayData
            if (
                value[0] == ',' &&
                value[1] == '8' &&
                value[2] == '0' &&
                value[3] == ','
            )
                arrayData = value.replace(',80', '80').split(',').map(Number)
            else arrayData = value.split(',').map(Number)
            const stringData = unicodeToChar(arrayData)
            console.log(arrayData, arrayData.length)
            if (arrayData.length == 26 || arrayData.length == 30) {
                self.postMessage({ type: 'PAreadPCv0', value: arrayData })
                self.postMessage({ type: 'PAreadKlaw', value: arrayData })
            }
            if (arrayData.length == 32) {
                self.postMessage({ type: 'PAreadZH', value: arrayData })
            }
            if (arrayData.length == 57 || arrayData.length == 39) {
                self.postMessage({ type: 'PAread', value: arrayData })
            }
            if (arrayData.length == 17) {
                self.postMessage({ type: 'RobokiPAread', value: arrayData })
            }
            console.log('TTTTTTT', arrayData)
            // if (arrayData.length == 31) {
            //     self.postMessage({ type: 'PAreadKlaw', value: arrayData })
            // }

            if (stringData.includes('US')) {
                self.postMessage({ type: 'Appread', value: arrayData })
            }
            self.postMessage({ type: 'read', value: stringData })
            self.postMessage({
                type: 'actionRead',
                value: { arrayData, stringData },
            })
            if (stringData.includes('SR') && stringData.includes('ER'))
                self.postMessage({
                    type: 'servoRead',
                    value: arrayData.splice(4, 32),
                })
        }
    } catch (e) {
        console.log('ERROR', e)
    } finally {
        transform.fetchFileFlag = false
        // transform.aiFormatFileFlag = false
        transform.aiFetchAudioFlag = false
        transform.format1310 = false
        READER.releaseLock()
    }
}

/* eslint-disable */
self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'connected':
            try {
                devices = await navigator.serial.getPorts()
                port = devices[0]
                if (!check) {
                    if (event.data.pid == 29987) {
                        await port.open({ baudRate: 120000 })
                    } else await port.open({ baudRate: 115200 })

                    check = true
                }
                console.log('pcbo', transform.pcv0)
                // if (checkReady(port)) {
                self.postMessage({ type: 'connected', value: true })
                read(port)
                // }
            } catch (e) {
                self.postMessage({ type: 'connected', value: false })
            }
            break
        case 'disconnected':
            transform.chunks = ''
            transform.pcv0 = false
            transform.fetchFileFlag = false
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = false
            transform.format1310 = false
            // if (!port || port.writable == null) return
            // await port.close()
            check = false
            if (!transform.pcv0) {
                await port.close()
            }
            break
        case 'write':
            if (!port) return
            transform.fetchFileFlag = false
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = false
            transform.format1310 = false
            writeData(
                port,
                stringToCharCodeArray(`${event.data.value}`),
                event.data.value
            )
            break
        case 'writeArray':
            if (!port) return
            transform.fetchFileFlag = false
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = false
            transform.format1310 = false
            console.log('wrieteeee array', event.data.value)
            writeData(port, event.data.value, event.data.value)
            break
        //in create action fetch the all file from board
        case 'fetchFileWriteArray':
            if (!port) return
            transform.fetchFileFlag = true
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = false
            transform.format1310 = false
            console.log(transform.fetchFileFlag)
            writeData(port, event.data.value, event.data.value)
            break
        // case 'aiFormatWriteArray':
        //     if (!port) return
        //     transform.fetchFileFlag = false
        //     transform.aiFormatFileFlag = true
        //     transform.aiFetchAudioFlag = false
        //     transform.format1310 = false
        //     transform.chunks = ''
        //     console.log(transform.aiFormatFileFlag)
        //     writeData(port, event.data.value, event.data.value)
        //     break
        case 'aiFetchAudioWriteArray':
            if (!port) return
            transform.fetchFileFlag = false
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = true
            transform.format1310 = false
            transform.chunks = ''

        /*
format1310, is check any string start with 13,10 and end with 13,10 in between present the data get from board.

this for is not same like PA format that are present normal read condition for PA read.
*/
        case 'WriteArrayFormat1310':
            if (!port) return
            transform.chunks = ''
            // transform.aiFormatFileFlag = false
            transform.aiFetchAudioFlag = false
            transform.fetchFileFlag = false
            transform.format1310 = true
            writeData(port, event.data.value, event.data.value)
            break
        case 'reconnect':
            if (event.data.deviceVersion[0] == 0 && event.data.device == 'Ace')
                transform.pcv0 = true
            break
        case 'clearChunks':
            transform.chunks = ''
            break
    }
})
