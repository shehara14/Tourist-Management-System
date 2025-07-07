import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, IconButton } from '@material-ui/core';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';
import Modal from 'react-modal';
import Header from '../../Components/guest_header';
import Swal from 'sweetalert2';

const HomePageContainer = styled.div`
  padding: 20px;
  flex-direction: column;
  align-items: center;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const OrderButtonContainer = styled.div`
  position: absolute;
  top: 760px;
  right: 100px;
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
  margin-top:50px;
`;

const Description = styled.p`
  font-size: 18px;
  color: #555;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.5;
`;

const CategoryContainer = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 30px;
  color: #333;
  text-align:center;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
`;

const MenuCard = styled.div`
  background-color: #fff;
  flex-basis: calc(23% - 20px);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`;

const MenuItemImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
  margin-bottom: 15px;
`;

const MenuItemName = styled.h3`
  margin-bottom: 10px;
  font-size: 25px;
  color: #333;
`;

const MenuItemDescription = styled.p`
  font-size: 18px;
  color: #777;
  margin: 2px;
`;

const MenuItemPrice = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-top: 12px;
  margin-bottom: 15px;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuantityButton = styled(IconButton)`
  border-radius: 50%;
  background-color: #d4ac0d;
  color: #333;
  margin: 0 5px;
  width: 32px;
  height: 32px; 
  padding: 0; 

  &:hover {
    background-color: ${(props) => props.hoverColor || '#e0e0e0'};
  }

  .MuiIconButton-label {
    font-size: 16px; 
  }
`;

const QuantityDisplay = styled.div`
  width: 40px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const OrderButton = styled(Button)`
  margin-top: 20px;
  width: 100%;
  background-color: ${(props) => (props.ordered ? '#d4ac0d' : '#4CAF50')};
  color: #fff;
  &:hover {
    background-color: ${(props) => (props.ordered ? '#bfae1d' : '#45a049')};
  }
  margin-left: auto; 
`;

const OrderMainButton = styled(Button)`
margin-top: 60px;
width: 150%;
background-color: ${(props) => (props.ordered ? '#d4ac0d' : '#4CAF50')};
color: #fff;
&:hover {
  background-color: ${(props) => (props.ordered ? '#bfae1d' : '#45a049')};
}
margin-left: auto;
`;

const BackButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 8px;
  margin-top: 20px;
  height:100%;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const PaymentButton = styled(Button)`
  background-color: #007bff;
  color: white;
  margin-top: 20px;
  &:hover {
    background-color: #0056b3;
  }
`;

const PopupContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
`;

const PopupTitle = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const OrderList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const OrderItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #A7C7E7;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
`;

const OrderItemName = styled.span`
  font-size: 21px;
  font-weight: bold;
  color: #333;
  margin-right: 25px;
`;

const OrderItemDetails = styled.span`
  font-size: 16px;
  color: #777;
  margin-left: 20px;
`;

const OrderItemActions = styled.div`
  display: flex;
  align-items: center;
`;

const TotalContainer = styled.div`
  text-align: right;
  font-size: 30px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
`;

const RemoveIconButton = styled(IconButton)`
  background-color: #f44336;
  color: white;
  width: 32px; 
  height: 32px; 
  padding: 0; 
  
  &:hover {
    background-color: #e53935;
  }

  .MuiIconButton-label {
    font-size: 18px; 
  }
`;

const ItemPrice = styled.div`
  font-size: 21px;
  margin-right: 50px;
  margin-left: 25px;
  font-weight: bold;
  color: #333;
`;

// Form styling
const FormField = styled.div`
  margin-bottom: 15px;
  padding-right:25px;
  padding-left:10px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`;

const CloseButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  height: 100%;
  margin-top: 20px;
  &:hover {
    background-color: #e0e0e0;
  }
