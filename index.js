const fs = require("fs");
const db = require("mysql2");
const path = require("path");

// define the database
const dbConnection = db.createConnection({
  host: "43.252.105.150", // Replace with your MySQL host
  user: "virgo", // Replace with your MySQL username
  password: "Admin321!", // Replace with your MySQL password
  database: "nitip_klhk",
});

if (dbConnection) {
  console.log("connected success !");
} else {
  return console.log("failed to connect");
}
// Specify the folder you want to monitor
const folderToWatch = "../transit_foto";

const destinationFolder = "../totalcamera";

// Initialize an array to store the current list of files in the folder
let currentFiles = [];

// Function to check for new files
function checkForNewFiles() {
  fs.readdir(folderToWatch, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Find new files by comparing with the previous list
    const newFiles = files.filter((file) => !currentFiles.includes(file));

    if (newFiles.length > 0) {
      newFiles.forEach((file) => {
        console.log("New file detected:", file);
        var camstatus = file.slice(0, 6);
        console.log(camstatus);

        var filePath = path.join(folderToWatch, file);

        var ax = fs.chmod(filePath, 0o777, (err) => {
          console.log(err);
        });

        if (ax) {
          console.log("success changing permition on folder cam1");
        } else {
          console.log("error changing permition on folder cam1");
        }

        const sourceFilePath = path.join(folderToWatch, file);
        const destinationFilePath = path.join(destinationFolder, file);

        dbConnection.query(
          "INSERT INTO image_ftp (img_name,img_num) VALUES (?,?)",
          [file, camstatus],
          (err, results) => {
            if (err) {
              console.error("Error inserting into database:", err);
            } else {
              console.log(`Inserted ${file} into the database`);
            }
          }
        );

        fs.rename(sourceFilePath, destinationFilePath, (err) => {
          if (err) {
            console.error(`Error moving ${file}:`, err);
          } else {
            console.log(`Moved ${file} to ${destinationFolder}`);
          }
        });
      });

      // Update the current list of files
      currentFiles = files;
    } else {
      console.log("No new files cam1 are founded.");
    }
  });
}

// Check for new files initially
checkForNewFiles();

const interval = 2000; // 5 minutes in milliseconds
setInterval(checkForNewFiles, interval);
