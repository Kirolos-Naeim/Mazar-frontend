library identifier: 'jenkins-shared-library@main', retriever: modernSCM(
        [$class: 'GitSCMSource',
         remote: 'https://gitlab.com/Kirolos-Naeim-group/jenkins-shared-library.git',
         credentialsId: 'gitlab-credentional_1'
        ]
)
def gv

pipeline {
    agent {
        docker { image 'node:20-alpine' } 
    }
    environment {
        DOCKER_REPO_SERVER = 'keroles149'
        DOCKER_REPO = "${DOCKER_REPO_SERVER}/mazar_frontend"
        IMAGE_NAME = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        // docker push keroles149/mazar_frontend:tagname
    }
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
        stage("build image and push image ") {
            steps {
              script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', usernameVariable: 'USERNAME', passwordVariable: 'PASS')]) {
                    buildImage "${DOCKER_REPO}:${IMAGE_NAME}"
                    sh "echo $PASS | docker login -u $USERNAME --password-stdin ${DOCKER_REPO_SERVER}"
                    dockerPush "${DOCKER_REPO}:${IMAGE_NAME}"

                  }
            }
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
