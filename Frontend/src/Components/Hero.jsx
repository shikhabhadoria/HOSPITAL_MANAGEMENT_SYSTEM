import React from 'react'

const Hero = ({title, imageUrl}) => {
  return (
    <div className="hero container">
        <div className="banner">
            <h1>{title}</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores repudiandae veritatis amet! Sapiente quod nisi, tenetur, delectus dolorum iure, exercitationem reiciendis soluta error animi blanditiis eaque vitae possimus recusandae voluptatum!
            </p>
        </div>

        <div className="banner">
            <img src={imageUrl} alt="hero" className="animated-image"></img>
            <span>
                <img src="/Vector.png" alt="vector  "></img>
            </span>
        </div>
    </div>
  )
}

export default Hero
