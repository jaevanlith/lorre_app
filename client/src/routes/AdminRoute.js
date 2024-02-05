import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const AdminRoute = ({ ...props }) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (token && userId && role) {
    if (role === 'admin') {
      return <Route {...props} />;
    } else {
      return <Redirect to="/User/Overview" />;
    }
  } else {
    return <Redirect to="/Login" />;
  }
};

export default AdminRoute;
