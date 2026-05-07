<script src="/assets/js/ui.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/auth.js"></script>
<script src="/assets/js/voice-input.js"></script>
<script src="/assets/js/carousel.js"></script>
<script src="/assets/js/video-player.js"></script>
<script src="/assets/js/ai-chat.js"></script>
<script src="/assets/js/flow.js"></script>
<script src="/assets/js/language.js"></script>
<script src="/assets/js/media-tracker.js"></script>
<script src="/assets/js/main.js"></script>
<?php foreach ($pageJs ?? [] as $js): ?>
<script src="<?= htmlspecialchars($js) ?>"></script>
<?php endforeach; ?>
</body>
</html>
