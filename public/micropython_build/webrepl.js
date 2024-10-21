let term;
let ws;
let connected = false;
let binary_state = 0;
let put_file_name = null;
let put_file_data = null;
let outputMessage = [];
let slideIndex = 1;

const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: {
        name: 'python',
        version: 3,
    },
    lineNumbers: true,
    indentUnit: 4,
});
editor.setSize(null, '54vh');
editor.setValue('');
const uploadButton = document.getElementById('upload');
const message = document.getElementById('message');
const wifiOn = document.getElementById('wifiOn');
const wifiOff = document.getElementById('wifiOff');
const html = document.getElementsByTagName('html')[0];
const errorButton = document.getElementById('error');

const reboot = () => {
    ws.send(String.fromCharCode(4));
    setTimeout(() => {
        connect('ws://192.168.4.1:8266', sendFileData, 'sendFileData');
    }, 1000);
};

const upload = () => {
    uploadButton.style.display = 'none';
    connect('ws://192.168.4.1:8266', reboot, 'reboot');
};

const back = () => {
    var url = new URL(window.location.href);
    var from = url.searchParams.get('from');
    if (from === 'exe') {
        window.location.href = 'http://localhost:3123/#/code';
    } else window.location.href = 'https://plode.org/code';
};

const connect = (url, functionToExecute, funName) => {
    var hostport = url.substring(5);
    if (hostport === document.location.host) {
        hostport = '';
    }
    window.location.hash = hostport;
    ws = new WebSocket(url);
    setTimeout(() => {
        if (funName == 'reboot') {
            if (ws.readyState === 0) {
                wifiOff.style.display = 'block';
                wifiOn.style.display = 'none';
                alert('Please connect to PLAYCOMPUTER wifi and try again :) ');
                location.reload();
            } else {
                wifiOff.style.display = 'none';
                wifiOn.style.display = 'block';
            }
        }
    }, 1000);
    ws.binaryType = 'arraybuffer';
    ws.onopen = function () {
        ws.onmessage = function (event) {
            if (event.data instanceof ArrayBuffer) {
                var data = new Uint8Array(event.data);
                switch (binary_state) {
                    case 11:
                        // first response for put
                        if (decode_resp(data) == 0) {
                            // send file data in chunks
                            for (
                                var offset = 0;
                                offset < put_file_data.length;
                                offset += 1024
                            ) {
                                ws.send(
                                    put_file_data.slice(offset, offset + 1024)
                                );
                            }
                            binary_state = 12;
                        }
                        break;
                    case 12:
                        // final response for put
                        if (decode_resp(data) == 0) {
                            ws.send('i');
                            ws.send('m');
                            ws.send('p');
                            ws.send('o');
                            ws.send('r');
                            ws.send('t');
                            ws.send(' ');
                            ws.send('t');
                            ws.send('e');
                            ws.send('s');
                            ws.send('t');
                            ws.send(String.fromCharCode(13));
                        }
                        binary_state = 0;
                        break;
                }
            }
            if (event.data === 'Password: ') {
                ws.send('p');
                ws.send('l');
                ws.send('a');
                ws.send('y');
                ws.send(String.fromCharCode(13));
            } else if (event.data === '\r\nWebREPL connected\r\n>>> ') {
                functionToExecute();
            } else {
                if (event.data !== '>>> ') {
                    outputMessage.push(event.data);
                } else {
                    if (
                        outputMessage.indexOf(
                            'Traceback (most recent call last):'
                        ) !== -1
                    ) {
                        errorButton.style.display = 'block';
                        uploadButton.style.display = 'none';
                        html.style.background = 'lightgray';
                        message.style.color = '#E4626D';
                        message.style.fontSize = '1.5vw';
                        message.innerHTML = outputMessage
                            .slice(
                                outputMessage.indexOf(
                                    'Traceback (most recent call last):'
                                )
                            )
                            .join(' ');
                    } else {
                        errorButton.style.display = 'block';
                        uploadButton.style.display = 'none';
                        html.style.background = 'lightgray';
                        message.style.fontSize = '1.5vw';
                        message.style.color = '#198754';
                        message.innerHTML =
                            'Output : ' + outputMessage.slice(15).join(' ');
                    }
                    outputMessage = [];
                    ws.close();
                }
            }
        };
    };

    ws.onclose = function () {};
};

const decode_resp = (data) => {
    if (data[0] == 'W'.charCodeAt(0) && data[1] == 'B'.charCodeAt(0)) {
        var code = data[2] | (data[3] << 8);
        return code;
    } else {
        return -1;
    }
};

const put_file = () => {
    var dest_fname = put_file_name;
    var dest_fsize = put_file_data.length;
    // WEBREPL_FILE = "<2sBBQLH64s"
    var rec = new Uint8Array(2 + 1 + 1 + 8 + 4 + 2 + 64);
    rec[0] = 'W'.charCodeAt(0);
    rec[1] = 'A'.charCodeAt(0);
    rec[2] = 1; // put
    rec[3] = 0;
    rec[4] = 0;
    rec[5] = 0;
    rec[6] = 0;
    rec[7] = 0;
    rec[8] = 0;
    rec[9] = 0;
    rec[10] = 0;
    rec[11] = 0;
    rec[12] = dest_fsize & 0xff;
    rec[13] = (dest_fsize >> 8) & 0xff;
    rec[14] = (dest_fsize >> 16) & 0xff;
    rec[15] = (dest_fsize >> 24) & 0xff;
    rec[16] = dest_fname.length & 0xff;
    rec[17] = (dest_fname.length >> 8) & 0xff;
    for (var i = 0; i < 64; ++i) {
        if (i < dest_fname.length) {
            rec[18 + i] = dest_fname.charCodeAt(i);
        } else {
            rec[18 + i] = 0;
        }
    }

    // initiate put
    binary_state = 11;
    ws.send(rec);
};

const handle_put_file_select = (evt) => {
    // The event holds a FileList object which is a list of File objects,
    // but we only support single file selection at the moment.

    // Get the file info and load its data.
    var f = evt;
    put_file_name = f.name;
    var reader = new FileReader();
    reader.onload = function (e) {
        put_file_data = new Uint8Array(e.target.result);
        put_file();
    };

    reader.readAsArrayBuffer(f);
};

const sendFileData = () => {
    var file = new File([editor.getValue()], 'test.py', {
        type: 'text/plain;charset=utf-8',
    });
    handle_put_file_select(file);
};

const reset = () => {
    editor.setValue('');
};

const save = () => {
    console.log(save);
};

const help = () => {
    document.getElementById('popup').style.display = 'block';
};

const errorClose = () => {
    html.style.backgroundColor = 'white';
    message.innerHTML = '';
    uploadButton.style.display = 'block';
    errorButton.style.display = 'none';
};

const inputFile = (event) => {
    let file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
        editor.setValue(evt.target.result);
    };
    reader.readAsText(file);
};

const closePopup = () => {
    document.getElementById('popup').style.display = 'none';
};

const plusSlides = (n) => {
    showSlides((slideIndex += n));
};

const currentSlide = (n) => {
    showSlides((slideIndex = n));
};

const showSlides = (n) => {
    let i;
    let slides = document.getElementsByClassName('mySlides');
    let dots = document.getElementsByClassName('dot');
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }
    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].className += ' active';
};
showSlides(slideIndex);
