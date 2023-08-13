import { Paper, ThemeProvider, Typography, CssBaseline } from '@mui/material';
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation} from 'react-router-dom';

import theme from "./Components/Theme.jsx";
import LoginReg from "./Components/LoginRegister.jsx";
import AdminPage from "./Components/Admin.jsx";
import StudentPage from "./Components/Student.jsx";

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline style={{ backgroundColor: theme.palette.background.default }}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<LoginReg />}/>
            <Route exact path="/admin" element={<AdminPage />}/>
            <Route exact path="/student" element={<StudentPage />}/>
          </Routes>
        </BrowserRouter>
      </CssBaseline>
    </ThemeProvider>
  );
};

export default App;
