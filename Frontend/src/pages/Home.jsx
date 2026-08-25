import React from 'react'
import Hero from "../Components/Hero.jsx"
import Biography from "../Components/Biography.jsx"
import Departments from "../Components/Departments.jsx"
import MessageForm from "../Components/MessageForm.jsx"

const Home = () => {
  return (
    <div>
      
      <Hero 
        title={
          "welcome to ZeeCare Medical Institute | Your Trusted Healthcare provider"
        }
        imageUrl={"/hero.png"}
      ></Hero>
      <Biography imageUrl={"/about.png"}></Biography>
      <Departments></Departments>
      <MessageForm></MessageForm> 
    </div>
  )
}

export default Home
