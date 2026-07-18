import { Navigate } from 'react-router-dom';

// Superseded by the day/week/month pass pricing — always redirect here so
// this route can never show stale plan info again.
export default function UpgradePremium() {
  return <Navigate to="/pricing" replace />;
}
