import { Typography, FormControl, Button, InputLabel, Input, 
  Container, TableContainer, Paper, Table, TableHead, TableRow
  ,TableCell, TableBody, Box, Select, MenuItem, Toolbar, AppBar
  , TextField} from "@mui/material";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom"
import theme from './Theme';
import { useNavigate } from 'react-router-dom';

const TableOfRecords = () => {

  const [AllStudents, setAllStudents] = useState([]);
  const [ModifiedRecords, setModifiedRecords] = useState([]);

  const [Dates, setDates] = useState([]);
  
  const [IsTableChanged, setIsTableChanged] = useState(true);

  const FormatDate = (change) => {
    const fullDate = new Date();
    fullDate.setDate(fullDate.getDate() + change)
    const year = fullDate.getFullYear().toString();
    // console.log("Year: ",year);
    const month = (fullDate.getMonth() + 1).toString().padStart(2, '0');
    // console.log("Month: ",month);
    const day = fullDate.getDate().toString().padStart(2, '0');
    // console.log("Day: ",day);
    const required = `${year}-${month}-${day}`;
    // console.log("Full Date: ",required);
    return required;
  }

  const [FromDate, setFromDate] = useState(FormatDate(-6));
  const [ToDate, setToDate] = useState(FormatDate(0));

  // const handleDateChange = (event) => {
  //   const newDate = event.target.value;
  //   setFromDate(newDate);
  //   // console.log(newDate); // Log the new date value
  // };

  const ChangeAttendance = (studentIndex, recordIndex, state) => {

    setAllStudents(prevStudents => {
      const updatedStudents = [...prevStudents]; 
      updatedStudents[studentIndex].Record[recordIndex].State = state;
      return updatedStudents; 
    });
    ModifiedRecords.push(
      {
        ID: AllStudents[studentIndex]._id,
        Record: AllStudents[studentIndex].Record[recordIndex],
        Name: AllStudents[studentIndex].UserName,
      }
    );
    setIsTableChanged(false);
  }

  const SendModifiedRecord = () => {
    for (const record of ModifiedRecords)
    {
      fetch("/modifiedRecord", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          record,
        )
      }).then(
        res => res.json()
      ).then(
        data => {
          alert(data.msg);
          setIsTableChanged(true);
        }
      )
    }
    setModifiedRecords([]);
  }

  useEffect(() => {
    fetch("/getAdminOnDates", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        FromDate: new Date(FromDate),
        ToDate: new Date(ToDate),
      })
    }).then(
      res => res.json()
      ).then(
        data => {
          // console.log("Getting the Data First",data);
          // let arr = [];
          //   for (let i=0;i<data.length;i++)
          //   {
          //     arr = [...arr, ...data[i].Record.map((record) => record.Date) ]
          //   }
          // const UniqueArray = [...new Set(arr)];
          let arr = [];
          let InitialDate = new Date(FromDate);
          const FinalDate = new Date(ToDate);
          while (InitialDate <= FinalDate)
          {
            arr.unshift(
              InitialDate.toLocaleDateString()
            )
            InitialDate.setDate(InitialDate.getDate() + 1)
          }
          setDates(arr);

          const Students = data;
          for ( const date of arr )
          {
            for ( const student of Students)
            {
              const IsAttendancePresent = student.Record.some((record) => {
                if (record.Date === date)
                {
                  return true;
                }
                return false;
              })
              if (!IsAttendancePresent)
              {
                student.Record.unshift({
                  Date: date,
                  State: "--",
                })
              }
              student.Record.sort((record1, record2) => {
                const date1 = new Date(record1.Date);
                const date2 = new Date(record2.Date);
                // console.log("Date1: ",date1,"Date2: ", date2);
                if (date1 < date2) {
                  return -1;
                } else if (date1 > date2) {
                  return 1;
                } else {
                  return 0;
                }
              });
            }
          }
          setAllStudents(Students);
      }).catch(err => {
        console.log(err)
    })

  },[FromDate, ToDate])

  return (
    <Box>
      <Box sx={{display:"flex", justifyContent:"space-evenly"}}>
        <Typography style={{display:"flex", alignItems:"center", gap:"1em"}}>
          From: 
          <TextField
            type="date"
            value={FromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </Typography>
        <Typography style={{display:"flex", alignItems:"center", gap:"1em"}}>
          To: 
          <TextField
            type="date"
            value={ToDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow align="center">
              <TableCell style={{borderRight:`2px solid ${theme.palette.secondary.light}`}}>
                Students Below
              </TableCell>
              {Dates.map((date) =>
                (<TableCell>
                  {date}
                </TableCell>)
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {(AllStudents) ? 
            (AllStudents.map((student, studentIndex) => 
            (
              <TableRow>
                <TableCell  style={{borderRight:`2px solid ${theme.palette.secondary.light}`}} variant="head">
                  {student.UserName}
                </TableCell>
                {student.Record.map((record, recordIndex) => 
                (<TableCell>
                  {/* {record.Date} */}
                  <Select
                    variant="filled"
                    sx={{ 
                      backgroundColor:theme.palette.secondary.light,
                      '& .MuiMenu-paper': {
                        backgroundColor: "black",
                      },
                    }}
                    inputProps={{
                      MenuProps: {
                          MenuListProps: {
                              sx: {
                                  backgroundColor: theme.palette.secondary.light
                              }
                          }
                      }
                    }}
                    value={record.State}
                  >
                    <MenuItem value="--" onClick={() => {ChangeAttendance(studentIndex, recordIndex, "--")}}>--</MenuItem>
                    <MenuItem value="L" onClick={() => {ChangeAttendance(studentIndex, recordIndex, "L")}}>L</MenuItem>
                    <MenuItem value="A" onClick={() => {ChangeAttendance(studentIndex, recordIndex, "A")}}>A</MenuItem>
                    <MenuItem value="P" onClick={() => {ChangeAttendance(studentIndex, recordIndex, "P")}}>P</MenuItem>
                  </Select>
                </TableCell>)
              )}
              </TableRow>
            ))
            ): ("")}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" onClick={() => {console.log("clicked");SendModifiedRecord()}} disabled={IsTableChanged}>Save</Button>
    </Box>
  )
}

const ListOfLeaves = ({Leaves, setUseEffectTrigger, UseEffectTrigger}) => {

  const AcceptLeave = (id) => {
    fetch("/acceptLeave", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        LeaveId: id,
      })
    }).then(
      res => res.json()
    ).then(
      data => {
        console.log(data);
      }
    )
    setUseEffectTrigger(!UseEffectTrigger);
  }

  const RejectLeave = (id) => {
    fetch("/rejectLeave", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        LeaveId: id,
      })
    }).then(
      res => res.json()
    ).then(
      data => {
        console.log(data);
      }
    )
    setUseEffectTrigger(!UseEffectTrigger);
  }

  return (
    <Box>
      {Leaves.map((leave) => (
            <Paper sx={{margin:"20px", padding:"10px", backgroundColor:"#90a4ae"}}>
              <Typography sx={{color: "#FFFFFF"}}>
                {`StudentName: ${leave.UserName}`}
              </Typography>
              <Typography sx={{color: "#FFFFFF"}}>
                {`Date: ${leave.Date}`}
              </Typography>
              <Button onClick={() => {AcceptLeave(leave._id)}}>Accept</Button>
              <Button onClick={() => {RejectLeave(leave._id)}}>Reject</Button>
            </Paper>
          ))}
    </Box>
  )
}

