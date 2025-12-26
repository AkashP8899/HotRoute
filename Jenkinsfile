pipeline {
    agent any
    
    environment {
        // Set Node.js version (adjust as needed)
        NODE_VERSION = '18.x'
        // Output directory for the build artifacts
        ARTIFACTS_DIR = "${env.WORKSPACE}/dist"
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from SCM
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                // Install Node.js using nvm
                script {
                    def nodeHome = tool name: 'NodeJS', type: 'nodejs'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                // Verify Node.js and npm versions
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                // Install project dependencies
                sh 'npm install'
                
                // Install Electron Builder globally if not using npx
                sh 'npm install -g electron-builder'
            }
        }
        
        stage('Build Application') {
            steps {
                // Run the build process
                sh 'npm run build'
            }
        }
        
        stage('Package Windows Executable') {
            steps {
                // Create Windows installer
                script {
                    // This will create a Windows installer (.exe) using electron-builder
                    // The configuration is read from package.json and forge.config.js
                    sh 'npx electron-builder --win --x64'
                    
                    // If you need to create a portable app instead, use:
                    // sh 'npx electron-builder --win --x64 --dir'
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                // Archive the generated artifacts
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                
                // Store the Windows installer as a build artifact
                archiveArtifacts artifacts: 'out/make/**/*.exe', allowEmptyArchive: true
                
                // Optional: Store the unpacked app directory
                archiveArtifacts artifacts: 'out/HotRoute-win32-x64/**/*', allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            // Clean up workspace after build
            cleanWs()
        }
        
        success {
            echo 'Windows build completed successfully!'
        }
        
        failure {
            echo 'Build failed!'
            // You can add additional failure handling here
        }
    }
}
