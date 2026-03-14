import React, { memo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Routing from "./Routing";

const App = memo(function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routing />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 2147483647 }}
        />
      </ToastProvider>
    </AuthProvider>
  );
});

export default App;
