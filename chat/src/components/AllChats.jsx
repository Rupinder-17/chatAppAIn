import React from 'react'
import { useNavigate } from 'react-router-dom';

export const AllChats = () => {
    const navigate = useNavigate();
  return (
    <div>
        <button onClick={()=>navigate('/allchats')} className='bg-blue-700 text-white px-3 py-1 rounded-xl hover:bg-black'>Allchat</button>
    </div>
  )
}
