import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    // primary: {
    //   main: '#eceff1',  // Dark primary color
    // },
    secondary: {
      main: '#455a64',  // Light secondary color
    },
    info: {
      main: '#ffc107',  // Bright accent color (shades of yellow)
    },
    background: {
      default: "#78909c", // Set your desired background color
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    fontSize: 20,
  },
  // ...other theme properties
});

export default theme