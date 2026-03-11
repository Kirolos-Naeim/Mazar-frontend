pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
    DOCKER_IMAGE = 'kirolosnaeim/mazar-frontend'
  }

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      agent {
        docker {
          image 'node:20-bullseye'
        }
      }
      steps {
        sh '''
          node -v
          npm -v
          npm ci || npm install
        '''
      }
    }

    stage('Build') {
      agent {
        docker {
          image 'node:20-bullseye'
        }
      }
      steps {
        sh '''
          node -v
          npm -v
          npm run build
        '''
      }
    }

    stage('Version & Tag') {
      when {
        branch 'prod_branch'
      }
      steps {
        script {
          def bumpType = 'patch'

          sh '''
            git config user.name "Jenkins CI"
            git config user.email "ci@local"
          '''

          sh "npm version ${bumpType} -m \"chore(release): %s\""

          withCredentials([sshUserPrivateKey(
            credentialsId: 'github-ssh',
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'GIT_SSH_USER'
          )]) {
            sh '''
              export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"
              git push origin HEAD:prod_branch --follow-tags
            '''
          }
        }
      }
    }

    stage('Docker Build') {
      when {
        branch 'prod_branch'
      }
      steps {
        script {
          def version = sh(script: "node -p \"require('./package.json').version\"", returnStdout: true).trim()
          def imageTag = "${version}"

          sh """
            docker build \
              -t ${DOCKER_IMAGE}:${imageTag} \
              -t ${DOCKER_IMAGE}:latest \
              .
          """

          env.APP_VERSION = version
        }
      }
    }

    stage('Docker Push') {
      when {
        branch 'prod_branch'
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${DOCKER_IMAGE}:latest
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished'
    }
  }
}
