import React from "react";
import { Button, Form } from 'react-bootstrap';
import "./GameBoard";

export default function Chat({
  sendMessage,
  messages,
  currentMessage,
  setCurrentMessage,
  userName,
  messageRef
}) {
  return (
    <>
      <div className="chat">
        {messages.map((item, index) => {
          let lastMessage = index === messages.length - 1
          if(item.playerName === userName) {
            return (
            <div ref={lastMessage ? messageRef : null} key={index} className="chat-me">
              {item.message}
            </div> )
          } else {
            return (
            <div ref={lastMessage ? messageRef : null} key={index} className="chat-other">
              {item.message}
            </div>)
          }
        }
        )}
      </div>
      <Form onSubmit={sendMessage} style={{margin:'1% 0 5% 0'}}>
      <Form.Control className="mt-2" placeholder={'Enter your message...'} 
          value={currentMessage} onChange={(event) => setCurrentMessage(event.target.value)}/>
        <Button variant="outline-info" type="submit" style={{margin:'2% 0 0 3%'}}>Send</Button>
      </Form>
    </>
  );
}
