import { createCampaign, dashboard, logout, payment, profile, withdraw, admin } from '../assets';

export const navlinks = [
  {
    name: 'dashboard',
    imgUrl: dashboard,
    link: '/',
  },
  {
    name: 'campaign',
    imgUrl: createCampaign,
    link: '/create-campaign',
  },
  {
    name: 'payment',
    imgUrl: payment,
    link: '/',
    disabled: true,
  },
  {
    name: 'withdraw',
    imgUrl: withdraw,
    link: '/',
    disabled: true,
  },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'admin',
    imgUrl: admin,
    link: '/admin-configuration',
    disabled: false,
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/logout',
    disabled: false,
  },
];
