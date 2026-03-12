import './TopBar.css'

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="21" height="10.34" rx="2" stroke="white" strokeOpacity="0.35"/>
      <rect x="2" y="2" width="18" height="7.34" rx="1" fill="white"/>
      <rect x="23" y="4" width="1.33" height="4" rx="0.5" fill="white" fillOpacity="0.4"/>
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8.5C8.83 8.5 9.5 9.17 9.5 10C9.5 10.83 8.83 11.5 8 11.5C7.17 11.5 6.5 10.83 6.5 10C6.5 9.17 7.17 8.5 8 8.5Z" fill="white"/>
      <path d="M8 5C9.86 5 11.54 5.75 12.78 6.96L14.2 5.54C12.58 3.97 10.4 3 8 3C5.6 3 3.42 3.97 1.8 5.54L3.22 6.96C4.46 5.75 6.14 5 8 5Z" fill="white"/>
      <path d="M8 1C11.16 1 14.02 2.3 16.1 4.42L15.27 3.59C13 1.37 9.65 0 8 0C6.35 0 3 1.37 0.73 3.59L0 4.42C2.08 2.3 4.84 1 8 1Z" fill="white"/>
    </svg>
  )
}

function CellIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="3" height="5" rx="0.5" fill="white"/>
      <rect x="4.5" y="4" width="3" height="7" rx="0.5" fill="white"/>
      <rect x="9" y="2" width="3" height="9" rx="0.5" fill="white"/>
      <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white"/>
    </svg>
  )
}

export default function TopBar() {
  return (
    <div className="top-bar">
      <span className="top-bar__time">9:41</span>
      <div className="top-bar__icons">
        <CellIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}
