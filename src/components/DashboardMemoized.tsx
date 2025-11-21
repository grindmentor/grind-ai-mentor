import React from 'react';
import Dashboard from './Dashboard';

/**
 * Memoized Dashboard wrapper
 * Prevents unnecessary re-renders when parent components update
 * but Dashboard props haven't changed
 */
export const DashboardMemoized = React.memo(Dashboard);

export default DashboardMemoized;
