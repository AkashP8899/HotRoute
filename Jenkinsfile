pipeline {
    agent { label 'windows' }

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Install') {
            steps {
                bat 'npm install'
            }
        }

        stage('Make EXE') {
            steps {
                bat 'npm run make'
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'out/**'
            }
        }
    }
}
