import { useEffect, useState, useMemo, useCallback } from 'react';
import '../css/GameBoard.css';
import {Container ,Navbar , Button, Modal } from 'react-bootstrap';
import { solutions } from '../utils/Solutions'
import { io } from 'socket.io-client'
import Chat from './Chat';
import Winners from './Winners';

const SERVER = "https://task7server-production.up.railway.app"

function GameBoard({ROOM, userName, setRoomValidation, cbExite}) {

  const socket = useMemo(() => io(SERVER, {query:{ roomId:ROOM, playerName: userName }}), [ROOM, userName]);

  const [board,setBoard] = useState(new Array(9).fill(''));
  const [current, setCurrent] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isWaiting,setIsWaiting] = useState(false);
  const [myRole, setMyRole] = useState("...");
  const [secondPlayer, setSecondPlayer] = useState("...");
  const [allPlayers,setAllPlayers] = useState({});
  const [winners,setWinners] = useState([]);
  const [firstReq, setFirstReq] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [navToggle, setNavToggle] = useState(true);
  const [show, setShow] = useState(false);
  const [modalInfo, setModal]=useState('');
  const handleClose = () => setShow(false);

  const messageRef = useCallback(node => {
    if(node) {
      node.scrollIntoView({ smooth: true });
    }
  },[]);

  const sendMessage=(event)=>{
    event.preventDefault();
    socket.emit("chat",{message: currentMessage, roomName:ROOM, playerName: userName});
    setMessages(prev => [...prev, {message: currentMessage, roomName:ROOM, playerName: userName}]);
    setCurrentMessage("");
  }

  const setData=(index)=>{
    let data = [...board];
    data[index] = current ? 'X' : 'O';
    setBoard([...data]);
    setIsWaiting(prevState => !prevState);
    setCurrent(!current);
    socket.emit("board",{ board:{board:data,current:!current,isFinished:isFinished,playerName:userName},roomName:ROOM });

    if(firstReq) {
      socket.emit("set-role",{playerName:userName,socketId: socket.id,roomName:ROOM,role: current ? 'X' : 'O'});
      setFirstReq(false);
      setMyRole(current ? 'X' : 'O');
    }
  };

  const validateData=()=>{
    solutions.forEach((item,index)=>{
    let tempList = [...board];
    let temp = [tempList[item[0]],tempList[item[1]],tempList[item[2]]];    
      if(JSON.stringify(temp) === '["X","X","X"]' || JSON.stringify(temp) === '["O","O","O"]') {
        let currentPlayer = !current ? 'X' : 'O';        
        fetch(`${SERVER}/getPlayerRoles/${ROOM}`)
        .then((res)=>res.json())
        .then((data)=> {
          let flag = currentPlayer === 'X';
          let winPlayer;
          if(flag) {
            if(data.player1.role === 'X'){
              winPlayer = data.player1.playerName;
            } else {
              winPlayer = data.player2.playerName;
            }
          } else {
            if(data.player1.role === 'O'){
              winPlayer = data.player1.playerName;
            } else {
              winPlayer = data.player2.playerName;
            }
          }
          setModal(`${winPlayer} (${currentPlayer}) - won the game !`);
          setShow(true);
          setWinners([...winners,winPlayer])
          setFirstReq(true)
        }).catch((err)=>console.log(err));
        setIsFinished(true);
      }
    })
  };

  const resetBoard=()=>{
    setBoard(new Array(9).fill(''));
    setIsFinished(false);
    setCurrent(true);
    socket.emit("board",{ board:{board:new Array(9).fill(''),current:true,isFinished:false,playerName:userName},roomName:ROOM });
    setIsWaiting(false);
    setMyRole("X");
    fetch(`${SERVER}/setPlayerRoles/${ROOM}`)
    .then((res)=> {
       console.log(res)
    })
    .catch((err)=>console.log(err)) ;
  }

  const copyRoomName=()=>{
    navigator.clipboard.writeText(ROOM);
    setModal(`Room name is - ${ROOM}. Share this name and play with a friend!`);
    setShow(true);
  }

  const exitRoom=()=>{
    socket.close();
    setRoomValidation(false);
    cbExite(true);
  }

  useEffect(() => {
    validateData();
    // eslint-disable-next-line
  },[board])

  useEffect(() => {
    socket.on("board",(data) => {
      setBoard(data.board);
      setCurrent(data.current);
      setIsWaiting(false);
      setIsFinished(data.isFinished);
    });
    socket.on("new-user",(data)=>{
      resetBoard();
      setAllPlayers(data);
    });
    socket.on("remove-user",(data)=>{
      setSecondPlayer("...");
      setModal(`${data} disconnected from the game !`);
      setShow(true);
      resetBoard();
    });
    socket.on("chat", (data) => {
      setMessages(prev => [...prev, {message: data.message, roomName:data.roomName, playerName: data.playerName}]);
    });
    //eslint-disable-next-line
  },[socket])


  useEffect(() => {
      if(allPlayers?.player1?.playerName === userName){
        setSecondPlayer(allPlayers.player2.playerName ? allPlayers.player2.playerName : "...");
      } else if (allPlayers?.player2?.playerName === userName) {
        setSecondPlayer(allPlayers.player1.playerName ? allPlayers.player1.playerName : "...");
      } else {
        setSecondPlayer("...");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[allPlayers]);

  return(
    <>
    <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand >Tic-Tac-Toe game</Navbar.Brand>
          <div style={{display:'flex', flexDirection:'row'}}>
          <div style={{fontWeight:'bold', fontSize:'2em'}}>{userName} </div>
            <div style={{fontSize:'1.5em', margin:'3% 5% 0 5%', color:'#790604'}}><i className="fa-solid fa-shield-alt"></i></div>
            <div style={{fontWeight:'bold', fontSize:'2em'}}>{secondPlayer}</div>
          </div>
          <Button variant="outline-danger" onClick={exitRoom}>Exit</Button>
        </Container>
      </Navbar>
        
      <div className="main-container" >
        <div className="left-pane" >
            <div className="board-options">
                <div className='my-role'>Your role in the Game : <span className='my-role-value'>{myRole}</span></div>
                <div className="pipe">|</div>
                <div className='current-player'>To Play : <span className='next-player'>{current ? 'X' : 'O'}</span></div>
            </div>
            <div className='board'>
            {board.map((val,index) => (
                <button disabled={(val !== '' || isFinished || isWaiting)} onClick={()=> setData(index)} key={index} className='box'>
                {val}
                </button>
            ))}
                
            </div>
            <Button  variant="outline-danger" disabled={!(isFinished || !board.includes(""))} onClick={resetBoard}>Reset Board</Button>
        </div>
            
        <div className='right-pane'>
            <div className="btns">
            <Button variant="outline-warning" onClick={()=> setNavToggle(true)}>Chat</Button>
            <Button variant="outline-warning" onClick={()=> setNavToggle(false)}>History</Button>
            <Button variant="outline-info" onClick={copyRoomName}>Room Name</Button>
            </div>
            <hr />
            {navToggle ? 
                <Chat sendMessage={sendMessage} messages={messages} currentMessage={currentMessage} 
                 setCurrentMessage={setCurrentMessage} userName={userName} messageRef={messageRef} />
                :
                (winners.length !== 0 ? <Winners winners={winners} /> : "...")
            } 

          <Modal show={show} onHide={handleClose}>
             <Modal.Body>{modalInfo}</Modal.Body>
              <Modal.Footer>
                 <Button variant="outline-dark" onClick={handleClose}>Close</Button>
               </Modal.Footer>
           </Modal>
        </div>
      </div>
    </>
  )
}

export default GameBoard;
