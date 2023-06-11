import { Dispatch, SetStateAction } from 'react'

interface RoomButtonProps {
  isBanned: boolean
  isPending: boolean|""|undefined
  isPrivateCanEnter: boolean|""|undefined
  isPublic: boolean
  canJoin: boolean|""|undefined
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
  roomId: string
  setShowRooms: Dispatch<SetStateAction<boolean>>
  requestJoinRoom: (id: string) => void
}

export default function RoomButton({
  isBanned,
  isPending, 
  isPrivateCanEnter, 
  isPublic, 
  canJoin, 
  setJoinedRoomId, 
  roomId,
  setShowRooms,
  requestJoinRoom
} : RoomButtonProps ) {

  if (isPublic) {
    return (
      <button onClick={() => {
        setJoinedRoomId(roomId)
        setShowRooms(false)
      }}
        className="bg-mySecondary px-2 py-1 rounded-md"
      >
        Enter
      </button>
    )
  }

  if (canJoin) {
    return (
      <button onClick={() => requestJoinRoom(roomId)}
              className="bg-myBackground px-2 py-1 rounded-md"
            >
              Join
            </button>
    )
  }

  if (isPending) {
    return (
      <button disabled
        className="bg-myBackground px-2 py-1 rounded-md disabled:opacity-70"
      >
        Pending
      </button>
    )
  }

  if (isPrivateCanEnter) {
    return (
      <button onClick={() => {
        setJoinedRoomId(roomId)
        setShowRooms(false)
      }}
      className="bg-mySecondary px-2 py-1 rounded-md"
      >
      Enter
    </button>
    )
  }

  if (isBanned) {
    return (
      <button disabled
        className="bg-myBackground px-2 py-1 rounded-md disabled:opacity-70"
      >
        Banned
      </button>
    )
  }

  // for typescript error, will never render
  return (
    <span></span>
  )
}
