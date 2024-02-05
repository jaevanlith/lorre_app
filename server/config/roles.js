const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['makePayments']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'manageTickets', 'manageCheckIns', 'analytics']);

module.exports = {
  roles,
  roleRights,
};
