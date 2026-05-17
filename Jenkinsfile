pipeline {
    agent any

    tools {
        nodejs 'NodeJs 24'
    }

    environment {
        ADMIN_REPO_URL = 'git@github.com:vad-systems/Node-Media-Server-Admin.git'
        NMS_REPO_URL   = 'git@github.com:vad-systems/Node-Media-Server.git'

        ADMIN_GITHUB_CREDENTIALS_ID = 'github-Node-Media-Server-Admin-ssh'
        NMS_GITHUB_CREDENTIALS_ID   = 'github-Node-Media-Server-ssh'

        GIT_AUTHOR_NAME  = 'VAD Systems Jenkins'
        GIT_AUTHOR_EMAIL = 'jenkins@vad-systems.de'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {
        stage('Validate tag build') {
            steps {
                sh '''
                    set -eu

                    if [ -z "${TAG_NAME:-}" ]; then
                        echo "ERROR: This pipeline must be triggered by a Git tag in Node-Media-Server-Admin."
                        echo "Expected example: 0.1.0-dev18"
                        exit 1
                    fi

                    ADMIN_VERSION="${TAG_NAME#v}"
                    NMS_BRANCH="admin-${ADMIN_VERSION}"

                    echo "Admin tag:     ${TAG_NAME}"
                    echo "Admin version: ${ADMIN_VERSION}"
                    echo "NMS branch:    ${NMS_BRANCH}"

                    printf "%s" "${ADMIN_VERSION}" > admin-version.txt
                    printf "%s" "${NMS_BRANCH}" > nms-branch-name.txt
                '''
            }
        }

        stage('Checkout admin tag') {
            steps {
                dir('admin') {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "refs/tags/${env.TAG_NAME}"]],
                        userRemoteConfigs: [[
                            url: env.ADMIN_REPO_URL,
                            credentialsId: env.ADMIN_GITHUB_CREDENTIALS_ID
                        ]],
                        extensions: [
                            [$class: 'CleanBeforeCheckout'],
                            [$class: 'CloneOption', noTags: false, shallow: false]
                        ]
                    ])
                }
            }
        }

        stage('Build admin and verify committed dist') {
            steps {
                dir('admin') {
                    sh '''
                        set -eu

                        echo "Node version:"
                        node --version

                        echo "NPM version:"
                        npm --version

                        echo "Admin commit:"
                        git rev-parse HEAD

                        echo "Installing dependencies..."
                        npm ci

                        echo "Rebuilding dist from clean state..."
                        rm -rf dist/
                        npm run build

                        echo "Checking whether rebuilt dist matches committed dist from tag ${TAG_NAME}..."

                        if [ -n "$(git status --porcelain -- dist/)" ]; then
                            echo "ERROR: admin/dist differs after rebuild."
                            echo ""
                            echo "The Admin tag does not contain a reproducible committed dist/."
                            echo ""
                            echo "Expected developer workflow before tagging:"
                            echo "  npm ci"
                            echo "  npm run build"
                            echo "  git add dist"
                            echo "  git commit -m '<message>'"
                            echo "  git tag ${TAG_NAME}"
                            echo "  git push origin ${TAG_NAME}"
                            echo ""
                            echo "Changed files:"
                            git status --short -- dist/
                            echo ""
                            echo "Diff summary:"
                            git diff --stat -- dist/ || true
                            exit 1
                        fi

                        if [ ! -f dist/index.html ]; then
                            echo "ERROR: Expected admin/dist/index.html after build."
                            exit 1
                        fi

                        echo "Admin dist is reproducible and matches committed dist/."
                    '''
                }
            }
        }

        stage('Checkout NMS master') {
            steps {
                dir('nms') {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/master"]],
                        userRemoteConfigs: [[
                            url: env.NMS_REPO_URL,
                            credentialsId: env.NMS_GITHUB_CREDENTIALS_ID
                        ]],
                        extensions: [
                            [$class: 'CleanBeforeCheckout'],
                            [$class: 'CloneOption', noTags: false, shallow: false]
                        ]
                    ])
                }
            }
        }

        stage('Create NMS branch') {
            steps {
                dir('nms') {
                    sshagent(credentials: [env.NMS_GITHUB_CREDENTIALS_ID]) {
                        sh '''
                            set -eu

                            BRANCH_NAME="$(cat ../nms-branch-name.txt)"

                            git config user.name "${GIT_AUTHOR_NAME}"
                            git config user.email "${GIT_AUTHOR_EMAIL}"

                            echo "Checking whether remote branch already exists: ${BRANCH_NAME}"

                            if git ls-remote --exit-code --heads origin "${BRANCH_NAME}" >/dev/null 2>&1; then
                                echo "ERROR: Remote branch already exists: ${BRANCH_NAME}"
                                echo "Please delete the old branch or choose a new Admin tag/version."
                                exit 1
                            fi

                            git checkout -b "${BRANCH_NAME}"

                            echo "Created local branch: ${BRANCH_NAME}"
                        '''
                    }
                }
            }
        }

        stage('Embed admin dist into NMS public') {
            steps {
                sh '''
                    set -eu

                    echo "Clearing nms/public..."
                    mkdir -p nms/public
                    find nms/public -mindepth 1 -maxdepth 1 -exec rm -rf {} +

                    echo "Copying admin/dist into nms/public..."
                    cp -R admin/dist/. nms/public/

                    if [ ! -f nms/public/index.html ]; then
                        echo "ERROR: Expected nms/public/index.html after copying Admin dist."
                        exit 1
                    fi

                    echo "Moving index.html to nms/public/admin/index.html..."
                    mkdir -p nms/public/admin
                    mv nms/public/index.html nms/public/admin/index.html

                    echo "Resulting NMS public files:"
                    find nms/public -maxdepth 3 -type f | sort | head -200
                '''
            }
        }

        stage('Commit and push NMS branch') {
            steps {
                dir('nms') {
                    sshagent(credentials: [env.NMS_GITHUB_CREDENTIALS_ID]) {
                        sh '''
                            set -eu

                            BRANCH_NAME="$(cat ../nms-branch-name.txt)"
                            ADMIN_VERSION="$(cat ../admin-version.txt)"

                            git add public

                            if git diff --cached --quiet; then
                                echo "No changes in NMS public/. Nothing to commit."
                                echo "Admin ${ADMIN_VERSION} is already reflected in NMS public."
                                exit 0
                            fi

                            echo "Files staged for commit:"
                            git status --short

                            git commit -m "upd: new admin ${ADMIN_VERSION}"

                            echo "Pushing branch ${BRANCH_NAME}..."
                            git push --set-upstream origin "${BRANCH_NAME}"

                            echo "Successfully pushed NMS branch: ${BRANCH_NAME}"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            sh '''
                rm -f admin-version.txt nms-branch-name.txt || true
            '''
        }

        success {
            echo 'Admin workflow completed successfully.'
        }

        failure {
            echo 'Admin workflow failed.'
        }
    }
}
