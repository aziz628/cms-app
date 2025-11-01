import {useEffect, useState} from 'react';
import dashboardService from '../services/dashboardService.js'
import { useNotification } from '../context/NotificationContext';
function Dashboard() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { error } = useNotification();

    useEffect(() => {
        // Fetch dashboard data from the server
        async function fetchDashboardData() {
            try {
                const response = await dashboardService.getDashboardData(page);
                setData(response.logs || []);
                setTotalPages(response.totalPages || 1);
            } catch (err) {
                error('Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, [page]);
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div id='dashboard-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg space-y-4'>
                <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
                {loading 
                ? (
                    <div className="flex bg-red justify-center items-center h-64">
                  <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )
                : data.length === 0 
                    ? (
                        <p className='text-gray-500'>No recent activities found.</p>
                        )
                    : (
                        <div className=' overflow-x-auto space-y-4'>
                            <table  className='  border  rounded-lg divide-y divide-gray-200 '>
                                <thead className='bg-[#ebeef2]'>
                                    <tr>
                                        <th className='px-4 py-2'>Action</th>
                                        <th className='px-4 py-2'>Time</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {data?.map((item,i) => (
                                        <tr key={i}>
                                            <td className='px-4 py-2 space-x-2'>
                                                <i className={`fa-solid ${
                                                item.icon === 'create' ? 'fa-plus ' :
                                                item.icon === 'update' ? 'fa-pencil-alt ' :
                                                item.icon === 'delete' ? 'fa-trash ' : 'fa-question'
                                                }`} style={{ 
                                                color: item.icon === 'create' ? 'blue' :
                                                item.icon === 'update' ? 'green' :
                                                item.icon === 'delete' ? 'red' : 'gray'
                                                }}></i>
                                                <span>
                                                {item.action}</span></td>
                                            <td className='px-4 py-2'>
                                            {new Date(parseInt(item.timestamp)*1000).toLocaleString([], 
                                                {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit' 
                                                })
                                            }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex gap-4 flex-wrap  ">
                                {totalPages < 10 ? (
                                    Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`px-4 py-2 border rounded-md ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))
                                ) : (
                                    <>
                                        <button onClick={() => setPage(1)} className={`px-4 py-2 border rounded-md ${page === 1 ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}>
                                            1
                                        </button>
                                       {page > 5 && <span className="px-4 py-2">...</span>}
                                        {
                                        Array.from({ length: 8 }, (_, i) => {
                                            const pageNum = Math.max(2, page - 4) + i;
                                            return pageNum <= totalPages - 1 ? (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`px-4 py-2 border rounded-md ${page === pageNum ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ) : null;
                                        })
                                        }
                                        {page < totalPages - 5 && <span className="px-4 py-2">...</span>}
                                        <button onClick={() => setPage(totalPages)} className={`px-4 py-2 border rounded-md ${page === totalPages ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}>
                                            {totalPages}
                                        </button>
                                    </>
                                    )
                            }
                            </div>
                        </div>
                    )
                } 
            </div>
        </div>
    )
}
export default Dashboard;