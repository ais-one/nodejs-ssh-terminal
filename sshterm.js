/*
 * Description: Interactive SSH Terminal running on nodejs
 * Author: Aaron Gong
 * Date: 2014-11-17
 * http://www.pulse.sg/posts/nodejs_ssh_terminal
 * Licence: MIT
*/
var Connection = require('ssh2'); // npm install ssh2
gs = null;
var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
    conn.shell(function(err, stream) {
      if (err) throw err;
      stream.on('close', function() {
        console.log('Stream :: close');
        conn.end();
        process.exit(1);
      }).on('data', function(data) {
        if (!gs) gs = stream;
        if (gs._writableState.sync == false) process.stdout.write(''+data);
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
        process.exit(1);
    });
  });
}).connect({
  host: '127.0.0.1',
  port: 22,
  username: 'root',
  password: 'password'
});

// The code below is from the link below. I just sent key press to stream used by SSH instead of stdout
// http://stackoverflow.com/questions/5006821/nodejs-how-to-read-keystrokes-from-stdin
// 
var stdin = process.stdin;
stdin.setRawMode( true ); // without this, we would only get streams once enter is pressed
stdin.resume(); // resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)
stdin.setEncoding( 'utf8' ); // i don't want binary, do you?
stdin.on( 'data', function( key ) { // on any data into stdin
  if ( key === '\u0003' ) { // ctrl-c ( end of text )
    process.exit();
  }
  if (gs) gs.write('' + key); // write the key to stdout all normal like
});
