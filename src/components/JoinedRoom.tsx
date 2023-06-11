import { useEffect, useState, Dispatch, SetStateAction} from  'react';

import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db,} from '../db/firebase';

import { generateRandomString } from '../lib/generateId';

import { BsFillSendFill } from 'react-icons/bs'
import { MdPeopleAlt } from 'react-icons/md'
import { FaBan } from 'react-icons/fa'


import RoomNav from './RoomNav';
import Messages from './Messages';
import Requests from './Requests';
import AdminModal from './AdminModal';
import CustomBannedWordsModal from './CustomBannedWordsModal';


// TODO
export type message = {
  id: string,
  userId: string
  text: string,
  postedAt: number,
  userName: string
}

//TODO
export type requestType = {
  id: string
  email: string
  userName: string
}

export type joinedRoomType = {
  admin: string
  banned: string[]
  messages: message[]
  mods: string[]
  name: string
  type: 'public'|'private'
  members?: requestType[]
  requests?: requestType[]
}

type JoinedRoomProps = {
  joinedRoomId : null|string
  setJoinedRoomId: Dispatch<SetStateAction<null|string>>
  user: Record<string,any>//TODO
  userName: string
}


export default function JoinedRoom({
  joinedRoomId, 
  user, 
  setJoinedRoomId, 
  userName
}: JoinedRoomProps) {
  const [ messages, setMessages ] = useState<message[]>([])
  const [ requests, setRequests ] = useState<requestType[]>([])
  const [ text, setText ] = useState<string>('')
  const [ roomName, setRoomName ] = useState<string>('')
  const [ forceScroll, setForceScroll ] = useState<boolean>(false)
  const [ interfaceSelected, setInterfaceSelected ] = useState<string>('messages')
  const [ roomType, setRoomType ] = useState<string>('public')
  const [ isAdmin, setIsAdmin ] = useState<boolean>(false)
  const [ adminId, setAdminId ] = useState<string>('')
  const [ isMod, setIsMod ] = useState<boolean>(false)
  const [ modList, setModList ] = useState<string[]>([])
  const [ showAdminModal, setShowAdminModal ] = useState<boolean>(false)
  const [ showCustomBannedWordsModal, setShowCustomBannedWordsModal ] = useState<boolean>(false)
  const [ customCensoredWords, setCustomCensoredWords ] = useState<string[]>([])



  const userId = user?.uid || null
 


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

        setText('')
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  useEffect(() => {
    let unSub = () => console.log('')

    if (joinedRoomId !== null) {
      const joinedRoomRef = doc(db, 'rooms', joinedRoomId)
       unSub = onSnapshot(joinedRoomRef, (doc) => {
      const data = doc?.data() as joinedRoomType
      if (doc.exists()) {                 
        const isBanned = data.banned.some(user => user === auth?.currentUser?.uid)
        if (isBanned) {
          return setJoinedRoomId(null)
        }        
        setAdminId(data.admin)
        setMessages(data.messages)
        setRoomName(data.name)
        setRoomType(data.type)
        setModList(data.mods)        
        data.admin === auth?.currentUser?.uid && setIsAdmin(true)
        data.mods.some((user) => user === auth?.currentUser?.uid) && setIsMod(true)
        if (data.type === 'private' && data?.requests) {
          setRequests(data.requests)
          //TODO refactor this
        }
        // scrolling to bottom when new message are made
        if (data.messages.length > messages.length) {
          setForceScroll(true)
        }
      }            
    })
    }
    
    return () => unSub()
  }, [joinedRoomId])




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
    <div className='min-w-[280px] max-w-[500px] mx-auto overflow-hidden mt-8'>
      {showAdminModal && 
      <AdminModal 
        setShowAdminModal={setShowAdminModal}
        joinedRoomId={joinedRoomId}
        isAdmin={isAdmin}
        isMod={isMod}
        roomName={roomName}
        setRoomName={setRoomName}
      />}
      {showCustomBannedWordsModal && auth?.currentUser?.uid &&
      <CustomBannedWordsModal 
        setShowModal={setShowCustomBannedWordsModal}
        customCensoredWords={customCensoredWords}
        setCustomCensoredWords={setCustomCensoredWords}
      />
      }
      <div className='bg-mySecondary text-myText py-2 mb-4 font-bold text-2xl rounded-md relative'>
        <p className='text-center min-h-[24px]'>
          {roomName.length === 0 ? '' : roomName}
        </p>
        <MdPeopleAlt className="absolute top-[50%] right-[3%] translate-y-[-50%] hover:scale-105 active:scale-100 hover:fill-blue-400 transition-all duration-150"
          onClick={() => setShowAdminModal(true)}
        />
        <FaBan className="absolute top-[50%] left-[3%] translate-y-[-50%] hover:scale-105 active:scale-100 hover:fill-red-600 transition-all duration-100"
          onClick={() => setShowCustomBannedWordsModal(true)}
        />

      </div>
      { roomType === 'private' && 
        <RoomNav 
          interfaceSelected={interfaceSelected} 
          setInterfaceSelected={setInterfaceSelected} 
      />}
      <div className='relative chat px-2 py-2 mt-4  bg-myPrimary text-myBackground rounded-xl h-[60vh] overflow-y-auto overflow-x-hidden transition-all duration-100'>
        { interfaceSelected === 'messages' && 
          <Messages 
            messages={messages} 
            user={user}
            isAdmin={isAdmin}
            isMod={isMod}
            modList={modList}
            joinedRoomId={joinedRoomId}
            adminId={adminId}  
            customCensoredWords={customCensoredWords}          
        />}

        { interfaceSelected === 'requests' && 
          <Requests 
            requests={requests} 
            isAdmin={isAdmin} 
            isMod={isMod} 
            joinedRoomId={joinedRoomId}
          /> }
      </div>

      { user && joinedRoomId &&
        <div className='mt-1 flex rounded-md overflow-hidden'>
        <textarea value={text}
          className='text-area text-myBackground px-2 py-1 outline-none w-[85%]'
          onChange={(e) => setText(e.currentTarget.value)}
          onInput={autoAdjustHeight}
          maxLength={500}                               
        />
        <button onClick={() => sendText({id: generateRandomString(), userId, text, postedAt: Date.now(), userName})}
          className='w-[15%] flex items-center justify-center text-2xl bg-myAccent active:bg-myPrimary transition-all duration-100'
        >
          <BsFillSendFill />
        </button>
      </div>
      }
     
    </div>
  )
}
