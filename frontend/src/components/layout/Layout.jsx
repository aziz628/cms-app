import Header from './Header';
import Sidebar from './Sidebar';

function AdminLayout({children}) {
  return (
    <div className="min-h-screen w-full bg-bg text-text font-sans flex flex-col">
      <Header />
      <div className="mt-16 flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 ml-[44px] md:ml-[176px] overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
export default AdminLayout;