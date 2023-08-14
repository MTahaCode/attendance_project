const express = require('express');
const bodyParser = require('body-parser');
const {connectToDb, getDb} = require('./db');
const { ObjectId, Binary } = require('mongodb');
const mime = require("mime-types")
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

const cron = require("node-cron");

let db;

// Multer Code

const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "ProfilePics")
//     },
//     filename: (req, file, cb) => {
//         console.log(req.file);
//         cb(null, file.originalname);
//     }
// })

const upload = multer({storage: storage})

// End Multer Code 


// Updating Attendance
const UpdateAttendanceRecord = () => {

    const date = new Date();
    const dateOnly = date.toLocaleDateString();
    console.log("Today's Date: ",date);
    const NewAttendance = {
        Date: dateOnly,
        State: "A",
    }

    db.collection("Members")
    .find()
    .forEach((student) => {
        // console.log("Updating ATtendacne place: ", student)
        if (student.UserName !== "admin")
        {
            // console.log("Performing Record Check");
            let DoesDateExist = student.Record.some((record) => record.Date === dateOnly);
            if (!DoesDateExist)
            {
                db.collection("Members")
                .updateOne(
                    {UserName: student.UserName},
                    { $push : { Record: NewAttendance}},
                    (error,result) => {
                    if (error)
                    {
                        console.error(`Error inserting document of ${student.UserName} : `, error);
                        return;
                    }
                    // console.log(`Attendance of ${student.UserName} inserted successfully`);
                }
                ).then((ss) => {console.log("Doing : ",ss)})
            }
        }
    })
}
// End Updating Attendance

app.post("/UploadImg", upload.single("TheImage"), (req, res) => {

    const imageBuffer = req.file.buffer;
    const imageBinary = new Binary(imageBuffer);

    const mimeType = mime.lookup(req.file.originalname);
    console.log("What: ",mimeType);
    db.collection("Members")
    .updateOne({
        UserName: req.body.StudentName,
    },
    {
        $set: {
            ProfilePic: {
                data: imageBinary,
                type: mimeType,
            }
        }
    }).then(
        res.json({msg: "Uploaded the pfp"})
    )
    // console.log(req.file);
})

app.post("/getStudentRecord", (req,res) => {
    db.collection("Members")
    .findOne({UserName: req.body.StudentName})
    .then(
        (foundStudent) => {
            console.log(foundStudent.Record);
            if (!foundStudent)
            {
                res.status(500).send({err: 'Student Not Found'})
            }
            else
            {
                res.status(200).json(foundStudent);
            }
        }
    )
})

app.post("/verifyCredentials", (req,res) => {
    
    db.collection("Members")
    .findOne({"UserName": req.body.UserName , "Password":req.body.Password})
    .then(
        (member) => {
            console.log(member);
                if (member === null)
                {
                    res.json({User:"none"})
                }
                else if (member.UserName === "admin")
                {
                    res.json({User:"admin"})
                }
                else 
                {
                    res.json({
                        User:"student",
                        Pfp:"Profile Pic",
                        UserName:member.UserName,
                    })
                }
        }
    )
    
})

app.post("/markAttendance", (req,res) => {

    const date = new Date();
    const dateOnly = date.toLocaleDateString();

    db.collection("Members")
    .updateOne({
        "UserName": req.body.StudentName,
        "Record.Date": dateOnly,
    },
    {
        $set: {
            "Record.$.State": "P"
        }
    })
})

app.get("/getAdminRecord", (req,res) => {
    db.collection("Members")
    .find({ UserName: { $nin: ["admin"]} })
    .toArray()
    .then((allStudents) => 
        res.json(allStudents)
    )
})

app.post("/sendLeaveRequest", (req, res) => {
    const date = new Date();
    const dateOnly = date.toLocaleDateString();
    db.collection("LeaveRequests")
        .insertOne(
            {
                UserName: req.body.StudentName,
                Date: dateOnly,
            },
            (err, result) => {
                if (err) {
                    console.error("Error inserting document:", err);
                    res.status(500).send("Error inserting document");
                } else {
                    console.log("Document inserted:", result.insertedId);
                    res.status(200).send("Document inserted successfully");
                }
            }
        );
});

