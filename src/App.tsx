import { useEffect, useState } from 'react'
import { auth, } from './db/firebase'
import { onAuthStateChanged, } from 'firebase/auth'

import User from './components/User'
import Create from './components/Create'
import Rooms from './components/Rooms'
import JoinedRoom from './components/JoinedRoom'

import './App.css'

// TODO : figure app what to place here
export type userDataType = any 

function App() {
  

  const [userData, setUserData] = useState<userDataType>(null)
  const [joinedRoomId, setJoinedRoomId] = useState<string|null>(null)

  
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


  return (
    <>
      <User userData={userData} setUserData={setUserData}/>
      {auth.currentUser && <Create />}
      <Rooms setJoinedRoomId={setJoinedRoomId}/>
      {userData && <JoinedRoom joinedRoomId={joinedRoomId} userId={userData.uid}/>}
    </>
  )
}

export default App
