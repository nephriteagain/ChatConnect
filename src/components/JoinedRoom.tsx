import { useEffect, useState } from  'react';

import { onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db,} from '../db/firebase';

import { generateRandomString } from '../lib/generateId';

type JoinedRoomProps = {
  joinedRoomId : null|string
  userId: string
}
// TODO
type message = {
  id: string,
  userId: string
  text: string,
  postedAt: number,
}

export default function JoinedRoom({joinedRoomId, userId}: JoinedRoomProps) {
  const [ messages, setMessages ] = useState<message[]>([])
  const [ text, setText ] = useState<string>('')

  function autoAdjustHeight() {
    const textarea = document.querySelector('.text-area') as HTMLTextAreaElement
    textarea.style.height = 'auto'
    if (textarea.scrollHeight < 400) {
      textarea.style.height = `${textarea.scrollHeight}px`
    } else {
      textarea.style.height = '400px'
    }
  }

  async function sendText(msgObj: message) {
    if (joinedRoomId === null) return
    const roomRef = doc(db, 'rooms', joinedRoomId)

    await updateDoc(roomRef, {
      messages: arrayUnion(msgObj)
    })
      .then(() => {
        console.log('message sent')
        setText('')
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  useEffect(() => {
    if (joinedRoomId === null) return
    const joinedRoomRef = doc(db, 'rooms', joinedRoomId)
    onSnapshot(joinedRoomRef, (doc) => {
      const data = doc.data() as any
      setMessages(data.messages)
    })

  }, [joinedRoomId])

  return (
    <div>
      <div>
      {messages.map((message, index) => {
        return (
          <div key={index}>
            {message.text}
          </div>
        )
      })}
      </div>

      <div>
        <textarea value={text}
          className='text-area text-myBackground px-2 py-1 outline-none w-[70%] max-w-[300px]'
          onChange={(e) => setText(e.currentTarget.value)}
          onInput={autoAdjustHeight}                    
        />
      </div>
      <button onClick={() => sendText({id: generateRandomString(), userId, text, postedAt: Date.now()})}>
        Send
      </button>
    </div>
  )
}
