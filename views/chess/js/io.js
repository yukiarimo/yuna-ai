function PrSq(sq) {
	return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);
}

function PrMove(move) {	
	var MvStr;
	
	var ff = FilesBrd[FROMSQ(move)];
	var rf = RanksBrd[FROMSQ(move)];
	var ft = FilesBrd[TOSQ(move)];
	var rt = RanksBrd[TOSQ(move)];
	
	MvStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];
	
	var promoted = PROMOTED(move);

	if(promoted != PIECES.EMPTY) {
		var pchar = 'q';
		if(PieceKnight[promoted] == BOOL.TRUE) {
			pchar = 'n';
		} else if(PieceRookQueen[promoted] == BOOL.TRUE && PieceBishopQueen[promoted] == BOOL.FALSE)  {
			pchar = 'r';
		} else if(PieceRookQueen[promoted] == BOOL.FALSE && PieceBishopQueen[promoted] == BOOL.TRUE)   {
			pchar = 'b';
		}
		MvStr += pchar;
	}
	return MvStr;
}

function PrintMoveList() {

	var index;
	var move;
	var num = 1;
	console.log('MoveList:');

	for(index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply+1]; ++index) {
		move = GameBoard.moveList[index];
		console.log('IMove:' + num + ':(' + index + '):' + PrMove(move) + ' Score:' +  GameBoard.moveScores[index]);
		num++;
	}
	console.log('End MoveList');
}

function ParseMove(from, to) {

	GenerateMoves();
	
	var Move = NOMOVE;
	var PromPce = PIECES.EMPTY;
	var found = BOOL.FALSE;
	
	for(index = GameBoard.moveListStart[GameBoard.ply]; 
							index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {	
		Move = GameBoard.moveList[index];
		if(FROMSQ(Move) == from && TOSQ(Move) == to) {
			PromPce = PROMOTED(Move);
			if(PromPce != PIECES.EMPTY) {
				if( (PromPce == PIECES.wQ && GameBoard.side == COLOURS.WHITE) ||
					(PromPce == PIECES.bQ && GameBoard.side == COLOURS.BLACK) ) {
					found = BOOL.TRUE;
					break;
				}
				continue;
			}
			found = BOOL.TRUE;
			break;
		}		
	}
	
	if(found != BOOL.FALSE) {
		if(MakeMove(Move) == BOOL.FALSE) {
			return NOMOVE;
		}
		TakeMove();
		return Move;
	}
	
	return NOMOVE;
}




















































