export default function NotFound() {
  return (
    <div  className="bg-surface min-h-screen flex flex-col items-center justify-center">
      <h1 style={{ fontSize: '100px' }} className="font-bold text-danger">404</h1>
      <p style={{ fontSize: '40px' }} className="text-xl text-text mt-2">Page not found</p>
    </div>
  );
}
