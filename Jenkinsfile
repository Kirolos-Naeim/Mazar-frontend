pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo " Checked out branch: ${env.BRANCH_NAME ?: 'unknown'}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci || npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '.next/**', allowEmptyArchive: false
                echo 'Build artifacts archived from .next/'
            }
        }
    }

    post {
        always {
            echo "Pipeline finished with status: ${currentBuild.currentResult}"
        }
        success {
            echo 'Build succeeded! Artifacts are available in Jenkins.'
        }
        failure {
            echo 'Build failed. Check the logs above for details.'
        }
    }
}
