
export default function NotFound() {
  return (
    <div  className="bg-white min-h-screen flex flex-col items-center justify-center">
      <h1 style={{ fontSize: '60px' }} className="font-bold text-red-600">404</h1>
      <p style={{ fontSize: '24px' }} className="text-xl  text-black mt-2">Page not found</p>
      <button 
      style={{ marginTop: '30px' }}
        className=" px-4 py-2 bg-primary text-white rounded"
        onClick={() => window.location.href = '/'}
      >
        Return to Dashboard
      </button>
    </div>
  );
}
