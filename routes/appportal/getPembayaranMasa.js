const { PythonShell } = require('python-shell')

const getPembayaranMasa = (req, res) => {
  const shell = new PythonShell('get_pembayaran_masa.py', {
    pythonPath: 'C:/ProgramData/Anaconda3/python.exe',
    args: ['817931780', 'Miskiran6012']
  })
  shell.on('message', message => {
    console.log(message)
  })
  shell.end(err => {
    if(err) console.log(err)
    process.exit()
  })
}

if(process.argv[2] == 'run') getPembayaranMasa()