app.get("/getLeaves", (req,res) => {
    db.collection("LeaveRequests")
    .find()
    .toArray()
    .then((allLeaves) => {
        res.json(allLeaves)
    })
})

app.post("/acceptLeave", (req,res) => {
    console.log("Sent Id: ", req.body.LeaveId)
    const ID = new ObjectId(req.body.LeaveId);
    db.collection("LeaveRequests")
    .findOne({_id: ID})
    .then((leave) => {
        console.log(leave);
        db.collection("Members")
        .updateOne(
            {
                "UserName": leave.UserName,
                "Record.Date": leave.Date,
            },
            {
                $set: {
                    "Record.$.State": "L"
                }
            }
        ).then(
            db.collection("LeaveRequests")
            .deleteOne({ _id: ID})
            .then(
                res.json({Deleted: "Leave Deleted"})
            )
        )
    })
})

app.post("/rejectLeave", (req,res) => {
    console.log("Sent Id: ", req.body.LeaveId)
    const ID = new ObjectId(req.body.LeaveId);
    db.collection("LeaveRequests")
    .deleteOne({_id: ID})

})

app.post("/modifiedRecord", (req,res) => {
    const id = new ObjectId(req.body.ID);
    const AlteredRecord = req.body.Record;
    
    console.log(id)
    db.collection("Members")
    .updateOne({ _id: id,
            "Record.Date": AlteredRecord.Date,
    },
    {
        $set: {
            "Record.$.State": AlteredRecord.State,
        }
    }).then(
        res.json({msg: "Altered"})
    )
})

app.post("/addNewStudent", (req,res) => {
    
    // let date = new Date();
    // let dateOnly = date.toLocaleDateString();
    // console.log(dateOnly);
    // date.setDate(date.getDate() +200);
    // dateOnly = date.toLocaleDateString();
    // console.log(dateOnly);
    

    db.collection("Members")
    .find()
    .toArray()
    .then((allUsers) => {
        const DoesNewUserExist = allUsers.some((user) => user.UserName === req.body.UserName);
        if (!DoesNewUserExist)
        {
            const NewUser = {
                UserName: req.body.UserName,
                Password: req.body.Password,
                ProfilePic: null,
                Record: (() => {
                    let arr = [];
                    let date = new Date(2023, 7, 8);
                    const today = new Date();
                    
                    while(date <= today)
                    {
                        arr.push({
                            Date: date.toLocaleDateString(),
                            State: "A",
                        });
                        date.setDate(date.getDate() + 1);
                    }
                    return arr;
                })(),
            };
            console.log(NewUser);
            db.collection("Members")
            .insertOne(NewUser)
            .then(
                res.json({ msg: "New Student Added" })
            )
        }
        else
        {
            res.json({msg: "The User Exists"})
        }
    })
})

app.post("/getAdminOnDates", (req,res) => {

    const fromDate = new Date(req.body.FromDate);
    const toDate = new Date(req.body.ToDate);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    // fromDate.setDate(fromDate.getDate() - 1);
    // toDate.setDate(toDate.getDate() - 1);
    // const date1 = new Date(toDate);
    // const date2 = new Date(toDate);
    // date2.setDate(date2.getDate() + 1);
    // console.log(fromDate, toDate);
    // console.log(date1 <= date2);
    
    db.collection("Members")
    .find({ UserName: { $nin: ["admin"]} })
    .toArray()
    .then((Students) => {
        let arr = [];
        for(const student of Students)
        {         
            const col = student.Record.filter((record) => {
                const thisDate = new Date(record.Date);
                // thisDate.setDate(thisDate.getDate() + 1);
                thisDate.setHours(0,0,0,0);
                // console.log("asdf: ",thisDate, fromDate, toDate);
                if (thisDate >= fromDate && thisDate <= toDate)
                {
                    return 1;
                }
                return 0;
            })
            console.log(col);
            student.Record = col;
            arr.push(student);
        }
        res.json(arr);
    })
})

connectToDb((err) => {
    if (!err)
    {
        app.listen(5000, () => {
            console.log("app listening on port 5000");
            cron.schedule("*/10 * * * * *", () => {
                UpdateAttendanceRecord();
            })
        })
        db = getDb();
    }
});