import { useEffect, useState,} from  'react';

import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db,} from '../db/firebase';

import { generateRandomString } from '../lib/generateId';

import { BsFillSendFill } from 'react-icons/bs'
import { MdPeopleAlt } from 'react-icons/md'



import RoomNav from './RoomNav';
import Messages from './Messages';
import Requests from './Requests';
import AdminModal from './AdminModal';

type JoinedRoomProps = {
  joinedRoomId : null|string
  user: any //TODO
}
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

export default function JoinedRoom({joinedRoomId, user}: JoinedRoomProps) {
  const [ messages, setMessages ] = useState<message[]>([])
  const [ requests, setRequests ] = useState<requestType[]>([])
  const [ text, setText ] = useState<string>('')
  const [ roomName, setRoomName ] = useState<string>('')
  const [ userName, setUserName ] = useState<string>('')
  const [ forceScroll, setForceScroll ] = useState<boolean>(false)
  const [ interfaceSelected, setInterfaceSelected ] = useState<string>('messages')
  const [ roomType, setRoomType ] = useState<string>('public')
  const [ isAdmin, setIsAdmin ] = useState<boolean>(false)
  const [ isMod, setIsMod ] = useState<boolean>(false)
  const [ modList, setModList ] = useState<string[]>([])
  const [ showAdminModal, setShowAdminModal ] = useState<boolean>(false)


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
    let unSub = () => console.log('')

    if (joinedRoomId !== null) {
      const joinedRoomRef = doc(db, 'rooms', joinedRoomId)
       unSub = onSnapshot(joinedRoomRef, (doc) => {
      const data = doc.data() as any
      if (data) {
   
        setMessages(data.messages)
        setRoomName(data.name)
        setForceScroll(true)
        setRoomType(data.type)
        setModList(data.mods)        
        data.admin === auth?.currentUser?.uid && setIsAdmin(true)
        data.mods.some((user: requestType) => user.id === auth?.currentUser?.uid) && setIsMod(true)
        if (data.type === 'private') {
          setRequests(data.requests)
          //TODO refactor this
        }
      }            
    })
    }
    
    return () => unSub()
  }, [joinedRoomId])


  // useEffect(() => {
  //   console.log(requests, 'requests')
  // }, [requests])


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
      <div className='bg-mySecondary text-myText py-2 mb-4 font-bold text-2xl rounded-md relative'>
        <p className='text-center'>
          {roomName}
        </p>
        <MdPeopleAlt className="absolute top-[50%] right-[3%] translate-y-[-50%] hover:scale-105 active:scale-100 hover:fill-blue-400 transition-all duration-150"
          onClick={() => setShowAdminModal(true)}
        />
      </div>
      { roomType === 'private' && <RoomNav interfaceSelected={interfaceSelected} setInterfaceSelected={setInterfaceSelected} />}
      <div className='relative chat px-2 py-2 mt-4  bg-myPrimary text-myBackground rounded-xl h-[60vh] overflow-y-auto overflow-x-hidden transition-all duration-100'>
        { interfaceSelected === 'messages' && 
          <Messages 
            messages={messages} 
            user={user}
            isAdmin={isAdmin}
            isMod={isMod}
            modList={modList}
            joinedRoomId={joinedRoomId}
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
