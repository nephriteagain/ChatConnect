// REACT
import { Dispatch, SetStateAction, useState, useEffect } from 'react'

// FIREBASE
import { signInWithPopup, signOut } from 'firebase/auth'
import { setDoc, getDoc, doc } from 'firebase/firestore'
import { AnimatePresence } from 'framer-motion'

// DB FILES
import { auth, provider, db } from '../db/firebase'
import UserModal from './UserModal'

import { MdOutlineEdit} from 'react-icons/md'

// TYPES
import type { userDataType } from '../App'


interface UserProps {
  userData: userDataType
  setUserData: Dispatch<SetStateAction<userDataType>>
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
  userName: string
  setUserName: Dispatch<SetStateAction<string>>

}

export default function User({
  userData, 
  setUserData, 
  setJoinedRoomId, 
  userName, 
  setUserName,


}: UserProps) {

  const [showModal, setShowModal ] = useState<boolean>(false)
  // const [ newUser, setNewUser ] = useState<boolean>(false)
  const [ signedIn, setSignedIn ] = useState<boolean>(false)


  async function getUserData() {
    if (!userData) return
    const userRef = doc(db, 'users', userData.uid)
    try {
      const doc = await getDoc(userRef)
      if (doc.exists()) {
        setUserName(doc.data().userName)

      }
    } catch (error) {
      console.error(error)
    }
   
  }


  async function signInWithGoogle() {
    try {
      const data = await signInWithPopup(auth, provider);
      const userObject = data.user;
      const uid = userObject.uid;
      const userDbRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDbRef);
  
      if (!userDoc.exists()) {
        await setDoc(userDbRef, {
          name: userObject.displayName,
          email: userObject.email,
          userName: userObject.email,
          id: uid,
          joinedAt: Date.now(),
          censoredWords: [],
        });
      }
  
      setSignedIn(true);
    } catch (err) {
      console.error(err);
    }
  }
  

async function userSignOut() {
  try {
    await signOut(auth)
    setUserData(null)
    setUserName('')
    setJoinedRoomId(null)
  } catch (error) {
    console.error(error)
  }

}

  useEffect(() => {
    getUserData()
  }, [signedIn])


  const login = userData
    ? <button onClick={userSignOut}
    className='bg-myText text-myBackground px-2 py-[0.4rem] shadow-sm drop-shadow-md rounded-sm hover:shadow-md active:scale-[0.95] transition-all duration-100'
    >
    Sign out
  </button>
  : <button onClick={signInWithGoogle} 
  className='bg-myText text-myBackground shadow-sm drop-shadow-md rounded-sm hover:shadow-md active:scale-[0.95] transition-all duration-100'
>
    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/G-on-clear.svg' alt='google-logo' className='inline'/>
    <span className='me-2'>
      Sign in with Google
    </span>
</button>

  return (
    <>
    <AnimatePresence>
      {showModal && 
      <UserModal 
        userName={userName}
        setUserName={setUserName}
        setShowModal={setShowModal}
        userData={userData}
      />}
    </AnimatePresence>
    
    <div className='flex mt-2 mx-2'>           
      <div className='ms-auto flex items-center justify-center'>      
      
      <div className='me-2 flex flex-row items-center gap-2 px-2 py-[0.4rem]'>
        <p className='text-xl'>
          {userName}
        </p>
        { userData && <button className='h-[2.3rem] aspect-square flex items-center justify-center bg-myAccent text-mySecondary px-1 py-1 rounded-md hover:scale-105 active:scale-100 transition-all duration-100'
          onClick={() => setShowModal(true)}
        >
          <MdOutlineEdit />
        </button>}
        
      </div>
      {login}      
      </div>
      
    </div>
    </>
  )
}
