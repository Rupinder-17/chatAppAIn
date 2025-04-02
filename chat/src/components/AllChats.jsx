import React from 'react'
import { useNavigate } from 'react-router-dom';

export const AllChats = () => {
    const navigate = useNavigate();
  return (
    <div>
        <button onClick={navigate('/allchats')}>Allchat</button>
    </div>
  )
}
