'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  Paper,
  Button,
  Popover,
} from '@mui/material';
import {
  MenuIcon,
  DashboardIcon,
  EventIcon,
  PeopleIcon,
  PrescriptionIcon,
  ScienceIcon,
  BillingIcon,
  AdminIcon,
  NotificationsIcon,
  HospitalIcon,
  SwapIcon,
  PersonIcon,
  CheckIcon,
} from '@/components/common/Icons';


import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { switchRole, logout } from '@/store/slices/authSlice';
import { markAsRead, markAllAsRead } from '@/store/slices/notificationsSlice';
import { UserRole } from '@/types';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['patient', 'doctor', 'nurse', 'receptionist', 'admin'],
  },
  {
    label: 'Reception Intake',
    path: '/reception',
    icon: <PersonIcon />,
    roles: ['receptionist', 'admin'],
  },
  {
    label: 'Nurse Triage Station',
    path: '/nurse/triage',
    icon: <ScienceIcon />,
    roles: ['nurse', 'admin'],
  },
  {
    label: 'Appointments Queue',
    path: '/appointments',
    icon: <EventIcon />,
    roles: ['patient', 'doctor', 'nurse', 'receptionist', 'admin'],
  },
  {
    label: 'Patient EMR Records',
    path: '/patients',
    icon: <PeopleIcon />,
    roles: ['doctor', 'nurse', 'receptionist', 'admin'],
  },
  {
    label: 'Prescriptions',
    path: '/prescriptions',
    icon: <PrescriptionIcon />,
    roles: ['patient', 'doctor', 'nurse', 'admin'],
  },
  {
    label: 'Lab Requests & Results',
    path: '/labs',
    icon: <ScienceIcon />,
    roles: ['patient', 'doctor', 'nurse', 'admin'],
  },
  {
    label: 'Billing & Invoices',
    path: '/billing',
    icon: <BillingIcon />,
    roles: ['patient', 'receptionist', 'admin', 'doctor'],
  },
  {
    label: 'Admin RBAC Control',
    path: '/admin',
    icon: <AdminIcon />,
    roles: ['admin'],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/patient/activate');

  const { currentUser, availableUsers } = useAppSelector((state) => state.auth);
  const { items: notifications } = useAppSelector((state) => state.notifications);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoleClick = (event: React.MouseEvent<HTMLElement>) => {
    setRoleAnchorEl(event.currentTarget);
  };

  const handleRoleSelect = (role: UserRole) => {
    dispatch(switchRole(role));
    setRoleAnchorEl(null);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <HospitalIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
            SmartClinic
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Patient Portal & EMR
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.100',
            borderRadius: 3,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark', display: 'block' }}>
            DEMO ROLE SWITCHER
          </Typography>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={handleRoleClick}
            endIcon={<SwapIcon />}
            sx={{ mt: 1, textTransform: 'capitalize', justifyContent: 'space-between' }}
          >
            Role: <strong>{currentUser.role}</strong>
          </Button>
        </Paper>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role)).map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isActive ? 'primary.main' : 'text.secondary',
                bgcolor: isActive ? 'action.selected' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {currentUser.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {currentUser.title}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`Active View: ${currentUser.role.toUpperCase()}`}
              color={
                currentUser.role === 'doctor'
                  ? 'primary'
                  : currentUser.role === 'patient'
                  ? 'success'
                  : currentUser.role === 'admin'
                  ? 'secondary'
                  : 'warning'
              }
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
              | Logged as <strong>{currentUser.name}</strong> ({currentUser.title})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Quick Switch Button */}
            <Tooltip title="Switch Role Perspective">
              <Button
                variant="outlined"
                size="small"
                startIcon={<SwapIcon />}
                onClick={handleRoleClick}
                sx={{ borderRadius: 3, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Switch Role
              </Button>
            </Tooltip>

            {/* Sign Out Button */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                dispatch(logout());
                router.push('/login');
              }}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              Sign Out
            </Button>

            {/* Notifications Bell */}
            <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Role Switcher Menu */}
      <Menu
        anchorEl={roleAnchorEl}
        open={Boolean(roleAnchorEl)}
        onClose={() => setRoleAnchorEl(null)}
        PaperProps={{ sx: { width: 280, p: 1 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 700, color: 'text.secondary' }}>
          Select Demo Persona:
        </Typography>
        <Divider sx={{ my: 1 }} />
        {availableUsers.map((u) => (
          <MenuItem
            key={u.id}
            selected={currentUser.id === u.id}
            onClick={() => handleRoleSelect(u.role)}
            sx={{ borderRadius: 2, my: 0.5, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={u.avatar} sx={{ width: 32, height: 32 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {u.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Role: {u.role}
                </Typography>
              </Box>
            </Box>
            {currentUser.id === u.id && <CheckIcon color="primary" fontSize="small" />}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            setRoleAnchorEl(null);
            router.push('/admin/login');
          }}
          sx={{ borderRadius: 2, color: '#D97706', fontWeight: 700 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="body2" fontWeight={700}>
              Admin Governance Login
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchorEl)}
        anchorEl={notifAnchorEl}
        onClose={() => setNotifAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, p: 2, borderRadius: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => dispatch(markAllAsRead())}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 1 }} />
        <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No notifications.
            </Typography>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.id}
                onClick={() => dispatch(markAsRead(n.id))}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: n.read ? 'action.hover' : 'primary.50',
                  cursor: 'pointer',
                  borderLeft: '4px solid',
                  borderColor:
                    n.type === 'error'
                      ? 'error.main'
                      : n.type === 'warning'
                      ? 'warning.main'
                      : n.type === 'success'
                      ? 'success.main'
                      : 'primary.main',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {n.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem', my: 0.5 }}>
                  {n.message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            ))
          )}
        </List>
      </Popover>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
