import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar  from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[260px] max-[900px]:ml-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-7 max-[600px]:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
