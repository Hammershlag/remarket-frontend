import { useUser } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';

function RequireUser({ children }) {
    const { user } = useUser();

    if (!user || user.role?.toLowerCase() !== 'user') {
        return <Navigate to="/not-authorized" />;
    }

    return children;
}

export default RequireUser;