const Admin = () => {

  const navigate = useNavigate();

  const location = useLocation();
  const UserType = (location.state) ? location.state.userType : "Not Admin";

  const [TableShow, setTableShow] = useState(0);
  const [Leaves, setLeaves] = useState([]);
  const ViewButton = useRef(null);
  const LeaveButton = useRef(null);
  const [UseEffectTrigger, setUseEffectTrigger] = useState(0);

  useEffect(() => {

    // fetch("/getAdminRecord")
    // .then(
    //   res => res.json()
    // ).then(
    //   data => {
    //     // console.log("Getting the Data First",data);
    //     let arr = [];
    //       for (let i=0;i<data.length;i++)
    //       {
    //         arr = [...arr, ...data[i].Record.map((record) => record.Date) ]
    //       }
    //     const UniqueArray = [...new Set(arr)];
    //     setDates(UniqueArray);
    //     setAllStudents(() => {
    //       let Students = data;
    //       for ( const date of UniqueArray.reverse() )
    //       {
    //         for ( let student of Students)
    //         {
    //           const IsAttendancePresent = student.Record.some((record) => {
    //             if (record.Date === date)
    //             {
    //               return true;
    //             }
    //             return false;
    //           })
    //           if (!IsAttendancePresent)
    //           {
    //             student.Record.unshift({
    //               Date: date,
    //               State: "--",
    //             })
    //           }
    //           student.Record.sort((record1, record2) => {
    //             const date1 = new Date(record1.Date);
    //             const date2 = new Date(record2.Date);
    //             // console.log("Date1: ",date1,"Date2: ", date2);
    //             if (date1 < date2) {
    //               return -1;
    //             } else if (date1 > date2) {
    //               return 1;
    //             } else {
    //               return 0;
    //             }
    //           });
    //         }
    //       }
    //       return Students;
    //     });
    // }).catch(err => {
    //   console.log(err)
    // })


    fetch("/getLeaves")
    .then(
      res => res.json()
    ).then(
      data => {
        setLeaves(data);
    }).catch(err => {
      console.log(err)
    })
    
  },[UseEffectTrigger])

    return (
      <Container>
        {(UserType === "admin") ? (
          <Box>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Admin Page
                </Typography>
                <Button  onClick={() => {navigate("/");}}>
                  <Typography color={theme.palette.primary.light}>Login</Typography>
                </Button>
              </Toolbar>
            </AppBar>
            <Button variant="contained" ref={ViewButton} onClick={() => setTableShow((TableShow !== 1) ? 1:0)}>View Attendance</Button>
            <Button variant="contained" ref={LeaveButton} onClick={() => {setTableShow((TableShow !== 2) ? 2:0); setUseEffectTrigger(!UseEffectTrigger)}}>View Leaves</Button>
            
            {TableShow === 1 ? (
              <TableOfRecords />
              ): ("")}
            {(TableShow === 2) ? (
              <ListOfLeaves Leaves={Leaves} UseEffectTrigger={UseEffectTrigger} setUseEffectTrigger={setUseEffectTrigger} />
              ): ("")}
          </Box>
        ) : (
          <Box sx={{display:"flex", flexDirection:"column", height:"90vw", alignItems:"center", justifyContent:"center"}}>
            <Typography variant="h5" color="white" >Cannot Enter without Login</Typography>
            <Button  onClick={() => {navigate("/");}}>
              <Typography variant="h6" >Login</Typography>
            </Button>
          </Box>
        )}
      </Container>
    )
}

export default Admin
