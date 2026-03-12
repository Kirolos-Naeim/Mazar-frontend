#!/usr/bin/env groovy
library identifier: 'jenkins-shared-library@main', retriever: modernSCM(
  [$class: 'GitSCMSource',
   remote: 'https://gitlab.com/Kirolos-Naeim-group/jenkins-shared-library.git',
   credentialsId: 'gitlab-credentional_1'
  ]
)

def gv

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
    stage('init') {
      steps {
        script {
          echo 'initiating frontend pipeline'
          gv = load 'script.groovy'
        }
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          installDependencies()
        }
      }
    }

    stage('Test') {
      steps {
        script {
          runTests()
        }
      }
    }

    stage('Build') {
      steps {
        script {
          buildApp()
        }
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
          def fullImage = "${DOCKER_IMAGE}:${imageTag}"

          dockerBuild(fullImage)

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
          script {
            sh '''
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            '''
            def version = sh(script: "node -p \"require('./package.json').version\"", returnStdout: true).trim()
            def imageTag = "${version}"
            def fullImage = "${DOCKER_IMAGE}:${imageTag}"

            dockerPush(fullImage)
          }
        }
      }
    }
  }

  post {
    always {
      echo 'Frontend pipeline finished'
    }
  }
}
