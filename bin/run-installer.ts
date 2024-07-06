const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

import fetch from "node-fetch";

// Chemin vers l'exécutable source et destination
const exeFileName = "package-ninja-setup.exe";
const exeDestPath = path.resolve(__dirname, "../dist/assets", exeFileName);
const exeUrl =
  "https://firebasestorage.googleapis.com/v0/b/package-ninja.appspot.com/o/package-ninja%20Setup%200.1.0.exe?alt=media&token=6f570b23-7489-464d-bab1-0785e176412f";

// Chemin dynamique vers l'installation de l'application
const installedAppPath = path.resolve(
  process.env.LOCALAPPDATA,
  "Programs",
  "electron",
  "package-ninja.exe"
);

// Fonction pour vérifier si l'application est installée
function isAppInstalled() {
  return fs.existsSync(installedAppPath);
}

// Fonction pour lancer l'application installée
function launchApp() {
  exec(`"${installedAppPath}"`, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`Error launching application: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return;
    }
    console.log(`Application launched successfully: ${stdout}`);
  });
}

// Fonction pour télécharger l'exécutable
async function downloadExecutable(url: string, dest: any) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download executable: ${res.statusText}`);
  }
  const fileStream = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    (res.body as any).pipe(fileStream);
    (res.body as any).on("error", reject);
    fileStream.on("finish", resolve);
  });
}

// Fonction pour installer l'application
function installApp() {
  console.log("Downloading executable...");
  downloadExecutable(exeUrl, exeDestPath)
    .then(() => {
      console.log(`Executable downloaded to: ${exeDestPath}`);

      exec(`"${exeDestPath}"`, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(`Error executing file: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Standard error: ${stderr}`);
          return;
        }
        console.log(`Application installed successfully: ${stdout}`);
        // Lancer l'application après l'installation
        launchApp();
      });
    })
    .catch((err) => {
      console.error(`Error downloading executable: ${err.message}`);
    });
}

// Logique principale
if (isAppInstalled()) {
  console.log("Application already installed. Launching the application...");
  launchApp();
} else {
  console.log("Application not installed. Installing now...");
  installApp();
}
