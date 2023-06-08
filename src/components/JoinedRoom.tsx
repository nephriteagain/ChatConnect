import { useEffect, useState, KeyboardEvent } from  'react';

import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db,} from '../db/firebase';

import { generateRandomString } from '../lib/generateId';

import { BsFillSendFill } from 'react-icons/bs'

type JoinedRoomProps = {
  joinedRoomId : null|string
  user: any //TODO
}
// TODO
type message = {
  id: string,
  userId: string
  text: string,
  postedAt: number,
  userName: string
}

export default function JoinedRoom({joinedRoomId, user}: JoinedRoomProps) {
  const [ messages, setMessages ] = useState<message[]>([])
  const [ text, setText ] = useState<string>('')
  const [ roomName, setRoomName ] = useState<string>('')
  const [ userName, setUserName ] = useState<string>('')
  const [ forceScroll, setForceScroll ] = useState<boolean>(false)

  const userId = user?.uid || null

  async function getUserData() {
    if (!user) return
    const userRef = doc(db, 'users', userId)
    const data = await getDoc(userRef)
      .catch(err => {
        throw new Error(err)
      })
    const userName = data.data()?.userName
    setUserName(userName)
  }


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
    if (joinedRoomId === null || text.length === 0) return
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
      setRoomName(data.name)
      setForceScroll(true)
      
    })

  }, [joinedRoomId])

  useEffect(() => {
    getUserData()
  }, [user])

  useEffect(() => {
    if (!forceScroll) return
    const chatElement = document.querySelector('.chat') as HTMLDivElement
    chatElement.scrollTo({
      top: chatElement.scrollHeight,
      behavior: "smooth"
    });
    setForceScroll(false)
  }, [forceScroll])



  return (
    <div className='min-w-[300px] max-w-[500px] mx-auto overflow-hidden mt-8'>
      <p className='text-center bg-mySecondary text-myText py-2 mb-4 font-bold text-2xl rounded-md'>
        {roomName}
      </p>
      <div className='chat px-2 py-2 mt-4  bg-myPrimary text-myBackground rounded-xl h-[60vh] overflow-y-auto overflow-x-hidden transition-all duration-100'>
      
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
      </div>

      { user && joinedRoomId &&
        <div className='mt-1 flex rounded-md overflow-hidden'>
        <textarea value={text}
          className='text-area text-myBackground px-2 py-1 outline-none w-[85%]'
          onChange={(e) => setText(e.currentTarget.value)}
          onInput={autoAdjustHeight}                                  
        />
        <button onClick={() => sendText({id: generateRandomString(), userId, text, postedAt: Date.now(), userName})}
          className='w-[15%] flex items-center justify-center text-2xl bg-myAccent'
        >
          <BsFillSendFill />
        </button>
      </div>
      }
     
    </div>
  )
}
