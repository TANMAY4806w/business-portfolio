import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessDashboard from './pages/BusinessDashboard';
import ManageProfile from './pages/ManageProfile';
import ManageServices from './pages/ManageServices';
import AddService from './pages/AddService';
import BusinessProfilePublic from './pages/BusinessProfilePublic';
import HireRequests from './pages/HireRequests';
import Chat from './pages/Chat';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import StripeReturn from './pages/StripeReturn';
import NotFound from './pages/NotFound';

function App() {
    return (
        <div className="min-h-screen bg-dark-950 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/business/:userId" element={<BusinessProfilePublic />} />

                    {/* Protected – Business Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={['business']}>
                                <BusinessDashboard />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="profile" element={<ManageProfile />} />
                        <Route path="services" element={<ManageServices />} />
                        <Route path="add-service" element={<AddService />} />
                    </Route>

                    {/* Protected – Both roles */}
                    <Route
                        path="/hire-requests"
                        element={
                            <ProtectedRoute>
                                <HireRequests />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat/:hireRequestId"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stripe-return"
                        element={
                            <ProtectedRoute roles={['business']}>
                                <StripeReturn />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-success"
                        element={
                            <ProtectedRoute roles={['client']}>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-cancel"
                        element={
                            <ProtectedRoute roles={['client']}>
                                <PaymentCancel />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
