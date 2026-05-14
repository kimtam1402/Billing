pipeline {
    agent any

    stages {
        stage('Kéo Code Mới Nhất') {
            steps {
                git branch: 'main', url: 'https://github.com/kimtam1402/Billing.git'
            }
        }
        
        stage('Khởi chạy Docker') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }

    // Khối lệnh chạy sau khi các stage trên hoàn thành
    post {
        success {
            // Thay <TOKEN_CỦA_BẠN> và <CHAT_ID_CỦA_BẠN> bằng số thật ở Bước 1 và 2
            sh """
            curl -s -X POST https://api.telegram.org/bot8338161451:AAGyMvSvO1jIdI3KUP0oNgZi0vAW1HMZwjI/sendMessage \
            -d chat_id=8612665676 \
            -d text="✅ [SUCCESS] Tuyệt vời! Code mới của dự án CineStream đã lên sóng thành công lúc \$(date '+%H:%M:%S')."
            """
        }
        failure {
            sh """
            curl -s -X POST https://api.telegram.org/bot8338161451:AAGyMvSvO1jIdI3KUP0oNgZi0vAW1HMZwjI/sendMessage \
            -d chat_id=8612665676 \
            -d text="❌ [FAILED] Báo động! Jenkins vừa deploy lỗi. Sếp mau vào máy chủ kiểm tra lại ngay nhé!"
            """
        }
    }
}