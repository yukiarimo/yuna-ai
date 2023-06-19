function ClearPiece(sq) {

	var pce = GameBoard.pieces[sq];
	var col = PieceCol[pce];
	var index;
	var t_pceNum = -1;
	
	HASH_PCE(pce, sq);
	
	GameBoard.pieces[sq] = PIECES.EMPTY;
	GameBoard.material[col] -= PieceVal[pce];
	
	for(index = 0; index < GameBoard.pceNum[pce]; ++index) {
		if(GameBoard.pList[PCEINDEX(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	GameBoard.pceNum[pce]--;
	GameBoard.pList[PCEINDEX(pce, t_pceNum)] = GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])];	

}

function AddPiece(sq, pce) {

	var col = PieceCol[pce];
	
	HASH_PCE(pce, sq);
	
	GameBoard.pieces[sq] = pce;
	GameBoard.material[col] += PieceVal[pce];
	GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])] = sq;
	GameBoard.pceNum[pce]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var pce = GameBoard.pieces[from];
	
	HASH_PCE(pce, from);
	GameBoard.pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(pce,to);
	GameBoard.pieces[to] = pce;
	
	for(index = 0; index < GameBoard.pceNum[pce]; ++index) {
		if(GameBoard.pList[PCEINDEX(pce,index)] == from) {
			GameBoard.pList[PCEINDEX(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;	

	GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;

	if( (move & MFLAGEP) != 0) {
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		} else {
			ClearPiece(to+10);
		}
	} else if( (move & MFLAGCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}
	
	if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();
	
	GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;
    
    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    var captured = CAPTURED(move);
    GameBoard.fiftyMove++;
    
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    
    GameBoard.hisPly++;
	GameBoard.ply++;
	
	if(PiecePawn[GameBoard.pieces[from]] == BOOL.TRUE) {
        GameBoard.fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLOURS.WHITE) {
                GameBoard.enPas=from+10;
            } else {
                GameBoard.enPas=from-10;
            }
            HASH_EP();
        }
    }
    
    MovePiece(from, to);
    
    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPce);
    }
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if(SqAttacked(GameBoard.pList[PCEINDEX(Kings[side],0)], GameBoard.side))  {
         TakeMove();
    	return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function TakeMove() {
	
	GameBoard.hisPly--;
    GameBoard.ply--;
    
    var move = GameBoard.history[GameBoard.hisPly].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;
    
    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if( (MFLAGEP & move) != 0) {
        if(GameBoard.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }
    
    if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}























































































