import { useEffect, useState, useRef } from 'react'
import { auth, db} from './db/firebase'
import { onAuthStateChanged, } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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
  //TODO ADMIN Modal:DONE
  //TODO passing admin status to mods:DONE

  const [userData, setUserData] = useState<userDataType>(null)
  const [joinedRoomId, setJoinedRoomId] = useState<string|null>(null)
  const [ showRooms, setShowRooms ] = useState(true)
  const [ userName, setUserName ] = useState<string>('')

  const sideBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {   
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('user signed in', user)
        setUserData(user)
      } else {
        console.log('user signed out')
        setUserData(null)
      }
    })
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
      <div className='absolute bg-mySecondary h-full top-0 left-0 pt-12 px-4 transition-all duration-200 z-[3]'
        ref={sideBarRef}
      >
        <button className='absolute right-2 top-2 text-3xl text-red-600'
          onClick={() => setShowRooms(false)}
        >
          <IoMdCloseCircle/>
        </button>
        {auth.currentUser && <Create userName={userName} />}       
        <Rooms setJoinedRoomId={setJoinedRoomId} setShowRooms={setShowRooms} />
      </div>

      <header className='text-center font-bold text-3xl relative mt-4'>        
        <span>
          ChatConnect
        </span>
        <span className='absolute translate-y-[-10%] ms-1 hover:scale-110 transition-all duration-100'>
          <TbMessage className="inline hover:fill-green-600 transition-all duration-200"/>
        </span>
        </header>

      { joinedRoomId && <JoinedRoom joinedRoomId={joinedRoomId} setJoinedRoomId={setJoinedRoomId} user={userData}/>}
      <button className='absolute z-[2] text-2xl top-2 left-2'
        onClick={() => setShowRooms(true)}
      >
        <GiHamburgerMenu />
      </button>
    </>
  )
}

export default App
