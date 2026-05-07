<?php
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../config/mail.php';

class EmailService {

    public function sendVerification(string $email, string $code): bool {
        $confirmUrl = APP_DOMAIN . '/verify-email.php?code=' . $code . '&email=' . urlencode($email);
        $subject = 'Подтвердите регистрацию — ' . APP_NAME;
        $body    = "Здравствуйте!\n\nДля подтверждения регистрации перейдите по ссылке:\n$confirmUrl\n\nСсылка действительна 24 часа.\n\nЕсли вы не регистрировались — проигнорируйте это письмо.";
        return $this->send($email, $subject, $body);
    }

    public function sendCredentials(string $email, string $password): bool {
        $subject = 'Ваши данные для входа — ' . APP_NAME;
        $body    = "Здравствуйте!\n\nВаши данные для входа:\nЛогин: $email\nКод доступа: $password\n\nВойти можно через меню на сайте:\n" . APP_DOMAIN . "\n\nРекомендуем сохранить эти данные.";
        return $this->send($email, $subject, $body);
    }

    public function sendPasswordReset(string $email, string $code): bool {
        $subject = 'Сброс пароля — ' . APP_NAME;
        $body    = "Код для сброса пароля: $code\n\nДействителен 10 минут.\n\nЕсли вы не запрашивали сброс — проигнорируйте это письмо.";
        return $this->send($email, $subject, $body);
    }

    private function send(string $to, string $subject, string $body): bool {
        $headers = 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM . ">\r\nContent-Type: text/plain; charset=UTF-8";
        return mail($to, $subject, $body, $headers);
    }
}
