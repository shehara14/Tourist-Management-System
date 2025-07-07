import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import PackagePage from "./Pages/Packages/PackagePage";
import AddTourPackage from "./Pages/Packages/AddPackage";
import ViewPackages from "./Pages/Packages/ViewPackages";
import UpdateTourPackage from "./Pages/Packages/UpdatePackage";
import PackageReportPage from "./Pages/Packages/PackageReport";
import Header from "./Components/guest_header";
import Footer from "./Components/footer";
import Login from "./Pages/User/Login";
import TransportHome from "./Pages/Home/Home";
import ForgotPassword from './Pages/User/ForgotPassword';
import ResetPassword from './Pages/User/ResetPassword';
import ViewUsers from './Pages/User/ViewUser';
import AddUser from './Pages/User/AddUser';
import UserReportPage from './Pages/User/UserReport';
import UserRegistration from "./Pages/User/Register";
import EditProfile from "./Pages/User/EditProfile";
import MainDashboard from "./Pages/Admin/main_dashboard";
import AllPackages from "./Pages/Packages/AllPackages";
import UserAnalyticsDashboard from "./Pages/User/UserAnalyticsDashboard";
import AnalyticsReportPage from "./Pages/User/AnalysisReport";
import DefaultPackage from './Pages/DefaultPackage/DefaultPackage';
import DefaultPackageDetails from './Pages/DefaultPackage/DefaultPackageDetails';
import BookingDashboard from './Pages/Dashboard/Dashboard';
import Driver from './Pages/Driver/Driver';
import Vehicle from './Pages/Vehicle/Vehicle';
import AssignmentComponent from './Pages/Assign/AssignmentComponent';
import PaymentDashboard from './Pages/Payment/Dashboard'
import Payment from './Pages/Payment/Payment';
import PaymentDetails from './Pages/Payment/PaymentDetails';

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<TransportHome />} />
        <Route path="/login" element={< Login/>} />
        <Route path="/packages" element={<PackagePage />} />
        <Route path="/add-package" element={<AddTourPackage />} />
        <Route path="/view-packages" element={<ViewPackages />} />
        <Route path="/update-package/:id" element={<UpdateTourPackage />} />
        <Route path="/package-report" element={<PackageReportPage />} />
        <Route path="/all-packages" element={< AllPackages/>} />

        <Route path="/register" element={<UserRegistration/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/view-user" element={<ViewUsers/>} />
        <Route path="/edit-profile" element={<EditProfile/>} />
        <Route path="/users" element={<ViewUsers/>} />
        <Route path="/add-user" element={<AddUser/>} />
        <Route path="/user-report" element={<UserReportPage/>} />
        <Route path="/user-analytics" element={<UserAnalyticsDashboard/>} />
        <Route path="/user-analytics-report" element={<AnalyticsReportPage/>} />

        <Route path="/dashboard" element={< MainDashboard/>} />


        <Route path="/default-package" element={<DefaultPackage />} />
        <Route path="/bookingdetails" element={<DefaultPackageDetails/>} />
        <Route path="/update/:id" element={<DefaultPackageDetails />} />
        <Route path="/booking-dashboard" element={<BookingDashboard />} />
        <Route path="/driver-dashboard" element={<Driver />} />
        <Route path="/owner-dashboard" element={<Vehicle />} />
        <Route path="/vehicle/add" element={<Vehicle />} />
        <Route path="/assign" element={<AssignmentComponent />} />
        <Route path="/payment-dashboard" element={<PaymentDashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-details" element={<PaymentDetails />} />
        
      </Routes>
      <Footer />
    </>
  );
};

export default App;
