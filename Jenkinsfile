pipeline {
    agent any
    stages {
        stage('Kéo Code Mới Nhất') {
            steps {
                // CHÚ Ý: Thay link bên dưới bằng link GitHub dự án CineStream của bạn
                git branch: 'main', url: 'https://github.com/kimtam1402/Billing.git'
            }
        }
        stage('Khởi chạy Docker') {
            steps {
                // Tắt hệ thống cũ và bật hệ thống mới với code vừa kéo về
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }
}