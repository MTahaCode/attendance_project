import { Typography, FormControl, Button, InputLabel, Input, 
  Container, TableContainer, Paper, Table, TableHead, TableRow
  ,TableCell, TableBody, Box, Avatar, AppBar, Toolbar} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import theme from './Theme';
import "../Styles/Student.css"
import { useNavigate } from 'react-router-dom';

import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom"
// import { Buffer } from "node:buffer"

const Student = () => {

  const navigate = useNavigate();

  const location = useLocation();
  const UserType = (location.state) ? location.state.userType : "Not Student";
  const UserName = (location.state) ? location.state.Name : "Not Student";

  const ImgUploadBox = useRef(null);
  const [PFPImg, setPFPImg] = useState(null);
  const [Img, setImg] = useState(null);
  const ViewButton = useRef(null);
  const [TableShow, setTableShow] = useState(0);
  const [Info, setInfo] = useState([]);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(1);
  const [isLeaveAllowed, setIsLeaveAllowed] = useState(1);

  const Profile = {
    cursor:"pointer", 
    display:"flex",
    flexDirection:"column", 
    alignItems:"flex-start", 
    gap:"0.5em", 
    paddingLeft:"10px", 
    paddingRight:"10px", 
    backgroundColor:theme.palette.primary.dark,
    width:"200px",
    height: "50px",
    overflow:"hidden",
    paddingTop:"5px",
    // transition: "width 0.3s ease-in-out, height 0.3s ease-in-out",
    "&:hover": {
      animation: `expand 0.3s ease-in-out both`,
      position:"absolute",
      right:"20px",
      top:"10px",
      alignItems: "flex-start",
    }

  }

  const handleFile = () =>{
    setImg(ImgUploadBox.current.files[0]);
  }

  const UploadImg = () => {

    const formData = new FormData();
    formData.append("StudentName", UserName);
    formData.append("TheImage", Img);

    // console.log(Img);
    fetch("/UploadImg", {
      method: "post",
      body: formData
    }).then(
      res => res.json()
    ).then(
      data => {
        // console.log(data);
        setTableShow(!TableShow);
      }
    ).then(
      setImg(null)
    ).catch(error => {
      console.log(error);
    }
    )
  }

  useEffect(() => {
    if (UserType === "student")
    {
      fetch("/getStudentRecord", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          StudentName: UserName,
        })
      }).then(
        res => res.json()
      ).then(
        data => {
          console.log("Getting Student Record",data);
          setInfo(data);
          if (data.ProfilePic)
          {
            setPFPImg(() => {
              const decodedData = atob(data.ProfilePic.data);
              // const buffer = Buffer.from()
              
              const uint8Array = new Uint8Array(decodedData.length);
              // console.log(uint8Array)
              for (let i = 0; i < decodedData.length; i++) {
                uint8Array[i] = decodedData.charCodeAt(i);
              }

              const blob = new Blob([uint8Array], {type: data.ProfilePic.type});
              // console.log(blob);
              return blob;
            });
          }
        }
      )
      ManageDisable();
    }
  },[TableShow])

  const ManageDisable = () => {
    if (Info && Info.Record)
    {
      const date = new Date();
      const dateOnly = date.toLocaleDateString();
      for(let i=0;i<Info.Record.length;i++)
      {
        if (Info.Record[i].Date === dateOnly)
        {
          if (Info.Record[i].State === "A")
          {
            setIsAttendanceMarked(0);
            setIsLeaveAllowed(0);
            break;
          }
          else if (Info.Record[i].State === "P" || Info.Record[i].State === "L")
          {
            setIsAttendanceMarked(1);
            setIsLeaveAllowed(1);
            break;
          }
        }       
      }
    }
  }

  const MarkAttendance = () => {
    // console.log("clicked");
    fetch("/markAttendance", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        StudentName: UserName,
      })
    }).then(
      res => res.json()
    ).then(
      data => {
        // console.log(data);
        setInfo(data);
      }
    )
  }

  const SendLeaveRequest = () => {
    // console.log("Leave Reqest function entered")
    fetch("/sendLeaveRequest", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        StudentName: UserName,
      })
    }).then(
      res => res.json()
    ).then(
      data => {
        console.log(data);
      }
      ).catch(err => console.log(err))
      fetch("/getImg")
    .then(
      res => res.json()
    ).then(
      data => {
        console.log(data);
      }
    ).catch(err => console.log(err))
    setIsLeaveAllowed(1);
  }

  return (
    <Container>
      {
        (UserType === "student") ? (

          <Box>
            <AppBar position="static">
              <Toolbar>
                {/* <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton> */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Student Page
                </Typography>
                <Paper sx={Profile}>
                  <Box  sx={{display:"flex", flexDirection:"row", gap:"1.5em"}}>
                    <Box sx={{display:"flex", flexDirection:"row", gap:"0.5em"}}>

                      {(PFPImg) ? 
                      (
                        <Avatar src={URL.createObjectURL(PFPImg)} 
                        sx={{ width: 40, height: 40 }}
                        />
                        ):(
                          <PersonIcon />
                          )}
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:"white"}}>
                        {UserName}
                      </Typography>
                    </Box>
                    <Button  onClick={() => {navigate("/");}}>
                      <Typography color={theme.palette.primary.light}>Login</Typography>
                    </Button>
                  </Box>
                  <Avatar src={(Img) ? URL.createObjectURL(Img): ""}/>
                  <FormControl>
                    <Input
                      inputRef={ImgUploadBox}
                      type="file"
                      id="image-input"
                      name="TheImage"
                      onChange={() => handleFile()}
                      fullWidth
                    />
                    <Button disabled={!Img} onClick={() => UploadImg()} variant="contained" color="primary" type="submit">
                      Upload Image
                    </Button>
                  </FormControl>
                </Paper>
              </Toolbar>
            </AppBar>
            <Button variant="contained" disabled={isAttendanceMarked} onClick={() => MarkAttendance()}>Mark Attendance</Button>
            <Button variant="contained" disabled={isLeaveAllowed} onClick={() => SendLeaveRequest()}>Request Leave</Button>
            <Button variant="contained" ref={ViewButton} onClick={() => setTableShow(!TableShow)}>View Attendance</Button>
            { (TableShow) ? 
              (<TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Date
                      </TableCell>
                      <TableCell>
                        State of Attendance
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Info.Record) ? 
                    (
                      Info.Record.map(
                        row => (
                          <TableRow>
                            <TableCell>
                              {row.Date}
                            </TableCell>
                            <TableCell>
                              {row.State}
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell>
                          No Record
                        </TableCell>
                      </TableRow>
                    )
                    }
                  </TableBody>
                </Table>
              </TableContainer>)
              :(
                ""
              )
              }
          </Box>
        ) : (
          <Box sx={{display:"flex", flexDirection:"column", height:"90vw", alignItems:"center", justifyContent:"center"}}>
            <Typography variant="h5" color="white" >Cannot Enter without Login</Typography>
            <Button  onClick={() => {navigate("/");}}>
              <Typography variant="h6" >Login</Typography>
            </Button>
          </Box>
        )
      }
    </Container>
  )
}

export default Student
