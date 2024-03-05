import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const CartData = () => {
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userid');
        if (!userId) {
            console.error('User ID not found in localStorage');
            return;
        }

        let isMounted = true;

        axios.get('http://localhost:3001/cart', {
            params: {
                user_id: parseInt(userId)
            }
        })
        .then(response => {
            if (isMounted) {
                setCartData(response.data);
            }
        })
        .catch(error => {
            console.error('Error fetching cart data:', error);
        })
        .finally(() => {
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const calculateTotalPrice = () => {
        let totalPrice = 0;
        cartData.forEach(cart => {
            totalPrice += cart.product_price * cart.quantity;
        });
        return totalPrice.toFixed(2);
    };

    const removeCartItem = async (cart_id) => {
        try {
            await axios.delete(`http://localhost:3001/cart/${cart_id}`, { timeout: 5000 });
            setCartData(prevCartData => prevCartData.filter(item => item.cart_id !== cart_id));
        } catch (error) {
            if (error.response) {
                console.error('Server error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('No response from server:', error.request);
            } else {
                console.error('Error during request setup:', error.message);
            }
        }
    };

    return (
        <>
            <div className="wrapper-container light">
                <div className="container-content">
                    <h2>Your Shopping Cart</h2>
                    {loading ? (
                        <p>Loading cart data...</p>
                    ) : (
                        <>
                            <div className="content-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartData.length > 0 ? (
                                            cartData.map((cart) => (
                                                <tr key={cart.cart_id}>
                                                    <td>{cart.product_name}</td>
                                                    <td>{cart.quantity}</td>
                                                    <td>${cart.product_price}</td>
                                                    <td><button onClick={() => removeCartItem(cart.cart_id)}>Remove</button></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                {/* <td colSpan="4">Cart is empty</td> */}
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2">Total:</td>
                                            <td>${calculateTotalPrice()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="double">
                                <Link to={"/checkout"}><button>Proceed to Checkout</button></Link>
                                <Link to={"/shop"}>Continue Shopping</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartData;
