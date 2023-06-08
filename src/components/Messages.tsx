
import type { message } from "./JoinedRoom"

interface MessagesProps {
  messages: message[]
  user: any //TODO
}


export default function Messages({messages, user}: MessagesProps) {
  return (
    <>
    {messages.map((message, index) => {
    return (
    <div key={index} className='flex flex-col mb-3 mt-1'>
      <div className={message.userId === user?.uid ?
        'max-w-[80%] ms-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip' : 
        'max-w-[80%] me-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip'
      }
      >
        {message.text}
      </div>
      <small className={message.userId === user?.uid ?
        'opacity-55 ms-auto':
        'opacity-55 me-auto'
      }>
        {message?.userName}
      </small>
    </div>
    )
  })}
    </>
  )
}
