import React, { useState, useRef } from 'react';
import { Paper, Typography, TextField, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import theme from './Theme';
// import StudentPage from "./Student.jsx"
// import AdminPage from "./Admin.jsx"
import bg from "../Images/logregbg.jpg"

const LoginRegisterForm = () => {

    //React Code
    const [selectedOption, setSelectedOption] = useState('login');

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const navigate = useNavigate();

    const Username = useRef(null);
    const Password = useRef(null);

    const HandleLogin = () => {
        // console.log(Username.current.value, Password.current.value);
        if (Username.current.value && Password.current.value)
        {
            fetch("/verifyCredentials", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "UserName": Username.current.value,
                    "Password": Password.current.value,
                })
            }).then(
                res => res.json()
            ).then(
                data => {
                    if (data.User === "admin")
                    {
                        navigate("/admin", { state : { userType:"admin" }});
                    }
                    else if (data.User === "student")
                    {
                        navigate("/student", { state : { 
                                                        userType:"student",
                                                        Name:data.UserName,
                                                    }});
                    }
                }
            ).catch(error => {
                console.log(error);
            })
        }
    }

    const HandleRegister = () => {
        console.log("Signing in", Username.current.value);
        if (Username.current.value && Password.current.value)
        {
            fetch("/addNewStudent", {
                method: 'post',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "UserName": Username.current.value,
                    "Password": Password.current.value,
                })
            }).then(
                res => res.json()
            ).then(
                data => {
                    alert(data.msg);
                }
            ).catch(error => {
                console.log(error);
            })
        }
    }

    // Styles

    const TextFieldBgColor = theme.palette.secondary.dark
    // "#37474f";

    const BigBox = {
        p: 4,
        borderRadius: 5,
        transition: 'width 0.3s',
        margin: '0 auto',
        '@media (max-width: 600px)': {
            width: '90%',
        },
        backgroundColor: theme.palette.secondary.main,
        display:"flex",
        flexDirection:"column",
        alignItems:"flex-start",
        padding:"50px",
        gap:"2em",
        paddingTop:"20vh",
        paddingBottom:"15vh",
        backgroundImage: `linear-gradient(to right, black 60%, transparent), url(${bg})`,
        backgroundRepeat:"no-repeat",
        backgroundSize:"cover",
        backgroundBlendMode:"overlay",
        marginTop:"10vh",
    }

    return (
        <Container >
            <Paper elevation={3} sx={BigBox}>
                <Box>
                    <Typography variant="h4" align="center" gutterBottom style={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedOption === 'login' ? 'Login to your account' : 'Create new account'}
                    </Typography>
                    { (selectedOption === "login") ?
                        (
                            <Typography variant="caption" color={theme.palette.secondary.light}>
                                Don't have an account?{' '}
                                <Button color="primary" onClick={() => handleOptionChange('register')}>
                                    Register
                                </Button>
                            </Typography>
                        ) : (
                            <Typography variant="caption" color={theme.palette.secondary.light}>
                                Already have an account?{' '}
                                <Button color="primary" onClick={() => handleOptionChange('login')}>
                                    Login
                                </Button>
                            </Typography>
                        )}
                </Box>
                <Box>
                    <TextField
                        inputRef={Username}
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        InputProps={{
                            style: {
                                backgroundColor: TextFieldBgColor, // Change the background color
                                borderColor: 'green',
                                borderRadius:"20px",
                            },
                            onFocus: (event) => {
                                console.log('Input focused');
                            },
                            // ...other input properties
                            }}
                        InputLabelProps={{
                            sx: {
                                color: 'grey',
                                    '&.Mui-focused': {
                                        color: theme.palette.primary.main,
                                    },
                            },
                        }}
                        sx={{
                            '& input': {
                                color: 'white', // Change the color of the user-entered text
                              },
                        }}
                        
                    />
                    <TextField
                        inputRef={Password}
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        InputProps={{
                            style: {
                                backgroundColor: TextFieldBgColor, // Change the background color
                                borderColor: 'green',
                                borderRadius:"20px",
                            },
                            onFocus: (event) => {
                                console.log('Input focused');
                            },
                            // ...other input properties
                            }}
                        InputLabelProps={{
                            sx: {
                                color: 'grey',
                                    '&.Mui-focused': {
                                        color: theme.palette.primary.main,
                                    },
                            },
                        }}
                        sx={{
                            '& input': {
                                color: 'white', // Change the color of the user-entered text
                              },
                        }}
                        
                    />
                    <Button onClick={() => {(selectedOption === "login") ? HandleLogin(): HandleRegister()}} variant="contained" style={{borderRadius:"10px", marginTop:"20px"}} color="primary">
                        {selectedOption}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginRegisterForm;
