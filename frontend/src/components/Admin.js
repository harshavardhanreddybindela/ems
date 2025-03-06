import React from 'react'
import AddEvent from './AddEvent'
import Navbar from './Navbar'
import UpdateEvent from './UpdateEvent'

function Admin() {
  return (
    <div>Admin
    <Navbar/>
    <AddEvent/>
    <UpdateEvent/>
    </div>
  )
}

export default Admin