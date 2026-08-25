import React from 'react'

const Biography = ({imageUrl}) => {
  return (
    <div className="biography container">
      <div className="banner">
        <img src={imageUrl} alt="aboutImg" />
      </div>
      <div className="banner">
        <p>Biography</p>
        <h3>who we are</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea quidem adipisci accusantium, doloremque quae iure accusamus voluptatem nostrum facilis, debitis asperiores modi nesciunt illo eveniet assumenda sint rem. In nam reprehenderit rerum possimus sequi deserunt dolores minima officiis nihil eaque aperiam qui repudiandae a dignissimos suscipit nulla voluptas, ducimus dolorem.
        </p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus, magni optio blanditiis facilis fugit praesentium.</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, amet!</p>
        <p>Lorem ipsum dolor sit amet.</p>
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corrupti.</p>
      </div>
    </div>
  )
}

export default Biography

