library identifier: 'jenkins-shared-library@main', retriever: modernSCM(
        [$class: 'GitSCMSource',
         remote: 'https://gitlab.com/Kirolos-Naeim-group/jenkins-shared-library.git',
         credentialsId: 'gitlab-credentional_1'
        ]
)
def gv

pipeline {
    agent none
    environment {
        DOCKER_REPO_SERVER = 'keroles149'
        DOCKER_REPO = "${DOCKER_REPO_SERVER}/mazar_frontend"
        IMAGE_NAME = "v1.0.${env.BUILD_NUMBER}"
    }
    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            agent { docker { image 'node:20-alpine' } }
            steps {
                checkout scm
                echo " Checked out branch: ${env.BRANCH_NAME ?: 'unknown'}"
            }
        }

        stage('Install Dependencies') {
            agent { docker { image 'node:20-alpine' } }
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            agent { docker { image 'node:20-alpine' } }
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            agent { docker { image 'node:20-alpine' } }
            steps {
                sh 'npm run build'
            }
        }

        stage('Build & Push Docker Image') {
            agent any
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', usernameVariable: 'USERNAME', passwordVariable: 'PASS')]) {
                        buildImage "${DOCKER_REPO}:${IMAGE_NAME}"
                        sh 'echo $PASS | docker login -u $USERNAME --password-stdin'
                        dockerPush "${DOCKER_REPO}:${IMAGE_NAME}"
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            agent any
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
