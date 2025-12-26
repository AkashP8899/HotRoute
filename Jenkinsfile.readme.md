# Jenkins Pipeline Setup for Electron Windows Build

This document explains how to set up a Jenkins pipeline to build a Windows executable for your Electron application.

## Prerequisites

1. **Jenkins Server** with the following plugins installed:
   - NodeJS Plugin
   - Pipeline Plugin
   - Workspace Cleanup Plugin

2. **Build Agent Requirements**:
   - Windows build agent (or Windows Subsystem for Linux)
   - Node.js (matching the version in Jenkinsfile)
   - npm (comes with Node.js)
   - Git
   - Required build tools for native modules (like `windows-build-tools` on Windows)

## Setup Steps

1. **Install Required Jenkins Plugins**
   - Go to Jenkins > Manage Jenkins > Manage Plugins
   - Install the following plugins if not already installed:
     - NodeJS
     - Pipeline
     - Workspace Cleanup

2. **Configure Node.js in Jenkins**
   - Go to Jenkins > Manage Jenkins > Global Tool Configuration
   - Under "NodeJS installations", add a new NodeJS installation
   - Name: `NodeJS` (must match the name in Jenkinsfile)
   - Select "Install automatically" and choose the version (18.x recommended)

3. **Create a New Pipeline Job**
   - Click "New Item" in Jenkins
   - Enter a name for your job (e.g., "electron-windows-build")
   - Select "Pipeline" and click OK

4. **Configure the Pipeline**
   - Under "Pipeline" section:
     - Select "Pipeline script from SCM"
     - Choose your SCM (Git, GitHub, etc.)
     - Enter your repository URL
     - Set the branch to build (e.g., `main` or `master`)
     - Set the script path to `Jenkinsfile`

5. **Configure Windows Build Agent (if needed)**
   - If you're building on Windows, ensure the agent has:
     - Visual Studio Build Tools with C++ workload
     - Python 3.x
     - Run as administrator: `npm install --global --production windows-build-tools`

6. **Build Triggers (Optional)**
   - Configure build triggers as needed (e.g., on push to repository)
   - Set up webhooks if using GitHub/GitLab

## Build Artifacts

After a successful build, the following artifacts will be available:

1. Windows Installer: `out/make/*.exe`
2. Unpacked Application: `out/HotRoute-win32-x64/`

## Troubleshooting

1. **Build Fails with Native Module Errors**
   - Ensure all build tools are installed
   - Run `npm rebuild` before building

2. **Node.js Version Mismatch**
   - Ensure the Node.js version in Jenkins matches your development environment
   - Update the `NODE_VERSION` in the Jenkinsfile if needed

3. **Permission Issues**
   - Run Jenkins service as a user with appropriate permissions
   - Ensure the build agent has write access to the workspace

## Customization

You can customize the build process by modifying the `Jenkinsfile`:

- Change the Node.js version in the `NODE_VERSION` environment variable
- Add additional build steps as needed
- Configure code signing for the Windows installer
- Add deployment steps to distribute the built application

## Security Considerations

1. Store sensitive information (like code signing certificates) in Jenkins Credentials
2. Use environment variables for sensitive configuration
3. Limit build agent permissions to only what's necessary

## Next Steps

1. Set up automated testing in the pipeline
2. Add code quality checks
3. Implement deployment to a download server
4. Set up notifications for build status
