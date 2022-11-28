import { useState } from "react";
import GameBoard from "./GameBoard";
import {Form, Button, Card, Modal,Accordion   } from 'react-bootstrap';

const HOSTNAME = "https://task7server-production.up.railway.app";

function Main() {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomValidation, setRoomValidation] = useState(false);
  const [show, setShow] = useState(false);
  const [modalInfo, setModal]=useState('');
  const handleClose = () => setShow(false);

  async function createRoom(e) {
    e.preventDefault();
    let flag = validateFields()

    if(flag) {
      let rooms = await fetchData();
      
      if(!rooms[roomName]){
        setRoomValidation(true)
      } else {
        setModal("Room already exists...");
        setShow(true);
        setUserName('');
        setRoomName('');
      }
    }
  }

  async function joinRoom(e) {
    e.preventDefault();
    let flag = validateFields()
    if(flag){
      let rooms = await fetchData();
      if(rooms[roomName]) {
        if(rooms[roomName].player1.playerName !== null && rooms[roomName].player2.playerName !== null) {
          alert("Room is full...")
        } else {
          setRoomValidation(true)
        }
      } else {
        setModal("Room does not exists...");
        setShow(true);
        setUserName('');
        setRoomName('');
      }
    }
  }

  async function fetchData() {
    let data = fetch(`${HOSTNAME}/rooms/`).then((res) => res.json());
    return data;
  }

  function validateFields() {
    if(userName.length !== 0 && roomName.length !== 0) {
      return true
    }
    return false
  }

  return (
    <>
      {
        !roomValidation ? (          
          <div style={{margin:'10% auto 0 auto', width:'50%'}}>
            <h2 style={{textAlign:'center'}}>Tic-Tac-Toe game</h2>
             <Accordion >
      <Accordion.Item eventKey="0">
        <Accordion.Header>Create your game</Accordion.Header>
        <Accordion.Body >
          <Card  className='p-5 '>
          <Form className="d-flex flex-column">
           <Form.Control className="mt-2" type="text" list="receivers" placeholder={'Enter your username'} 
                value={userName} onChange={(e) => setUserName(e.target.value)} ></Form.Control>
            <Form.Control className="mt-2" placeholder={'Enter your ID room'}  name='nameReg'
               value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
          <div className=" d-flex  justify-content-end mt-3 pl-3 pr-3">
            <Button  variant="outline-dark" onClick={createRoom}>Let's Go</Button>
          </div>              
        </Form>
        </Card>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Join a started game</Accordion.Header>
        <Accordion.Body>
        <Card  className='p-5 '>
          <Form className="d-flex flex-column">
           <Form.Control className="mt-2" type="text" list="receivers" placeholder={'Enter your username'} 
                value={userName} onChange={(e) => setUserName(e.target.value)}></Form.Control>
            <Form.Control className="mt-2" placeholder={'Enter the ID of the game you want to join '}  name='nameReg'
               value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
          <div className=" d-flex  justify-content-end mt-3 pl-3 pr-3">
            <Button  variant="outline-dark" onClick={joinRoom}>Let's Go</Button>
          </div>              
        </Form>
        </Card>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>

    <Modal show={show} onHide={handleClose}>
      <Modal.Body>{modalInfo}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
          </div>
        ) : (
          <GameBoard ROOM={roomName} userName={userName} setRoomValidation={setRoomValidation} />
        )
      }
    </>
  );
}

export default Main;
