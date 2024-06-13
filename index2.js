const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// MySQL database connection configuration
const dbConnection = db.createConnection({
    host: 'localhost', // Replace with your MySQL host
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'ttn_monitoring_new',
});

// Specify the folder you want to monitor
const folderToWatch = '../contoh_img';
// Specify the folder where you want to move the new files
const destinationFolder = '../contoh_pindahan';

// Initialize an array to store the current list of files in the folder
let currentFiles = [];

// Function to check for new files and move them
function checkForNewFiles() {
    fs.readdir(folderToWatch, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Find new files by comparing with the previous list
        const newFiles = files.filter((file) => !currentFiles.includes(file));

        if (newFiles.length > 0) {
            newFiles.forEach((file) => {
                console.log('New file detected:', file);

                // Construct the source and destination file paths
                const sourceFilePath = path.join(folderToWatch, file);
                const destinationFilePath = path.join(destinationFolder, file);

                // Move the file to the destination folder
                fs.rename(sourceFilePath, destinationFilePath, (err) => {
                    if (err) {
                        console.error(`Error moving ${file}:`, err);
                    } else {
                        console.log(`Moved ${file} to ${destinationFolder}`);

                        // Insert the file name into the database
                        dbConnection.query('INSERT INTO image_ftp (img_name,img_num) VALUES (?,?)', [file, camstatus], (err, results) => {
                            if (err) {
                                console.error('Error inserting into database:', err);
                            } else {
                                console.log(`Inserted ${file} into the database`);
                            }
                        });
                    }
                });
            });

            // Update the current list of files
            currentFiles = files;
        } else {
            console.log('No new files found.');
        }
    });
}

// Check for new files initially
checkForNewFiles();

// Set up a timer to check for new files every 5 minutes (300,000 milliseconds)
const interval =  4000; // 5 minutes in milliseconds
setInterval(checkForNewFiles, interval);