import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaMale, FaFemale, FaUserClock } from 'react-icons/fa';
import { Typography } from '@material-ui/core';
import Sidebar from '../../Components/user_sidebar';
import Header from '../../Components/navbar'; 
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

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
  margin-top: 70px;
`;

const BoxContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
`;

const ChartsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const ChartSection = styled.div`
  flex: 1;
  min-width: 450px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const StatusSection = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const StatusCard = styled.div`
  flex: 1;
  min-width: 200px;
  background-color: ${(props) => props.color || '#fff'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

const StatusCount = styled.div`
  font-size: 36px;
  font-weight: bold;
  margin: 15px 0;
`;

const StatusTitle = styled.div`
  font-size: 20px;
  text-align: center;
`;

const IconContainer = styled.div`
  margin-bottom: 10px;
`;

const BarChartContainer = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
`;

const PieChartContainer = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
`;

const UserAnalyticsDashboard = () => {
  const [userData, setUserData] = useState({
    totalUsers: 0,
    genderDistribution: { male: 0, female: 0 },
    ageDistribution: {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    },
    userActivity: {
      activeInLastDay: 0,
      activeInLastWeek: 0,
      activeInLastMonth: 0
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/analysis', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Prepare data for the age distribution bar chart
  const ageChartData = Object.entries(userData.ageDistribution).map(([ageGroup, count]) => ({
    ageGroup,
    count
  }));

  // Prepare data for the gender distribution pie chart
  const genderData = [
    { name: 'Male', value: userData.genderDistribution.male },
    { name: 'Female', value: userData.genderDistribution.female }
  ];

  // Prepare data for the login activity bar chart
  const loginActivityData = [
    { period: 'Last 24 Hours', count: userData.userActivity.activeInLastDay },
    { period: 'Last Week', count: userData.userActivity.activeInLastWeek },
    { period: 'Last Month', count: userData.userActivity.activeInLastMonth }
  ];

  // Colors for charts
  const GENDER_COLORS = ['#2196F3', '#E91E63'];
  const AGE_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
  const ACTIVITY_COLORS = ['#FF8A65', '#5C6BC0', '#26A69A'];

  return (
    <DashboardContainer>
      <MainSection>
        <Sidebar /> 
        <MainContent>
          <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
            User Analytics Dashboard
          </Typography>

          {/* Status Section with Total, Male, and Female user counts */}
          <StatusSection>
            <StatusCard color="#673AB7">
              <IconContainer>
                <FaUsers size={40} />
              </IconContainer>
              <StatusTitle>Total Users</StatusTitle>
              <StatusCount>{userData.totalUsers}</StatusCount>
            </StatusCard>
            <StatusCard color="#2196F3">
              <IconContainer>
                <FaMale size={40} />
              </IconContainer>
              <StatusTitle>Male Users</StatusTitle>
              <StatusCount>{userData.genderDistribution.male}</StatusCount>
            </StatusCard>
            <StatusCard color="#E91E63">
              <IconContainer>
                <FaFemale size={40} />
              </IconContainer>
              <StatusTitle>Female Users</StatusTitle>
              <StatusCount>{userData.genderDistribution.female}</StatusCount>
            </StatusCard>
          </StatusSection>

          {/* First row of charts - Age Distribution and Gender Distribution */}
          <ChartsRow>
            {/* Bar Chart - Age Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                User Age Distribution
              </Typography>
              <BarChartContainer>
                <BarChart width={500} height={300} data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Users">
                    {ageChartData.map((entry, index) => (
                      <Cell key={entry.ageGroup} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </BarChartContainer>
            </ChartSection>

            {/* Pie Chart - Gender Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Gender Distribution
              </Typography>
              <PieChartContainer>
                <PieChart width={400} height={300}>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </PieChartContainer>
            </ChartSection>
          </ChartsRow>

          {/* Second row of charts - Login Activity */}
          <ChartsRow>
            {/* Bar Chart - Login Frequency */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                User Login Activity
              </Typography>
              <BarChartContainer>
                <BarChart width={500} height={300} data={loginActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Active Users">
                    {loginActivityData.map((entry, index) => (
                      <Cell key={entry.period} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </BarChartContainer>
            </ChartSection>

            {/* Pie Chart - Login Activity Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                User Activity Distribution
              </Typography>
              <PieChartContainer>
                <PieChart width={400} height={300}>
                  <Pie
                    data={loginActivityData}
                    dataKey="count"
                    nameKey="period"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {loginActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </PieChartContainer>
            </ChartSection>
          </ChartsRow>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default UserAnalyticsDashboard;