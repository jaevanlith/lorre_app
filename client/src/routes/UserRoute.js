import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const UserRoute = ({ ...props }) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (token && userId && role) {
    if (role === 'user') {
      return <Route {...props} />;
    } else {
      return <Redirect to="/Admin/Tools" />;
    }
  } else {
    return <Redirect to="/Login" />;
  }
};

export default UserRoute;
