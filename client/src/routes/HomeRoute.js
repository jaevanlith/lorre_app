import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const HomeRoute = ({ ...props }) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (token && userId && role) {
    if (role === 'admin') {
      return <Redirect to="/Admin/Tools" />;
    } else {
      return <Redirect to="/User/Overview" />;
    }
  } else {
    return <Route {...props} />;
  }
};

export default HomeRoute;
