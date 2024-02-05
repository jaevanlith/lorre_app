import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch } from 'react-router-dom';
import AdminRoute from './routes/AdminRoute';
import UserRoute from './routes/UserRoute';
import HomeRoute from './routes/HomeRoute';
import './index.css';
import Login from './Home/Login';
import Register from './Home/Register';
import AccountDetails from './User/AccountDetails';
import reportWebVitals from './reportWebVitals';
import Catalog from './Admin/Catalog';
import NewPassForm from './Admin/NewPassForm';
import Overview from './User/Overview';
import UserDetails from './Admin/UserDetails';
import CheckInHistory from './User/CheckInHistory';
import ResetPassword from './Home/ResetPassword';
import BuyPassForm from './User/BuyPass';
import CheckOut from './User/CheckOut';
import PaymentSuccess from './User/paymentResults/PaymentSuccess';
import PaymentFailed from './User/paymentResults/PaymentFailed';
import PaymentCancelled from './User/paymentResults/PaymentCancelled';
import PaymentPending from './User/paymentResults/PaymentPending';
import PaymentError from './User/paymentResults/PaymentError';
import NewPassword from './Home/NewPassword';
import EditPassword from './User/EditPassword';
import Tools from './Admin/Tools';
import CheckIn from './Admin/CheckIn';
import NewUserForm from './Admin/NewUserForm';
import Analytics from './Admin/Analytics';

/** Links to all screens */
ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <HomeRoute exact path="/" component={Login} />
      <HomeRoute path="/Login" component={Login} />
      <HomeRoute path="/Register" component={Register} />
      <HomeRoute path="/ResetPassword" component={ResetPassword} />
      <HomeRoute path="/NewPassword" component={NewPassword} />
      <UserRoute path="/User/AccountDetails" component={AccountDetails} />
      <UserRoute path="/User/Overview" component={Overview} />
      <UserRoute path="/User/EditPassword" component={EditPassword} />
      <UserRoute path="/User/History" component={CheckInHistory} />
      <UserRoute path="/User/BuyPass" component={BuyPassForm} />
      <UserRoute path="/User/CheckOut" component={CheckOut} />
      <UserRoute path="/PaymentResult/Success" component={PaymentSuccess} />
      <UserRoute path="/PaymentResult/Failed" component={PaymentFailed} />
      <UserRoute path="/PaymentResult/Cancelled" component={PaymentCancelled} />
      <UserRoute path="/PaymentResult/Pending" component={PaymentPending} />
      <UserRoute path="/PaymentResult/Error" component={PaymentError} />
      <AdminRoute path="/Admin/Catalog" component={Catalog} />
      <AdminRoute path="/Admin/NewPassForm" component={NewPassForm} />
      <AdminRoute path="/Admin/NewUserForm" component={NewUserForm} />
      <AdminRoute path="/Admin/UserDetails" component={UserDetails} />
      <AdminRoute path="/Admin/Tools" component={Tools} />
      <AdminRoute path="/Admin/CheckIn" component={CheckIn} />
      <AdminRoute path="/Admin/Analytics" component={Analytics} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
