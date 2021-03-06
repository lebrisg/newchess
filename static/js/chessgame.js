$(document).ready(function() {
// initiated socket client
var socket = io();                                  
// join room as defined by query parameter in URL bar
socket.emit('join', getParameterByName('gameid'));  
//var room = getRoom();
//console.log('Room: ' + room);
// socket.emit('join', room());  

// remote move by peer
socket.on('move', function(moveObj){ 
  console.log('peer move: ' + JSON.stringify(moveObj));
  var move = game.move(moveObj);
  // illegal move
  if (move === null) {
    return;
  }
  updateStatus();
  board.position(game.fen());
});

var board,
  game = new Chess(),
//  roomE1 = $('#room'),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {
    // move object
    var moveObj = ({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });
    console.log('own move: ' + JSON.stringify(moveObj));
    // see if the move is legal
    var move = game.move(moveObj);
    // illegal move
    if (move === null) {
      return 'snapback';
    }
    socket.emit('move', moveObj);
    updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

//  roomE1.html(rooms.length-1);
  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);

updateStatus();
});
