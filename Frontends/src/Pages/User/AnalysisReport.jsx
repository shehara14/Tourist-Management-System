import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/user_sidebar';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider
} from '@material-ui/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import letterheadImage from '../../Images/letterhead1.png';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';

const AnalyticsReportPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/analysis', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Prepare data for charts
  const ageChartData = Object.entries(analyticsData.ageDistribution).map(([ageGroup, count]) => ({
    ageGroup,
    count
  }));

  const genderData = [
    { name: 'Male', value: analyticsData.genderDistribution.male },
    { name: 'Female', value: analyticsData.genderDistribution.female }
  ];

  const activityData = [
    { period: 'Last 24 Hours', count: analyticsData.userActivity.activeInLastDay },
    { period: 'Last Week', count: analyticsData.userActivity.activeInLastWeek },
    { period: 'Last Month', count: analyticsData.userActivity.activeInLastMonth }
  ];

  // Colors for charts
  const GENDER_COLORS = ['#2196F3', '#E91E63'];
  const AGE_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
  const ACTIVITY_COLORS = ['#FF8A65', '#5C6BC0', '#26A69A'];

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    // Hide the buttons before capturing
    const downloadButtons = document.getElementById('download-buttons');
    if (downloadButtons) {
      downloadButtons.style.display = 'none';
    }
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      });
      
      // Restore the buttons
      if (downloadButtons) {
        downloadButtons.style.display = 'flex';
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      // PDF dimensions (A4 size in mm)
      const imgWidth = 210;   // A4 width
      const pageHeight = 350; // Increased height
      
      // Calculate content dimensions with minimal margins
      const margin = 0; // Reduced from 10mm to 5mm
      const contentWidth = imgWidth - (margin * 2);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, pageHeight],
        compress: true
      });
      
      // Get current date and time
      const now = new Date();
      const generatedAt = `Generated at ${now.toLocaleString()}`;
      
      // Add main content with tighter margins
      doc.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
      
      // Add footer closer to bottom
      doc.setFontSize(8); // Smaller font
      doc.setTextColor(80);
      doc.text(
        generatedAt,
        imgWidth / 2,
        pageHeight - 5, // 5mm from bottom (reduced from 10mm)
        { align: 'center' }
      );
      
      // Multi-page handling with tight margins
      let heightLeft = imgHeight + margin; // Include initial margin
      let position = margin;
      
      while (heightLeft > (pageHeight - margin)) {
        doc.addPage([imgWidth, pageHeight], 'portrait');
        position -= (pageHeight - margin);
        doc.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        
        // Add footer to each page
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(
          generatedAt,
          imgWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
        
        heightLeft -= (pageHeight - margin);
      }
      
      doc.save('analytics_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      if (downloadButtons) {
        downloadButtons.style.display = 'flex';
      }
    }
};

  const handleDownloadExcel = () => {
    try {
      // Prepare the data for Excel
      const genderExcelData = [
        { Category: 'Male Users', Count: analyticsData.genderDistribution.male },
        { Category: 'Female Users', Count: analyticsData.genderDistribution.female }
      ];
      
      const ageExcelData = Object.entries(analyticsData.ageDistribution).map(([ageGroup, count]) => ({
        'Age Group': ageGroup,
        'Count': count
      }));
      
      const activityExcelData = [
        { 'Activity Period': 'Last 24 Hours', 'Active Users': analyticsData.userActivity.activeInLastDay },
        { 'Activity Period': 'Last Week', 'Active Users': analyticsData.userActivity.activeInLastWeek },
        { 'Activity Period': 'Last Month', 'Active Users': analyticsData.userActivity.activeInLastMonth }
      ];
      
      const summaryData = [
        { 'Metric': 'Total Users', 'Value': analyticsData.totalUsers },
        { 'Metric': 'Male Users', 'Value': analyticsData.genderDistribution.male },
        { 'Metric': 'Female Users', 'Value': analyticsData.genderDistribution.female },
        { 'Metric': 'Active in Last 24 Hours', 'Value': analyticsData.userActivity.activeInLastDay },
        { 'Metric': 'Active in Last Week', 'Value': analyticsData.userActivity.activeInLastWeek },
        { 'Metric': 'Active in Last Month', 'Value': analyticsData.userActivity.activeInLastMonth }
      ];
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to worksheets
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      const genderWorksheet = XLSX.utils.json_to_sheet(genderExcelData);
      const ageWorksheet = XLSX.utils.json_to_sheet(ageExcelData);
      const activityWorksheet = XLSX.utils.json_to_sheet(activityExcelData);
      
      // Add worksheets to the workbook
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, genderWorksheet, 'Gender Distribution');
      XLSX.utils.book_append_sheet(workbook, ageWorksheet, 'Age Distribution');
      XLSX.utils.book_append_sheet(workbook, activityWorksheet, 'User Activity');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'analytics_report.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  // Function to format date for the report
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <Box>
      <Box display="flex">
        <Sidebar />
        <Box 
          ref={reportRef}
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          p={2} 
          style={{ 
            flex: 1, 
            minHeight: '100vh', 
            backgroundColor: 'white', 
            borderRadius: 8, 
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', 
            margin: '15px', 
            position: 'relative',
            marginTop: '15px', 
            marginBottom: '15px',
          }} 
          id="printable-section"
        >
          {/* Letterhead image */}
          <img 
            src={letterheadImage} 
            alt="Letterhead" 
            style={{ 
              width: '100%', 
              marginBottom: '5px', 
              boxSizing: 'border-box',
            }} 
          />
          
          {/* Summary Stats */}
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                style={{ 
                  padding: '15px', 
                  backgroundColor: '#673AB7', 
                  color: 'white',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h3" style={{ margin: '15px 0', fontWeight: 'bold' }}>
                  {analyticsData.totalUsers}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                style={{ 
                  padding: '15px', 
                  backgroundColor: '#2196F3', 
                  color: 'white',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6">Male Users</Typography>
                <Typography variant="h3" style={{ margin: '15px 0', fontWeight: 'bold' }}>
                  {analyticsData.genderDistribution.male}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                style={{ 
                  padding: '15px', 
                  backgroundColor: '#E91E63', 
                  color: 'white',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6">Female Users</Typography>
                <Typography variant="h3" style={{ margin: '15px 0', fontWeight: 'bold' }}>
                  {analyticsData.genderDistribution.female}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Gender and Age Distribution Charts in one line */}
          <Grid container spacing={3} style={{ marginBottom: '20px', marginTop:'20px' }}>
            {/* Gender Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', height: '95%' }}>
                <Typography variant="h6" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                  Gender Distribution
                </Typography>
                <Box display="flex" justifyContent="center" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Age Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', height: '95%' }}>
                <Typography variant="h6" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                  Age Distribution
                </Typography>
                <Box display="flex" justifyContent="center" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageChartData}>
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
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* User Activity Chart */}
          <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="h6" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              User Activity
            </Typography>
            <Box display="flex" justifyContent="center" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Active Users">
                    {activityData.map((entry, index) => (
                      <Cell key={entry.period} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          {/* Additional Analysis */}
          <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Key Insights
            </Typography>
            <Divider style={{ marginBottom: '15px' }} />
            
            <Typography variant="subtitle1" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              Gender Balance:
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px' }}>
              {analyticsData.genderDistribution.male > analyticsData.genderDistribution.female ? 
                `The platform has ${analyticsData.genderDistribution.male - analyticsData.genderDistribution.female} more male users than female users.` : 
                analyticsData.genderDistribution.female > analyticsData.genderDistribution.male ?
                `The platform has ${analyticsData.genderDistribution.female - analyticsData.genderDistribution.male} more female users than male users.` :
                'The platform has an equal number of male and female users.'}
            </Typography>
            
            <Typography variant="subtitle1" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              Age Demographics:
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px' }}>
              {(() => {
                const maxAgeGroup = Object.entries(analyticsData.ageDistribution).reduce(
                  (max, [group, count]) => count > max.count ? {group, count} : max, 
                  {group: '', count: 0}
                );
                return `The largest age group on the platform is ${maxAgeGroup.group} with ${maxAgeGroup.count} users.`;
              })()}
            </Typography>
            
            <Typography variant="subtitle1" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              User Engagement:
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px' }}>
              {`${analyticsData.userActivity.activeInLastDay} users (${
                Math.round((analyticsData.userActivity.activeInLastDay / analyticsData.totalUsers) * 100)
              }%) were active in the last 24 hours. ${
                Math.round((analyticsData.userActivity.activeInLastWeek / analyticsData.totalUsers) * 100)
              }% of users have been active in the past week.`}
            </Typography>
          </Paper>
          
          {/* Download buttons */}
          <Box mt={4} display="flex" justifyContent="left" gap={2} id="download-buttons">
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            <Button 
              variant="contained" 
              style={{ backgroundColor: '#d4ac0d', color: 'white', marginLeft: '15px' }}
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsReportPage;