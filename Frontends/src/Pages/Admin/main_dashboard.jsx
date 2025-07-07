import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import Header from '../../Components/navbar';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-top: 40px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: #FFFFF0;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  height: 500px; /* Increased height to accommodate illustrations */
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }
`;

const IllustrationContainer = styled.div`
  margin-bottom: 15px;
  width: 200px; /* Adjust size as needed */
  height: 450px; /* Adjust size as needed */
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 120%;
    height: 120%;
    object-fit: contain;
  }
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
`;

const MainDashboard = () => {
  const navigate = useNavigate();

  // Card data with external image URLs
  const cards = [
    {
      title: 'User Management',
      illustration: 'https://img.freepik.com/free-photo/portrait-senior-man-with-camera-device-world-photography-day-celebration_23-2151657220.jpg?uid=R70363395&semt=ais_hybrid&w=740', // Replace with your image URL
      path: '/users',
    },
    {
      title: 'Package Management',
      illustration: 'https://img.freepik.com/free-photo/exotic-island-landscape_23-2150724887.jpg?uid=R70363395&semt=ais_hybrid&w=740', // Replace with your image URL
      path: '/view-packages',
    },
    {
      title: 'Booking Management',
      illustration: 'https://plus.unsplash.com/premium_photo-1698183570547-83b0aa436b75?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Ym9va2luZyUyMHZlaGljbGV8ZW58MHwxfDB8fHww', // Replace with your image URL
      path: '/booking-dashboard',
    },
    {
      title: 'Payment Management',
      illustration: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8b25saW5lJTIwcGF5bWVudHxlbnwwfDF8MHx8fDA%3D', // Replace with your image URL
      path: '/payment-details',
    },
  ];

  return (
    <DashboardContainer>
      <MainSection>
        <MainContent>
          <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: '#0000FF', textAlign: 'center' }}>
            Main Dashboard
          </Typography>
          {/* Card Views for Navigation */}
          <CardContainer>
            {cards.map((card, index) => (
              <Card key={index} onClick={() => navigate(card.path)}>
                <IllustrationContainer>
                  <img src={card.illustration} alt={card.title} />
                </IllustrationContainer>
                <CardTitle>{card.title}</CardTitle>
              </Card>
            ))}
          </CardContainer>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default MainDashboard;