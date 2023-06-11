import { useEffect, useState, useRef, } from 'react'
import { auth, db} from './db/firebase'
import { onAuthStateChanged, } from 'firebase/auth'
import { doc, getDoc, } from 'firebase/firestore'

import User from './components/User'
import Create from './components/Create'
import Rooms from './components/Rooms'
import JoinedRoom from './components/JoinedRoom'

import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdCloseCircle} from 'react-icons/io'

import { DEFAULT_ROOM } from './lib/data'

import { TbMessage } from 'react-icons/tb'

import './App.css'

// TODO : figure app what to place here
export type userDataType = any

function App() {
  //TODO mods promotion:DONE, admin passing to mods, admin/mods removing chats, banning users, censoring words, custom censor words for users
  // TODO IMPORTANT messages should be a new collection instead of an array

  const [userData, setUserData] = useState<userDataType>(null)
  const [joinedRoomId, setJoinedRoomId] = useState<string|null>(null)
  const [ showRooms, setShowRooms ] = useState(true)
  const [ userName, setUserName ] = useState<string>('')

  const sideBarRef = useRef<HTMLDivElement>(null)

  const title = 'ChatConnect'

  useEffect(() => {   
    onAuthStateChanged(auth, (user) => {
      if (user) {

        setUserData(user)
      } else {

        setUserData(null)
      }
    })

    // title styles
    let index = 0    
    const interval = setInterval(() => {
      const allElement = document.querySelectorAll('.title-name') as NodeListOf<HTMLSpanElement>
      allElement.forEach(element => {
        element.style.color = '#fff'    
      })
      const charElement = document.querySelector(`.char-${index}`) as HTMLSpanElement
      charElement.style.color = '#16a34a'     
      index = index === title.length - 1 ? 0 : index + 1
      
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (sideBarRef.current === null) return
    if (showRooms) {
      sideBarRef.current.style.transform = 'translateX(0%)'
    } else {
      sideBarRef.current.style.transform = 'translateX(-100%)'
    }
  }, [showRooms])

  useEffect(() => {
    if (joinedRoomId === null) {      
      // not logged in, will auto join public at first
      if (!auth?.currentUser?.uid) {
        setJoinedRoomId(DEFAULT_ROOM)
      } else {
        // logged in, will check if banned, if not will join public
        const publicRoomRef = doc(db, 'rooms', DEFAULT_ROOM)
        getDoc(publicRoomRef)
          .then(doc => {
            if (doc.exists()) {
              const roomData = doc.data()
              const isBanned = roomData.banned.some((user: string) => user === auth?.currentUser?.uid)
              if (!isBanned) {
                setJoinedRoomId(DEFAULT_ROOM)
              }
            }
          })
          .catch(err => {
            throw new Error(err)
          })
      }
    }
  }, [joinedRoomId])

  return (
    <>
      <User 
        userData={userData} 
        setUserData={setUserData} 
        setJoinedRoomId={setJoinedRoomId} 
        userName={userName} 
        setUserName={setUserName}
      />
      <div className='absolute bg-mySecondary h-full top-0 left-0 pt-12 px-4 transition-all duration-200 z-[3] min-w-[200px]'
        ref={sideBarRef}
      >
        <button className='absolute right-2 top-2 text-3xl text-red-600 hover:text-red-400 hover:scale-110 active:scale-100 transition-all duration-200'
          onClick={() => setShowRooms(false)}
        >
          <IoMdCloseCircle />
        </button>
        {auth?.currentUser && <Create userName={userName} />}       
        <Rooms setJoinedRoomId={setJoinedRoomId} setShowRooms={setShowRooms} />
      </div>

      <header className='text-center font-bold text-3xl relative mt-4'>        
        <span>
          {title.split('').map((char,index) => {
            return (
              <span key={index} className={`title-name char-${index} transition-all duration-300 ease-in-out`}>
                {char}
              </span>
            )
          })}
        </span>
        <span className='absolute translate-y-[-10%] ms-1 hover:scale-110 transition-all duration-100'>
          <TbMessage className="inline hover:fill-green-600 transition-all duration-200"/>
        </span>
        </header>

      { joinedRoomId && 
        <JoinedRoom 
          joinedRoomId={joinedRoomId} 
          setJoinedRoomId={setJoinedRoomId} 
          user={userData}
          userName={userName}
      />}
      <button className='absolute z-[2] text-2xl top-2 left-2'
        onClick={() => setShowRooms(true)}
      >
        <GiHamburgerMenu />
      </button>
    </>
  )
}

export default App
