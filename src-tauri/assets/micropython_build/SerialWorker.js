var devices,
  port,
  check = false;
let isGetFiles = false;
let isIgnore = 0;
//custom Tranform stream
class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
    this.getFilesFlag = false;
  }

  transform(chunk, controller) {
    // Append new chunks to existing chunks.
    this.chunks = this.chunks + chunk + ",";
    // console.log('this chunks ', this.chunks)
    // For each line breaks in chunks, send the parsed lines out.
    let lines;
    if (this.chunks.length > 500) {
      // console.log(chunk)
      this.chunks = "";
      controller.enqueue(this.chunks);
    } else if (this.chunks.includes("13,10,79,75,13,10,")) {
      this.chunks = "";
      controller.enqueue("13,10,79,75,13,10");
    }
    // else if (this.chunk.includes('85,83,113,10')) {
    //     this.chunks = this.chunks.replace('85,83,113,10', '')
    //     controller.enqueue('85,83,113,10')
    // }
    lines = this.chunks.split(/13,10,13,10/);
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}
const stringToCharCodeArray = (input) =>
  [...input].map((char) => char.charCodeAt(0));
const unicodeToChar = (data) => String.fromCharCode(...data);
async function writeData(port, data, dataInstring) {
  try {
    const writer = port.writable.getWriter();
    await writer.write(new Uint8Array(data));
    console.log("DATA SENT by webworker");
    writer.releaseLock();
  } catch (e) {
    console.log(e);
    console.log("!!DATA NOT SENT by webworker");
  }
}
async function read(port) {
  const READER = port.readable
    // .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .getReader();
  try {
    let getFilearrString = "";
    let getFileDataString = "";
    while (true) {
      // console.log("waiting for data from web worker... ");
      const { value } = await READER.read();
      const stringData = unicodeToChar(value);
      if (isGetFiles) {
        getFilearrString += stringData;
        if (getFilearrString.includes(`.py']`)) {
          const fileArrRegex = /\[.*?\]/s;
          const match = getFilearrString.match(fileArrRegex);
          if (match) {
            // console.log(eval(match[0]))
            self.postMessage({ type: "getFileRead", value: match[0] });
          }
          getFilearrString = "";
          isGetFiles = false;
        }
      } else if (isIgnore > 0) {
      } else {
        self.postMessage({ type: "read", value: stringData });
      }
      // if (isIgnore.includes(true)) {
      // getFileDataString = getFileDataString + " " + value.join(" ")
      // console.log(getFileDataString)
      // // for delet the file
      // let regexPattern = /13 10 62 62 62([\s\S]*?)13 10 62 62 62/g;
      // let matches = getFileDataString.match(regexPattern);
      // if (matches) {
      //     getFileDataString = ""
      //     isIgnore.splice(0, 1) //&& !isIgnore.includes(true)
      // }
      // }
      // console.log(stringData)
      // if (!stringData1.includes('OK'))
      // self.postMessage({ type: "read", value: stringData });
    }
  } catch (e) {
    console.log(e);
  } finally {
    READER.releaseLock();
  }
}

/* eslint-disable */
self.addEventListener("message", async (event) => {
  switch (event.data.type) {
    case "connected":
      isIgnore = 0;
      try {
        devices = await navigator.serial.getPorts();
        port = devices[0];
        if (!check) {
          await port.open({ baudRate: 115200 });
          check = true;
        }

        console.log("PeeCee connected ");
        // if (checkReady(port)) {
        self.postMessage({ type: "connected", value: true });
        read(port);
      } catch (e) {
        console.log(e);
        self.postMessage({ type: "connected", value: false });
      }
      break;
    case "disconnected":
      isIgnore = 0;
      if (!port) return;
      try {
        check = false;
        await port.close();
        // check = false;
        console.log("PeeCee disconnected ");
      } catch (e) {
        console.log(e);
      }
      break;
    case "write":
      if (!port) return;
      isGetFiles = false;
      isIgnore = 0;
      writeData(
        port,
        stringToCharCodeArray(`${event.data.value}`),
        event.data.value
      );

      break;
    case "writeArray":
      if (!port) return;
      isGetFiles = false;
      isIgnore = 0;
      writeData(port, event.data.value, event.data.value);

      break;
    case "getFiles":
      if (!port) return;
      isGetFiles = true;
      isIgnore = 0;
      writeData(port, event.data.value, event.data.value);
      break;
    case "ignoreConsolePrint":
      if (!port) return;
      isGetFiles = false;
      isIgnore = isIgnore + 1;
      writeData(port, event.data.value, event.data.value);
      break;
  }
});
