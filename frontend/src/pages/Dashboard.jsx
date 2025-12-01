import {useEffect, useState} from 'react';
import dashboardService from '../services/dashboardService.js'
import { useNotification } from '../context/NotificationContext';
import PaginationButtons from '../components/content/PaginationButtons.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

function Dashboard() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { error } = useNotification();


    // Fetch dashboard data from the server
    async function fetchDashboardData() {
            try {
                const response = await dashboardService.getDashboardData(page);
                
                // set data and pagination info
                setData(response.data || []);
                setTotalPages(response.total_pages || 1);
                setPageSize(response.PAGE_SIZE || 10);
            } catch (err) {
                error('Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

    useEffect(() => {
        fetchDashboardData();
    }, [page]);
    
    

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div id='dashboard-table'  className='bg-surface max-w-[800px] p-4 shadow-md rounded-lg space-y-4'>
                {/* place holder for storage usage element */}
                <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
                {loading 
                ? (<LoadingSpinner />
                  )
                : data.length === 0 
                    ? (
                        <p className='text-muted'>No recent activities found.</p>
                        )
                    : (
                        <div className=' overflow-x-auto space-y-4'>
                            <table  className='  border  rounded-lg divide-y divide-borderColor '>
                                <thead className='bg-tableHeaderBg'>
                                    <tr>
                                        <th className='px-4 py-2'>Action</th>
                                        <th className='px-4 py-2'>Time</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-borderColor'>
                                    {data?.map((item,i) => (
                                        <tr key={i}>
                                            <td className='px-4 py-2 space-x-2'>
                                                <i 
                                                    className={`fa-solid ${
                                                        item.icon === 'create' ? 'fa-plus ' :
                                                        item.icon === 'update' ? 'fa-pencil-alt ' :
                                                        item.icon === 'delete' ? 'fa-trash ' : 'fa-question'
                                                    }`} 
                                                    style={{ 
                                                        color: item.icon === 'create' ? 'var(--color-primary)' :
                                                        item.icon === 'update' ? 'var(--color-success)' :
                                                        item.icon === 'delete' ? 'var(--color-danger)' : 'var(--color-muted)'
                                                    }}>
                                                </i>
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
                            <PaginationButtons page={page} setPage={setPage} pageSize={pageSize} totalPages={totalPages} />
                        </div>
                    )
                } 
            </div>
        </div>
    )
}
export default Dashboard;