def installDependencies() {
    sh '''
      node -v
      npm -v
      npm ci || npm install
    '''
}

def runTests() {
    sh '''
      npm test
    '''
}

def buildApp() {
    sh '''
      npm run build
    '''
}

def dockerBuild(image) {
    sh """
      docker build \
        -t ${image} \
        .
    """
}

def dockerPush(image) {
    sh """
      docker push ${image}
    """
}