`
const BackgroundImageContainer = styled.div`
  background-image: url('https://www.cocoroyalbeach.com/images/slider/welcome.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  height: 450px; 
  width: 100%;
`;


const customStyles = {
  content: {
    backgroundImage: 'url(https://hotelchantelle.com/wp-content/uploads/2023/09/2747.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: 'none',
    borderRadius: '10px',
    padding: '20px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

const HomePage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState({});
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderedItems, setOrderedItems] = useState({});
  const [ordersPlaced, setOrdersPlaced] = useState(false);
  const [currentPopup, setCurrentPopup] = useState('payment'); 
  const [previousPopup, setPreviousPopup] = useState(null); 

  // Payment form states
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:3002/menu/get-menu-items'); // Replace with your API endpoint
        const data = await response.json();
        setMenuItems(data);

        const initialQuantities = data.reduce((acc, item) => {
          acc[item.menuItemId] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleQuantityChange = (id, delta) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: Math.max(1, prevQuantities[id] + delta),
    }));
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[item._id]) {
        newCart[item._id].quantity += quantities[item._id];
      } else {
        newCart[item._id] = { ...item, quantity: quantities[item._id] };
      }
      return newCart;
    });
  
    setOrderedItems((prevOrdered) => ({
      ...prevOrdered,
      [item._id]: true,
    }));
  
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item._id]: 1,
    }));
  };
  

  const handleOrder = () => {
    const orderCount = Object.keys(orderedItems).length;
    if (orderCount === 0) { 
      Swal.fire({
        icon: 'error',
        title: 'No Orders Placed',
        text: 'Please add items to your order before proceeding.',
        confirmButtonText: 'OK'
      });
    } else {

      setOrderModalOpen(true);
      setOrdersPlaced(true);
    }

  };

  const handleProceedToPayment = () => {
    setOrderModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const newErrors = {};
  
    if (!cardType) newErrors.cardType = 'Card type is required';
  
    const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
    if (!cleanedCardNumber || !/^\d{16}$/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
  
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }
  
    if (!cvv || !/^\d{3}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    console.log('Payment confirmed with details:', {
      cardType,
      cardNumber: cleanedCardNumber, 
      expiryDate,
      cvv,
    });
    setPaymentModalOpen(false);
  };
  
  const handlePreviousModal = () => {
    setOrderModalOpen(true);
    setPaymentModalOpen(false);
  };

  const handleCloseModal = () => {
    setOrderModalOpen(false);
    setPaymentModalOpen(false);
  };

  const handleBackButton = () => {
    if (previousPopup) {
      setCurrentPopup(previousPopup);
      setPreviousPopup(null); 
    }
  };
  

  return (
    <>
      <Header />
      <HomePageContainer>
      <BackgroundImageContainer />
      <TitleContainer>
        <Title>Our Menu's For You</Title>
        <Description>Discover a delightful array of gourmet dishes and refreshing beverages at Hotel Breet's Garden. Whether you're in the mood for a hearty meal or a light snack, our menu features a diverse selection crafted with the finest ingredients. Enjoy a memorable dining experience in a charming setting, where every meal is a celebration of flavor and hospitality. Explore our menu and let us take care of the rest!</Description>
        <OrderButtonContainer>
        <OrderMainButton variant="contained" onClick={handleOrder}>
          Order Now
        </OrderMainButton>
      </OrderButtonContainer>
      </TitleContainer>
        {Object.keys(groupedItems).map((category) => (
          <CategoryContainer key={category}>
            <CategoryTitle>{category}s</CategoryTitle>
            <MenuContainer>
              {groupedItems[category].map((item) => (
                <MenuCard key={item.menuItemId}>
                  <MenuItemImage src={item.menuImage} alt={item.menuItemName} />
                  <MenuItemName>{item.servingSize} {item.menuItemName}</MenuItemName>
                  <MenuItemDescription>{item.menuItemDescription}</MenuItemDescription>
                  <MenuItemPrice>Rs {item.price}</MenuItemPrice>
                  <QuantityContainer>
                    <QuantityButton onClick={() => handleQuantityChange(item.menuItemId, -1)}>
                      <AiOutlineMinus />
                    </QuantityButton>
                    <QuantityDisplay>{quantities[item.menuItemId]}</QuantityDisplay>
                    <QuantityButton onClick={() => handleQuantityChange(item.menuItemId, 1)}>
                      <AiOutlinePlus />
                    </QuantityButton>
                  </QuantityContainer>
                  <OrderButton
                    variant="contained"
                    ordered={!!orderedItems[item._id]} 
                    onClick={() => handleAddToCart(item)}
                  >
                    {orderedItems[item._id] ? 'Ordered' : 'Order This'}
                  </OrderButton>
                </MenuCard>
              ))}
            </MenuContainer>
          </CategoryContainer>
        ))}
        <Modal isOpen={orderModalOpen} onRequestClose={handleCloseModal} ariaHideApp={false} style={customStyles}>
          <PopupContainer>
            <PopupTitle>Your Order</PopupTitle>
            <OrderList>
              {Object.values(cart).map((item) => (
                <OrderItem key={item.menuItemId}>
                  <OrderItemName>{item.menuItemName}</OrderItemName>
                  <OrderItemDetails>
                    <QuantityContainer>
                      <QuantityButton onClick={() => handleQuantityChange(item.menuItemId, -1)}>
                        <AiOutlineMinus />
                      </QuantityButton>
                      <QuantityDisplay>{quantities[item.menuItemId]}</QuantityDisplay>
                      <QuantityButton onClick={() => handleQuantityChange(item.menuItemId, 1)}>
                        <AiOutlinePlus />
                      </QuantityButton>
                      <ItemPrice>Rs {(item.price * (quantities[item.menuItemId] || 1)).toFixed(2)}</ItemPrice>
                    </QuantityContainer>
                  </OrderItemDetails>
                  <OrderItemActions>
                    <RemoveIconButton onClick={() => setCart((prevCart) => {
                      const newCart = { ...prevCart };
                      delete newCart[item._id];
                      return newCart;
                    })}>
                      <AiOutlineDelete />
                    </RemoveIconButton>
                  </OrderItemActions>
                </OrderItem>
              ))}
            </OrderList>
            <TotalContainer>
              Total: Rs {Object.values(cart).reduce((sum, item) => sum + (quantities[item.menuItemId] || item.quantity) * item.price, 0)}
            </TotalContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <CloseButton onClick={handleCloseModal}>Close</CloseButton>
              <PaymentButton variant="contained" className="secondary" onClick={handleProceedToPayment}>
                Proceed to Payment
              </PaymentButton>
            </div>
          </PopupContainer>
        </Modal>

        <Modal isOpen={paymentModalOpen} onRequestClose={handleCloseModal} ariaHideApp={false} style={customStyles}>
        <PopupContainer>
        <PopupTitle>Payment Information</PopupTitle>
  
        {/* Card Type Section */}
        <FormField>
          <FormLabel>Card Type</FormLabel>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                name="cardType"
                value="Visa"
                checked={cardType === 'Visa'}
                onChange={(e) => {
                  setCardType(e.target.value);
                  setErrors((prevErrors) => ({ ...prevErrors, cardType: '' })); 
                }}
              />
              Visa
            </label>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                name="cardType"
                value="MasterCard"
                checked={cardType === 'MasterCard'}
                onChange={(e) => {
                  setCardType(e.target.value);
                  setErrors((prevErrors) => ({ ...prevErrors, cardType: '' })); 
                }}
              />
              MasterCard
            </label>
            <label>
              <input
                type="radio"
                name="cardType"
                value="American Express"
                checked={cardType === 'American Express'}
                onChange={(e) => {
                  setCardType(e.target.value);
                  setErrors((prevErrors) => ({ ...prevErrors, cardType: '' }));
                }}
              />
              American Express
            </label>
            </div>
            {errors.cardType && <ErrorMessage>{errors.cardType}</ErrorMessage>}
            </FormField>

            {/* Card Number Section */}
            <FormField>
              <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
              <FormInput
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => {
                  const formattedValue = e.target.value
                    .replace(/\D/g, '') 
                    .slice(0, 16) 
                    .replace(/(.{4})/g, '$1 '); 
                  setCardNumber(formattedValue.trim());
                  if (/^\d{16}$/.test(formattedValue.replace(/\s+/g, ''))) {
                    setErrors((prevErrors) => ({ ...prevErrors, cardNumber: '' })); 
                  }
                }}
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && <ErrorMessage>{errors.cardNumber}</ErrorMessage>}
            </FormField>

            {/* Expiry Date Section */}
            <FormField>
              <FormLabel htmlFor="expiryDate">Expiry Date (MM/YY)</FormLabel>
              <FormInput
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '') 
                    .slice(0, 4); // 
                  let formattedValue = value;
                  if (value.length > 2) {
                    formattedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
                  }
                  setExpiryDate(formattedValue);
                  if (/^\d{2}\/\d{2}$/.test(formattedValue)) {
                    setErrors((prevErrors) => ({ ...prevErrors, expiryDate: '' })); 
                  }
                }}
                placeholder="MM/YY"
              />
              {errors.expiryDate && <ErrorMessage>{errors.expiryDate}</ErrorMessage>}
            </FormField>

            {/* CVV Section */}
            <FormField>
              <FormLabel htmlFor="cvv">CVV</FormLabel>
              <FormInput
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 3); 
                  setCvv(value);
                  if (/^\d{3}$/.test(value)) {
                    setErrors((prevErrors) => ({ ...prevErrors, cvv: '' }));
                  }
                }}
                placeholder="3-digit CVV"
                maxLength={3} 
              />
              {errors.cvv && <ErrorMessage>{errors.cvv}</ErrorMessage>}
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <BackButton onClick={handlePreviousModal}>Back</BackButton>
            <PaymentButton
              variant="contained"
              onClick={() => {
                const validationErrors = {};

                if (!cardType.trim()) {
                  validationErrors.cardType = "Card Type is required.";
                }

                if (!cardNumber.trim()) {
                  validationErrors.cardNumber = "Card Number is required.";
                } else if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
                  validationErrors.cardNumber = "Card Number must be in the format XXXX XXXX XXXX XXXX.";
                }

                if (!expiryDate.trim()) {
                  validationErrors.expiryDate = "Expiry Date is required.";
                } else {
                  const [month, year] = expiryDate.split('/');
                  if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
                    validationErrors.expiryDate = "Sorry! Invalid Month is Entered";
                  } else {
                    const expMonth = parseInt(month, 10);
                    const expYear = parseInt(year, 10) + 2000; // Convert YY to YYYY

                    if (expMonth > 12) {
                      validationErrors.expiryDate = "Month must be between 01 and 12.";
                    } else {
                      const today = new Date();
                      const currentMonth = today.getMonth() + 1; // Months are 0-based
                      const currentYear = today.getFullYear();

                      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                        validationErrors.expiryDate = "Sorry! Your Card is expired";
                      }
                    }
                  }
                }

                if (!cvv.trim()) {
                  validationErrors.cvv = "CVV is required.";
                } else if (!/^\d{3}$/.test(cvv)) {
                  validationErrors.cvv = "CVV must be 3 digits.";
                }

                if (Object.keys(validationErrors).length > 0) {
                  setErrors(validationErrors);
                  Swal.fire({
                    title: 'Error!',
                    text: 'Please enter correct payment details',
                    icon: 'error',
                    confirmButtonText: 'OK',
                  });
                } else {
                  handleConfirmPayment();
                  Swal.fire({
                    title: 'Success!',
                    text: 'Your order is successfully confirmed.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                  });
                }
              }}
            >
              Confirm Payment
            </PaymentButton>
          </div>

        </PopupContainer>
      </Modal>
    </HomePageContainer>
    </>
  );
};

export default HomePage;
