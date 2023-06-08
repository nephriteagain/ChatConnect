import { useEffect, useState, useRef } from 'react'
import { auth, } from './db/firebase'
import { onAuthStateChanged, } from 'firebase/auth'

import User from './components/User'
import Create from './components/Create'
import Rooms from './components/Rooms'
import JoinedRoom from './components/JoinedRoom'

import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdCloseCircle} from 'react-icons/io'

import './App.css'

// TODO : figure app what to place here
export type userDataType = any 

function App() {
  

  const [userData, setUserData] = useState<userDataType>(null)
  const [joinedRoomId, setJoinedRoomId] = useState<string|null>(null)
  const [ showRooms, setShowRooms ] = useState(true)

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

  return (
    <>
      <User userData={userData} setUserData={setUserData}/>
      <div className='absolute bg-mySecondary h-full top-0 left-0 pt-12 px-4 transition-all duration-200 z-[3]'
        ref={sideBarRef}
      >
        <button className='absolute right-2 top-2 text-3xl text-red-600'
          onClick={() => setShowRooms(false)}
        >
          <IoMdCloseCircle/>
        </button>
        {auth.currentUser && <Create/>}
        <Rooms setJoinedRoomId={setJoinedRoomId}/>
      </div>
      { joinedRoomId && <JoinedRoom joinedRoomId={joinedRoomId} user={userData}/>}
      <button className='absolute z-[2] text-2xl top-2 left-2'
        onClick={() => setShowRooms(true)}
      >
        <GiHamburgerMenu />
      </button>
    </>
  )
}

export default App
