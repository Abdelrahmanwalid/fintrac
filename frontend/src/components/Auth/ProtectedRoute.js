import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem("accessToken"); // Change 'token' to 'accessToken'
  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
