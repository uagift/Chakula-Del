import React, { useContext, useState } from 'react'
import './FoodItem.css'
import { assets } from '../../../assets/assets'

const FoodItem = ({ id,name,price,description,image}) => {

  const [itemCount, setItemCount] = useState(0)
  const {cartItems,addToCart,removeFromCart} = useContext(storeContext);
  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        <img src={image} alt="Item_Image" className="food-item-image" />
       {!cartItems[id]? (
        <img 
        className='add'
        onClick={()=> addToCart(id)}
        src={assets.add_icon_white}
        alt='Add Icon'
        />
       ):(
        <div className='food-item-counter'>
          <img onClick={()=>{removeFromCart(id)}} src={assets.remove_icon_red} alt="Remove icon" />
          <p>{cartItems[id]}</p>
          <img onClick={()=>{addToCart(id)}} src={assets.add_icon_green} alt="Continue Add icon" />
          </div>
       )}
      </div>
      <div className="foot-item-info">
        <div className="food-item-name-rating">
            <p>{name}</p>
            <img src= {assets.rating_starts} alt="Rating Starts" />
      </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  )
}

export default FoodItem
